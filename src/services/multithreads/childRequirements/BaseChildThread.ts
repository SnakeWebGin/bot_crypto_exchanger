import {inject, injectable} from 'inversify';
import {Subject} from 'rxjs/Subject';
import {IBaseChildThread, IThreadChild, IThreadData, IThreadError} from '../../../guards';

@injectable()
export abstract class BaseChildThread implements IBaseChildThread {
    protected constructor(
        @inject(IThreadChild.serviceId) protected _threadChild: IThreadChild,
    ) {
        this.request$.subscribe(request => {
            (async () => {
                if (request.method === 'init') {
                    await this.init(request.data);
                    // @ts-ignore
                    this.response$.next({ state: 'initted' });
                    return;
                }

                if (request.method === 'destroy') {
                    this.response$.next({
                        method: 'destroy',
                        requestId: request.requestId
                    });
                    this.onDestroy();
                    this._threadChild.destroy();
                    process.exit();
                    return;
                }

                const data = await this.execute(request.method, request.data);
                this.response$.next({
                    method: request.method,
                    data,
                    requestId: request.requestId
                });
            })();
        });
    }

    get request$(): Subject<IThreadData> {
        return this._threadChild.request$;
    }

    get response$(): Subject<IThreadData | IThreadError> {
        return this._threadChild.response$;
    }

    protected onDestroy(): void {

    }

    protected abstract init(data?: Object): Promise<void>;
    protected abstract execute(method: string, data: unknown): Promise<Object | undefined>;
}
