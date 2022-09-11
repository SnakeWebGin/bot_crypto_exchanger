import {connectModule, IState, IStateMachine, TypeStateMachineFactory} from '../guards';
import {StateMachine} from './StateMachine';
import {interfaces} from 'inversify';
import {getTransitionName} from '../helpers/transitionName';

export const connectStates = connectModule(({ bind }) => {
    bind<IStateMachine>(IStateMachine.serviceMainId).to(StateMachine).inSingletonScope();

    bind<interfaces.Factory<TypeStateMachineFactory>>(IStateMachine.serviceFactoryId).toFactory((context) => {
        return (service: interfaces.ServiceIdentifier<IStateMachine>, states: IState[]) => {
            const sm = context.container.get(service);
            sm.setStates(states);
            // @ts-ignore
            sm.type = getTransitionName(service);
            return sm;
        };
    });

});
