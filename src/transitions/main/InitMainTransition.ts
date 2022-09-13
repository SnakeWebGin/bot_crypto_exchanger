import {inject, injectable} from "inversify";
import {AbstractTransition} from "../AbstractTransition";
import {IExchangers, ILogger, IStateMachine, ITransition} from "../../guards";

@injectable()
export class InitMainTransition extends AbstractTransition implements ITransition {
    constructor(
        @inject(ILogger.serviceId) protected _logger: ILogger,
        @inject(IStateMachine.serviceMainId) protected _mainStateMachine: IStateMachine,
        @inject(IExchangers.serviceId) protected _exchangers: IExchangers,
    ) {
        super();
    }

    async onIntro(): Promise<void> {
        const tokens = {
            USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
        };

        await this._exchangers.init([
            {
                from: 'WETH',
                fromToken: tokens.WETH,
                fromDecimals: 18,
                to: 'USDT',
                toToken: tokens.USDT,
                toDecimals: 6,
                poolAddress: '0x11b815efb8f581194ae79006d24e0d814b7697f6',
            },
            {
                from: 'USDC',
                fromToken: tokens.USDC,
                fromDecimals: 6,
                to: 'WETH',
                toToken: tokens.WETH,
                toDecimals: 18,
                poolAddress: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640'
            },
            {
                from: 'DAI',
                fromToken: tokens.DAI,
                fromDecimals: 18,
                to: 'WETH',
                toToken: tokens.WETH,
                toDecimals: 18,
                poolAddress: '0x60594a405d53811d3bc4766596efd80fd545a270'
            },
        ]);
    }

    async onError(err: { message: string; stack: string }): Promise<void> {
        this._logger.err(err.message, err.stack);
        return super.onError(err);
    }
}
