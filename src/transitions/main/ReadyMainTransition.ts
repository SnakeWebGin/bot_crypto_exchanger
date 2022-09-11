import {inject, injectable} from "inversify";
import {AbstractTransition} from "../AbstractTransition";
import {IExchangers, ILogger, ITransition} from "../../guards";

@injectable()
export class ReadyMainTransition extends AbstractTransition implements ITransition {
    constructor(
        @inject(ILogger.serviceId) protected _logger: ILogger,
        @inject(IExchangers.serviceId) protected _exchangers: IExchangers,
    ) {
        super();
    }

    onIntro(): Promise<void> {
        console.log('>>>>>>ready intro');

        this._exchangers.currencyValue$.subscribe(data => {
            console.log(data);
        })

        return Promise.resolve(undefined);
    }

    async onError(err: { message: string; stack: string }): Promise<void> {
        this._logger.err(err.message, err.stack);
        return super.onError(err);
    }
}
