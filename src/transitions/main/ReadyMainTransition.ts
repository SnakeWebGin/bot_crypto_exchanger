import {inject, injectable} from "inversify";
import {AbstractTransition} from "../AbstractTransition";
import {ILogger, ITransition} from "../../guards";

@injectable()
export class ReadyMainTransition extends AbstractTransition implements ITransition {
    constructor(
        @inject(ILogger.serviceId) protected _logger: ILogger,
    ) {
        super();
    }

    onIntro(): Promise<void> {
        console.log('>>>>>>ready intro');
        return Promise.resolve(undefined);
    }

    async onError(err: { message: string; stack: string }): Promise<void> {
        this._logger.err(err.message, err.stack);
        return super.onError(err);
    }
}
