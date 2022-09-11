import fs from 'fs';
import path from 'path';
import {inject, injectable} from 'inversify';
import {Subject} from 'rxjs/Subject';
import {IBaseChildThread, ILogger, IThreadChild, IThreadData, IThreadError} from '../../../guards';

@injectable()
export class ThreadChild implements IThreadChild {
    readonly request$: Subject<IThreadData> = new Subject<IThreadData>();
    readonly response$: Subject<IThreadData | IThreadError> = new Subject<IThreadData | IThreadError>();

    constructor(
        @inject(ILogger.serviceId) protected _logger: ILogger,
    ) {
        process.on('message', (message: unknown) => {
            if (!IThreadData.guard(message)) {
                this._logger.err(`ThreadChild IThreadData is not valid! ${JSON.stringify(message)}`);
                return;
            }

            Promise.resolve().then(() => this.request$.next(message));
        });

        this.response$.subscribe(data => {
            process.send(
                data,
                undefined,
                undefined,
                error => error && this._logger.err(`Child send error! ${error.message}!`, error.stack)
            );
        });

        process.on('exit', _ => this.destroy());
        try {

        } catch (e) {

        }
    }

    async initConnectionClass(childPathFile: string): Promise<new (...args: any[]) => IBaseChildThread> {
        try {
            const filepath = path.resolve(`./${childPathFile}`);
            if (!fs.existsSync(filepath)) {
                this._logger.err(`Child node filepath "${filepath}" not found!`);
                return;
            }

            const itemClass = await import(filepath);
            if (!itemClass) {
                this._logger.err(`Child node connection class "${childPathFile}" is empty!`);
                return;
            }

            if (itemClass && itemClass.default === undefined) {
                this._logger.err(`Child node error! ${Object.keys(itemClass)[0]} need export as default!`);
                return;
            }

            return itemClass.default;
        } catch (e) {
            this._logger.err(`Child error! ${e.message}!`, e.stack);
        }
    }

    destroy(): void {
        this.request$.complete();
        this.response$.complete();
    }
}
