import {inject, injectable} from "inversify";
import {AbstractTransition} from "../AbstractTransition";
import {IExchangers, ILogger, IStateMachine, ITransition} from "../../guards";
import {interval} from "rxjs/observable/interval";
import {take} from "rxjs/operators";

@injectable()
export class IdleMainTransition extends AbstractTransition implements ITransition {
    constructor(
        @inject(ILogger.serviceId) protected _logger: ILogger,
        @inject(IExchangers.serviceId) protected _exchangers: IExchangers,
        @inject(IStateMachine.serviceMainId) protected _mainStateMachine: IStateMachine,
    ) {
        super();
    }

    onIntro(): Promise<void> {
        interval(1000 * 5)
            .pipe(take(1))
            .subscribe(_ => {
                this._mainStateMachine.act('writeLog');
            });

        return Promise.resolve(undefined);
    }

    async onError(err: { message: string; stack: string }): Promise<void> {
        this._logger.err(err.message, err.stack);
        return super.onError(err);
    }
}
