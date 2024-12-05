import { TrackFunction } from './index';
import { FinderComponentFunction } from './FinderComponentFunction';

export interface IScannerComponents {
    tracker?: TrackFunction;
    audio?: boolean;
    onOff?: boolean;
    finder?: boolean | FinderComponentFunction;
    torch?: boolean;
    zoom?: boolean;
}
