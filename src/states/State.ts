import {ILogger, IState, ITransition} from '../guards';
import {getContainer} from '../container/inversify.config';
import {getTransitionName} from '../helpers/transitionName';

export class State implements IState {
    public controller: ITransition;

    // tslint:disable-next-line:max-line-length
    constructor(namespace: any, public from: symbol | undefined, public to: symbol | undefined, public act?: string, public guard?: () => boolean) {
        if (to === undefined) {
            throw new Error(`State: property "to" can not be undefined!`);
        }

        if (typeof namespace !== 'object') {
            throw new Error(`State namespace: is not valid ${JSON.stringify(namespace)}!`);
        }

        try {
            this.controller = getContainer().getNamed(ITransition.serviceId, namespace[getTransitionName(to)]);
        } catch (e) {
            const logger = getContainer().get(ILogger.serviceId);
            logger.err(`State error "${to.toString()}"! ${e.message}:${e.stack}`);
            throw e;
        }
    }
}
