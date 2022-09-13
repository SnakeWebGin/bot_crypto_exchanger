import {injectable} from 'inversify';
import * as winston from 'winston';
import {ILogger, ILoggerType} from '../guards';

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 5
};

@injectable()
export class Logger implements ILogger {
    private _logger: winston.Logger;

    constructor() {
        this._logger = winston.createLogger({
            levels,
            format: winston.format.json(),
            transports: [
                new winston.transports.Console({ level: 'info' }),
                new winston.transports.File({ filename: './logs/error.log', level: 'error', maxFiles: 5, maxsize: 10 * 1024 * 1024 }),
                new winston.transports.File({ filename: './logs/debug.log', level: 'debug', maxFiles: 20, maxsize: 100 * 1024 * 1024 }),
            ],
        });
    }

    log(message: string, level: ILoggerType): void {
        message = message || '';
        level = level || ILoggerType.INFO;
        switch (level) {
            case ILoggerType.ERROR:
                this._logger.log({
                    level: 'error',
                    message
                });
                break;
            case ILoggerType.WARN:
                this._logger.log({
                    level: 'warn',
                    message
                });
                break;
            case ILoggerType.INFO:
                this._logger.log({
                    level: 'info',
                    message
                });
                break;
            case ILoggerType.RAW:
                this._logger.log({
                    level: 'debug',
                    message
                });
        }
    }

    warn(message: string): void {
        this.log(message, ILoggerType.WARN);
    }

    info(message: string): void {
        this.log(message, ILoggerType.INFO);
    }

    raw(message: string): void {
        this.log(message, ILoggerType.RAW);
    }

    err(message: string, stack?: string): void {
        this.log(message + ':' + stack, ILoggerType.ERROR);
    }
}

