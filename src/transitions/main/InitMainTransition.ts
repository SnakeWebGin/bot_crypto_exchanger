import {inject, injectable} from "inversify";
import {AbstractTransition} from "../AbstractTransition";
import {ILogger, IStateMachine, ITransition} from "../../guards";

@injectable()
export class InitMainTransition extends AbstractTransition implements ITransition {
    constructor(
        @inject(ILogger.serviceId) protected _logger: ILogger,
        @inject(IStateMachine.serviceMainId) protected _mainStateMachine: IStateMachine,
    ) {
        super();
    }

    async onIntro(): Promise<void> {
        console.log('>>>>>>init intro');
        this._mainStateMachine.act('ready');
    }

    async onError(err: { message: string; stack: string }): Promise<void> {
        this._logger.err(err.message, err.stack);
        return super.onError(err);
    }
}
