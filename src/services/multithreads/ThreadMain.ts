import {inject, injectable} from 'inversify';
import {ChildProcess, fork} from 'child_process';
import {Subject} from 'rxjs/Subject';
import {ILogger, IThreadData, IThreadError, IThreadMain, IThreadState} from '../../guards';
import {uuidGenerate} from '../../helpers/uuidGenerator';
import {filter} from 'rxjs/operators/filter';
import {take} from 'rxjs/operators';

@injectable()
export class ThreadMain implements IThreadMain {
    id: string;
    request$: Subject<IThreadData> = new Subject<IThreadData>();
    response$: Subject<IThreadData> = new Subject<IThreadData>();

    private _process: ChildProcess;
    private _tsPathFile: string;

    constructor(
        @inject(ILogger.serviceId) protected _logger: ILogger,
    ) {
        this.id = uuidGenerate();

        this.request$.subscribe(request => {
            if (!this._process || !this._process.connected) {
                this._logger.err(`Process ${this._tsPathFile} not found or killed!`);
                return;
            }

            Promise.resolve()
                .then(() => this._process.send(
                    request, error => error && this._logger.err(`ThreadMain error! ${error.message}!`, error.stack)));
        });
    }

    init(tsPathFile: string, initData?: unknown): Promise<string> {
        this._tsPathFile = `./src/${tsPathFile}`;

        return new Promise((resolve, reject) => {
            try {
                this._process = fork(`./src/services/multithreads/childRequirements/index` ,  [this._tsPathFile], { execArgv: [ './node_modules/ts-node/dist/bin.js' ] });
                this._process.on('message', (message: unknown) => {
                    if (IThreadState.guard(message)) {
                        if (message.state === 'initted') {
                            resolve(this.id);
                            return;
                        }
                    }

                    if (IThreadError.guard(message)) {
                        this._logger.err(`IThreadError main: ${message.error}!`, message.stack);
                        return;
                    }

                    if (!IThreadData.guard(message)) {
                        this._logger.err(`ThreadMain file ${tsPathFile} error! IThreadData not valid! ${JSON.stringify(message)}`);
                        return;
                    }

                    this.response$.next(message);
                });

                this._process.send(<IThreadData>{
                    method: 'init',
                    data: initData
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async destroy(): Promise<void> {
        if (!this._process) { return; }
        const promise = this.response$.pipe(filter(e => e && e.method === 'destroy'), take(1)).toPromise();
        this.request$.next({ method: 'destroy' });
        await promise;
        this._process = undefined;
    }
}
