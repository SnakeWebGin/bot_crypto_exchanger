import {injectable} from 'inversify';
import {ITransition} from '../guards';

@injectable()
export abstract class AbstractTransition implements ITransition {
    abstract onIntro(): Promise<void>;

    async onOutro(): Promise<void> {

    }

    async onError(err: {message: string, stack: string}): Promise<void> {
        return Promise.reject(err);
    }
}
