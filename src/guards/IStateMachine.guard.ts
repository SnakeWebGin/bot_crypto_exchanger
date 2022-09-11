import {interfaces} from 'inversify';
import {ITransition} from './ITransition.guard';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

export interface IState {
    from: symbol | undefined;
    to: symbol | undefined;
    controller: ITransition;
    guard?: () => boolean;
    act?: string;
}

export interface IStateMachine {
    type: string;
    readonly currentState: symbol | undefined;
    readonly currentState$: BehaviorSubject<symbol>;
    setStates(states: IState[]): void;
    act(event: string): void;
    next(): void;
}

export type TypeStateMachineFactory = Readonly <(service: interfaces.ServiceIdentifier<IStateMachine>, tasks: IState[]) => IStateMachine>;

export namespace IStateMachine {
    export const serviceFactoryId: interfaces.ServiceIdentifier<interfaces.Factory<TypeStateMachineFactory>> = Symbol('TypeStateMachineFactory');

    export const serviceMainId: interfaces.ServiceIdentifier<IStateMachine> = Symbol('Main<IStateMachine>');
}
