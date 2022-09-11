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
            MATIC: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'
        };

        await this._exchangers.init([
            { from: 'USDT', fromToken: tokens.USDT, to: 'WETH', toToken: tokens.WETH },
            { from: 'USDC', fromToken: tokens.USDC, to: 'WETH', toToken: tokens.WETH },
            // { from: 'WETH', fromToken: tokens.WETH, to: 'MATIC', toToken: tokens.MATIC },
        ]);

        this._mainStateMachine.act('ready');
    }

    async onError(err: { message: string; stack: string }): Promise<void> {
        this._logger.err(err.message, err.stack);
        return super.onError(err);
    }
}
