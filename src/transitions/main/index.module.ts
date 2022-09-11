import {getContainer} from '../../container/inversify.config';
import {connectModule, IStateMachine, ITransition} from '../../guards';
import {getMainLogics} from './mainLogics';
import {InitMainTransition} from "./InitMainTransition";
import {EnumMainTransition} from "./type";
import {ReadyMainTransition} from "./ReadyMainTransition";

export const connectMainTransitions = connectModule(({ bind }) => {
    bind<ITransition>(ITransition.serviceId).to(InitMainTransition).whenTargetNamed(EnumMainTransition.InitMainTransition);
    bind<ITransition>(ITransition.serviceId).to(ReadyMainTransition).whenTargetNamed(EnumMainTransition.ReadyMainTransition);

    const stateMachine = getContainer().get(IStateMachine.serviceFactoryId);
    stateMachine(IStateMachine.serviceMainId, getMainLogics());
});
