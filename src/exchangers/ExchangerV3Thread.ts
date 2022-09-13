import {inject, injectable} from "inversify";
import {interval} from "rxjs/observable/interval";
import {filter} from "rxjs/operators/filter";
import { ethers } from "ethers";
import { Token } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import { abi as IUniswapV3PoolABI  } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import {BaseChildThread} from "../services/multithreads/childRequirements/BaseChildThread";
import {IBaseChildThread, IExchangerInitData, IExchangerPrice, ILogger, IThreadChild} from "../guards";
import {configs} from "../configs";

interface State {
    liquidity: ethers.BigNumber
    sqrtPriceX96: ethers.BigNumber
    tick: number
    observationIndex: number
    observationCardinality: number
    observationCardinalityNext: number
    feeProtocol: number
    unlocked: boolean
}

@injectable()
export default class ExchangerV3Thread extends BaseChildThread implements IBaseChildThread {
    private _provider: ethers.providers.JsonRpcProvider;
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

        if (/--\s/.test(configs.INFURA_URL)) {
            this._logger.warn(`For using Uniswap V3 you need to set up a "INFURA_URL" in ./configs/index.ts`);
            return;
        }

        this._provider = new ethers.providers.JsonRpcProvider(configs.INFURA_URL);

        interval(1000)
            .pipe(filter(_ => !this._busy))
            .subscribe(async _ => {
                this._busy = true;

                try {
                    const data = await this.getPrice(initData);
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

    private async getPrice(data: IExchangerInitData): Promise<IExchangerPrice> {
        const poolContract = new ethers.Contract(data.poolAddress, IUniswapV3PoolABI, this._provider);

        const [immutables, state] = await Promise.all([this.getPoolImmutables(poolContract), this.getPoolState(poolContract)]);

        const TokenA = new Token(3, immutables.token0, data.fromDecimals, data.from);
        const TokenB = new Token(3, immutables.token1, data.toDecimals, data.to);

        const poolExample = new Pool(
            TokenA,
            TokenB,
            immutables.fee as any,
            state.sqrtPriceX96.toString(),
            state.liquidity.toString(),
            state.tick
        );

        const token0Price = poolExample.token0Price.toSignificant(6);
        const token1Price = poolExample.token1Price.toSignificant(6);

        return {
            aSymbol: data.from,
            bSymbol: data.to,
            a2bPrice: token0Price,
            b2aPrice: token1Price
        }
    }

    async getPoolState(poolContract: ethers.Contract): Promise<State> {
        const [liquidity, slot] = await Promise.all([poolContract.liquidity(), poolContract.slot0()])

        return {
            liquidity,
            sqrtPriceX96: slot[0],
            tick: slot[1],
            observationIndex: slot[2],
            observationCardinality: slot[3],
            observationCardinalityNext: slot[4],
            feeProtocol: slot[5],
            unlocked: slot[6],
        }
    }

    private async getPoolImmutables (poolContract: ethers.Contract): Promise<{token0: string, token1: string, fee: string}> {
        const [token0, token1, fee] = await Promise.all([
            poolContract.token0(),
            poolContract.token1(),
            poolContract.fee(),
        ]);

        return {
            token0,
            token1,
            fee
        }
    }
}
