import {inject, injectable} from "inversify";
import {interval} from "rxjs/observable/interval";
import {filter} from "rxjs/operators/filter";
import {ChainId, FACTORY_ADDRESS, Fetcher, INIT_CODE_HASH, Pair, Route, Token, TokenAmount, WETH} from "@uniswap/sdk";
import {getCreate2Address} from "@ethersproject/address";
import {keccak256, pack} from "@ethersproject/solidity";
import {BaseChildThread} from "../services/multithreads/childRequirements/BaseChildThread";
import {IBaseChildThread, IExchangerInitData, ILogger, IThreadChild} from "../guards";

@injectable()
export default class ExchangerV3Thread extends BaseChildThread implements IBaseChildThread {
    private _busy = false;
    private _fromToken: Token;
    private _toToken: Token;

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

        this._fromToken = new Token(ChainId.MAINNET, initData.fromToken, 18, initData.from)
        this._toToken = new Token(ChainId.MAINNET, initData.toToken, 18, initData.to)

        interval(1000)
            .pipe(filter(_ => !this._busy))
            .subscribe(async _ => {
                try {
                    const data = initData.to === 'WETH'
                        ? await this.getWETHPrice(initData)
                        : await this.getPrice(initData);

                    this._threadChild.response$.next({
                        method: 'getPrice',
                        data
                    })
                } catch (e) {
                    this._logger.err(`Error: ${e.message}`, e.stack);
                }
            });
    }

    private async getPair(tokenA: Token, tokenB: Token): Promise<Pair> {
        try {
            return await Fetcher.fetchPairData(tokenA, tokenB);
        } catch (e) {
            this._logger.err(`Address not found! TokenA: "${tokenA.address}" | TokenB: "${tokenB.address}"`);
            return undefined;
        }
    }

    private async getWETHPrice(data: IExchangerInitData): Promise<{ from: string, to: string, price: string, invertPrice: string }> {
        const pair = await this.getPair(this._fromToken, WETH[this._toToken.chainId]);
        const route = new Route([pair], WETH[this._toToken.chainId])

        return {
            from: data.from,
            to: data.to,
            price: route.midPrice.toSignificant(6),
            invertPrice: route.midPrice.invert().toSignificant(6)
        }
    }

    private async getPrice(data: IExchangerInitData): Promise<{ from: string, to: string, price: string, invertPrice: string }> {
        const firstPair = await this.getPair(this._fromToken, WETH[ChainId.MAINNET]);
        const secondPair = await this.getPair(this._toToken, this._fromToken);

        if (!firstPair || !secondPair) {
            return undefined;
        }

        const route = new Route([firstPair, secondPair], WETH[ChainId.MAINNET])

        return {
            from: data.from,
            to: data.to,
            price: route.midPrice.toSignificant(6),
            invertPrice: route.midPrice.invert().toSignificant(6)
        }
    }

    getPrice2(data: IExchangerInitData): Promise<void> {
        const fisrt = new Token(ChainId.MAINNET, '0xc0FFee0000000000000000000000000000000000', 18, 'HOT', 'Caffeine')
        const second = new Token(ChainId.MAINNET, '0xDeCAf00000000000000000000000000000000000', 18, 'NOT', 'Caffeine')

        const pair = new Pair(new TokenAmount(fisrt, '2000000000000000000'), new TokenAmount(NOT, '1000000000000000000'))

        console.log('>>>>>pair', pair);
    }
}
