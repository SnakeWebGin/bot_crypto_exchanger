import {inject, injectable} from "inversify";
import {interval} from "rxjs/observable/interval";
import {filter} from "rxjs/operators/filter";
import {ChainId, Fetcher, Route} from "@uniswap/sdk";
import {BaseChildThread} from "../services/multithreads/childRequirements/BaseChildThread";
import {IBaseChildThread, IExchangerInitData, IExchangerPrice, ILogger, IThreadChild} from "../guards";

@injectable()
export default class ExchangerV2Thread extends BaseChildThread implements IBaseChildThread {
    private _busy = false;

    constructor(
        @inject(ILogger.serviceId) protected _logger: ILogger,
        @inject(IThreadChild.serviceId) protected _threadChild: IThreadChild,
    ) {
        super(_threadChild);
    }

    protected init(initData: unknown): Promise<void> {
        if (!IExchangerInitData.guard(initData)) {
            const error = `IExchangerInitData is not valid! ${JSON.stringify(initData)}`;
            this._logger.err(error);
            return Promise.reject(error);
        }

        interval(1000)
            .pipe(filter(_ => !this._busy))
            .subscribe(async _ => {
                this._busy = true;

                try {
                    const data = await this.getMidPrice(initData);
                    this._threadChild.response$.next({
                        method: 'emitPrice',
                        data
                    })
                } catch (e) {
                    this._logger.err(`Error: ${e.message}`, e.stack);
                } finally {
                    this._busy = false;
                }
            });
    }

    private async getMidPrice(data: IExchangerInitData): Promise<IExchangerPrice> {
        const tokenA = await Fetcher.fetchTokenData(ChainId.MAINNET, data.fromToken, undefined, data.from);
        if (!tokenA) {
            throw new Error(`Token "${data.from}" not found!`);
        }

        const tokenB = await Fetcher.fetchTokenData(ChainId.MAINNET, data.toToken, undefined, data.to);
        if (!tokenB) {
            throw new Error(`Token "${data.to}" not found!`);
        }

        const pair = await Fetcher.fetchPairData(tokenA, tokenB);
        const route = new Route([pair], tokenA, tokenB);

        return {
            aSymbol: data.from,
            bSymbol: data.to,
            a2bPrice: route.midPrice.toSignificant(6),
            b2aPrice: route.midPrice.invert().toSignificant(6)
        };
    }
}
