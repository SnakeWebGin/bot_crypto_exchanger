import {IConnectModule} from '../guards';
import {connectMainTransitions} from './main/index.module';

export const connectTransitions = (moduleInjection: IConnectModule) => {
    connectMainTransitions(moduleInjection);
};
