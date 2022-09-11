import {connectModule, ILogger} from '../guards';
import {Logger} from './Logger';

export const connectLogger = connectModule(({ bind }) => {
    bind<ILogger>(ILogger.serviceId).to(Logger).inSingletonScope();
});
