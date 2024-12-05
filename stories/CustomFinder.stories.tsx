import React, { useState, useMemo, useCallback, useRef } from 'react';

import { action } from '@storybook/addon-actions';

import { Scanner as ScannerComp, IScannerProps, outline, boundingBox, centerText, useDevices, IFinderProps } from '../src';

const SCAN_DELAY = 1000;

const styles = {
    container: {
        width: 400,
        margin: 'auto'
    },
    controls: {
        marginBottom: 8
    }
};

interface IMyFinderProps extends IFinderProps {
    foundCode: boolean;
}

/**
 * Create a custom finder UI that has a rounded border and indicates when a code is read
 */
function MyFinder({ scanning, foundCode }: IMyFinderProps) {
    const color = useMemo(() => {
        if (!scanning) {
            return 'yellow';
        }
        return foundCode ? 'green' : 'white';
    }, [scanning]);

    return (
        <div style={{ position: 'relative' }}>
            <svg
                viewBox="0 0 100 100"
                style={{
                    top: 0,
                    left: 0,
                    zIndex: 1
                }}
            >
                {/* Create shaded viewable area */}
                <mask id="viewMask">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    <rect x="10" y="10" width="80" height="80" rx="15" fill="black" />
                </mask>
                <rect x="0" y="0" width="100" height="100" mask="url(#viewMask)" fill="black" opacity={0.2} />

                {/* Add finder borer */}
                <rect x="10" y="10" width="80" height="80" rx="15" fill="transparent" stroke={color} strokeWidth={0.5} />
            </svg>
        </div>
    );
}

function Template(args: IScannerProps) {
    const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
    const [tracker, setTracker] = useState<string | undefined>('centerText');

    const [pause, setPause] = useState(false);
    const [foundCode, setFoundCode] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const devices = useDevices();

    function getTracker() {
        switch (tracker) {
            case 'outline':
                return outline;
            case 'boundingBox':
                return boundingBox;
            case 'centerText':
                return centerText;
            default:
                return undefined;
        }
    }

    const onScan = useCallback((detectedCodes) => {
        action('onScan')(detectedCodes);
        setFoundCode(detectedCodes.length > 0);

        // Clear found code after a delay
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setFoundCode(false);
        }, SCAN_DELAY);
    }, []);

    /**
     * Wrap the custom finder and pass a true/false value to indicate if a code was found
     */
    const WrappedFinder = useCallback(
        (props: IFinderProps) => {
            return <MyFinder {...props} foundCode={foundCode} />;
        },
        [foundCode]
    );

    return (
        <div style={styles.container}>
            <button style={{ marginBottom: 5 }} onClick={() => setPause((val) => !val)}>
                {pause ? 'Pause Off' : 'Pause On'}
            </button>
            <div style={styles.controls}>
                <select onChange={(e) => setDeviceId(e.target.value)}>
                    <option value={undefined}>Select a device</option>
                    {devices.map((device, index) => (
                        <option key={index} value={device.deviceId}>
                            {device.label}
                        </option>
                    ))}
                </select>
                <select style={{ marginLeft: 5 }} onChange={(e) => setTracker(e.target.value)}>
                    <option value="centerText">Center Text</option>
                    <option value="outline">Outline</option>
                    <option value="boundingBox">Bounding Box</option>
                    <option value={undefined}>No Tracker</option>
                </select>
            </div>
            <ScannerComp
                {...args}
                formats={[
                    'qr_code',
                    'micro_qr_code',
                    'rm_qr_code',
                    'maxi_code',
                    'pdf417',
                    'aztec',
                    'data_matrix',
                    'matrix_codes',
                    'dx_film_edge',
                    'databar',
                    'databar_expanded',
                    'codabar',
                    'code_39',
                    'code_93',
                    'code_128',
                    'ean_8',
                    'ean_13',
                    'itf',
                    'linear_codes',
                    'upc_a',
                    'upc_e'
                ]}
                constraints={{
                    deviceId: deviceId
                }}
                onScan={onScan}
                onError={(error) => {
                    console.log(`onError: ${error}'`);
                }}
                components={{
                    audio: false,
                    onOff: false,
                    torch: true,
                    zoom: true,
                    finder: WrappedFinder,
                    tracker: getTracker()
                }}
                allowMultiple={true}
                scanDelay={SCAN_DELAY}
                paused={pause}
            />
        </div>
    );
}

export const CustomFinder = Template.bind({});

// @ts-ignore
CustomFinder.args = {};

export default {
    title: 'Custom Finder'
};
