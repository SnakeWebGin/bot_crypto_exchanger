import {interfaces} from 'inversify';

export interface ITransition {
    onIntro(): Promise<void>;
    onOutro(): Promise<void>;
    onError(err: {message: string, stack: string}): Promise<void>;
}

export namespace ITransition {
    export const serviceId: interfaces.ServiceIdentifier<ITransition> = Symbol('ITransition');
}
