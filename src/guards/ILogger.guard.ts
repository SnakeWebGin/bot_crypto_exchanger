import { interfaces } from 'inversify';
import {PropTypes, validateVariable} from './PropType';

export enum ILoggerType {
    INFO = 0,
    WARN = 1,
    RAW = 2,
    ERROR = 3
}

export interface ILogger {
    log(message: string, level?: ILoggerType): void;
    warn(message: string): void;
    info(message: string): void;
    raw(message: string): void;
    err(message: string, stack?: string): void;
}

export namespace ILogger {
    export const serviceId: interfaces.ServiceIdentifier<ILogger> = Symbol('ILogger');
}


interface IClientLog {
    type: 'log'| 'error';
    message: string;
    stack?: string;
}

export namespace IClientLog {
    export const guard = (data: unknown): data is IClientLog => {
        return validateVariable((data as IClientLog), PropTypes.shape({
            type: PropTypes.oneOf(['log', 'error']),
            message: PropTypes.string.isRequired,
            stack: PropTypes.string,
        }).isRequired);
    };
}
