import {inject, injectable} from "inversify";
import axios from "axios";
import {interval} from "rxjs/observable/interval";
import {filter} from "rxjs/operators/filter";
import { ethers } from "ethers";
import { abi as IUniswapV3PoolABI  } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { abi as QuoterABI } from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import {BaseChildThread} from "../services/multithreads/childRequirements/BaseChildThread";
import {IBaseChildThread, IExchangerInitData, IExchangerPrice, ILogger, IThreadChild} from "../guards";
import {configs} from "../configs";

@injectable()
export default class ExchangerV3Thread extends BaseChildThread implements IBaseChildThread {
    private readonly _quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
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

        this._provider = new ethers.providers.JsonRpcProvider(configs.INFURA_URL);

        interval(1000)
            .pipe(filter(_ => !this._busy))
            .subscribe(async _ => {
                this._busy = true;

                try {
                    const data = await this.getPrice(1);
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

    private async getPrice(inputAmount: number): Promise<IExchangerPrice> {
        const poolAddress = '0xcbcdf9626bc03e24f779434178a73a0b4bad62ed'

        const poolContract = new ethers.Contract(
            poolAddress,
            IUniswapV3PoolABI,
            this._provider
        )

        const tokenAddress0 = await poolContract.token0();
        const tokenAddress1 = await poolContract.token1();

        const tokenAbi0 = await this.getAbi(tokenAddress0)
        const tokenAbi1 = await this.getAbi(tokenAddress1)

        const tokenContract0 = new ethers.Contract(
            tokenAddress0,
            tokenAbi0,
            this._provider
        )
        const tokenContract1 = new ethers.Contract(
            tokenAddress1,
            tokenAbi1,
            this._provider
        )

        const tokenSymbol0 = await tokenContract0.symbol()
        const tokenSymbol1 = await tokenContract1.symbol()
        const tokenDecimals0 = await tokenContract0.decimals()
        const tokenDecimals1 = await tokenContract1.decimals()

        const quoterContract = new ethers.Contract(
            this._quoterAddress,
            QuoterABI,
            this._provider
        )

        const immutables = await this.getPoolImmutables(poolContract)

        const amountIn = ethers.utils.parseUnits(
            inputAmount.toString(),
            tokenDecimals0
        );

        const amountRevertIn = ethers.utils.parseUnits(
            inputAmount.toString(),
            tokenDecimals1
        )

        const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
            immutables.token0,
            immutables.token1,
            immutables.fee,
            amountIn,
            0
        );

        const quotedAmountRevertOut = await quoterContract.callStatic.quoteExactInputSingle(
            immutables.token1,
            immutables.token0,
            immutables.fee,
            amountRevertIn,
            0
        );

        const amountOut = ethers.utils.formatUnits(quotedAmountOut, tokenDecimals1);
        const amountRevertOut = ethers.utils.formatUnits(quotedAmountRevertOut, tokenDecimals0);

        return {
            aSymbol: tokenSymbol0,
            bSymbol: tokenSymbol1,
            a2bPrice: amountOut,
            b2aPrice: amountRevertOut,
        };
    }


    private async getAbi(address: string): Promise<string> {
        const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${configs.ETHERSCAN_API_KEY}`;
        const res = await axios.get(url);
        return JSON.parse(res.data.result);
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
