import {inject, injectable} from "inversify";
import {interval} from "rxjs/observable/interval";
import {BaseChildThread} from "../services/multithreads/childRequirements/BaseChildThread";
import {IBaseChildThread, IExchangerInitData, ILogger, IThreadChild} from "../guards";

@injectable()
export default class ExchangerV3Thread extends BaseChildThread implements IBaseChildThread {
    private _from?: string;
    private _to?: string;

    constructor(
        @inject(ILogger.serviceId) protected _logger: ILogger,
        @inject(IThreadChild.serviceId) protected _threadChild: IThreadChild,
    ) {
        super(_threadChild);
    }

    protected init(data: unknown): Promise<void> {
        if (!IExchangerInitData.guard(data)) {
            const error = `IExchangerInitData is not valid! ${JSON.stringify(data)}`;
            this._logger.err(error);
            return Promise.reject(error);
        }

        this._from = data.from;
        this._to = data.to;

        interval(1000)
            .subscribe(_ => this._threadChild.response$.next({
                method: 'test',
                data: `V2 = ${JSON.stringify(data)}`
            }));
        console.log('>>>INITTED', data);
    }
}
