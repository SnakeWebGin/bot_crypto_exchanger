import {IConnectModule} from '../guards';
import {connectMultiThreads} from './multithreads/index.module';

export const connectServices = (moduleInjection: IConnectModule) => {
    connectMultiThreads(moduleInjection);
};
