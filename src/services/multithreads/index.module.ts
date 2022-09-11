import {
    connectModule, EnumMultiThreadsService,
    IManyAsOneBroker,
    IMultiThreadsService,
    IQueueBroker,
    IStreamListenBroker,
    IThreadMain
} from '../../guards';
import {MultiThreadsService} from './MultiThreadsService';
import {ThreadMain} from './ThreadMain';
import {interfaces} from 'inversify';
import {QueueBroker} from './brokers/QueueBroker';
import {ManyAsOneBroker} from './brokers/ManyAsOneBroker';
import {StreamListenBroker} from "./brokers/StreamListenBroker";

export const connectMultiThreads = connectModule(({ bind }) => {
    bind<IMultiThreadsService>(IMultiThreadsService.serviceId).to(MultiThreadsService).inSingletonScope();
    bind<IThreadMain>(IThreadMain.serviceId).to(ThreadMain).inRequestScope();
    bind<interfaces.Factory<IThreadMain>>(IThreadMain.serviceFactoryId).toFactory(context => {
        return () => {
            return context.container.get(IThreadMain.serviceId);
        };
    });
    bind<IQueueBroker>(IQueueBroker.serviceId).to(QueueBroker).inRequestScope();
    bind<IManyAsOneBroker>(IManyAsOneBroker.serviceId).to(ManyAsOneBroker).inRequestScope();
    bind<IStreamListenBroker>(IStreamListenBroker.serviceId).to(StreamListenBroker).inRequestScope();
    bind<interfaces.Factory<IStreamListenBroker>>(IStreamListenBroker.serviceFactoryId).toFactory((context => {
        return (id: EnumMultiThreadsService) => {
            const streamListener = context.container.get(IStreamListenBroker.serviceId);
            streamListener.init(id);
            return streamListener;
        };
    }))
});
