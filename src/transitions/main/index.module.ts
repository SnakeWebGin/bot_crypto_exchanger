import {getContainer} from '../../container/inversify.config';
import {getMainLogics} from './mainLogics';
import {EnumMainTransition} from "./type";
import {InitMainTransition} from "./InitMainTransition";
import {IdleMainTransition} from "./IdleMainTransition";
import {WriteLogsMainTransition} from "./WriteLogsMainTransition";
import {connectModule, IStateMachine, ITransition} from '../../guards';

export const connectMainTransitions = connectModule(({ bind }) => {
    bind<ITransition>(ITransition.serviceId).to(InitMainTransition).whenTargetNamed(EnumMainTransition.InitMainTransition);
    bind<ITransition>(ITransition.serviceId).to(IdleMainTransition).whenTargetNamed(EnumMainTransition.IdleMainTransition);
    bind<ITransition>(ITransition.serviceId).to(WriteLogsMainTransition).whenTargetNamed(EnumMainTransition.WriteLogsMainTransition);

    const stateMachine = getContainer().get(IStateMachine.serviceFactoryId);
    stateMachine(IStateMachine.serviceMainId, getMainLogics());
});
