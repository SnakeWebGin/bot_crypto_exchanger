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
        console.log('>>>>>>init intro');
        await this._exchangers.init([
            { from: 'USDT', to: 'ETH' },
            { from: 'USDC', to: 'WETH' },
            { from: 'WETH', to: 'WBTC' },
        ]);
        console.log('>>>>>>init outro');
        this._mainStateMachine.act('ready');
    }

    async onError(err: { message: string; stack: string }): Promise<void> {
        this._logger.err(err.message, err.stack);
        return super.onError(err);
    }
}
