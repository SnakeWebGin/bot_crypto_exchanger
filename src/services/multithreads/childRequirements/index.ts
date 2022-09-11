import 'reflect-metadata';
import {getContainer, moduleInjection} from '../../../container/inversify.config';
import {IBaseChildThread, IThreadChild} from '../../../guards';
import {ThreadChild} from './ThreadChild';
import {connectLogger} from '../../../logger/index.module';

(async () => {
    const { bind } = moduleInjection;
    connectLogger(moduleInjection);

    bind<IThreadChild>(IThreadChild.serviceId).to(ThreadChild).inSingletonScope();

    const main = getContainer().get(IThreadChild.serviceId);

    try {
        const defaultClass = await main.initConnectionClass(process.argv[2]);
        bind<IBaseChildThread>(IBaseChildThread.serviceId).to(defaultClass).inSingletonScope();
        getContainer().get(IBaseChildThread.serviceId);
    } catch (e) {
        main.response$.next({ error: e.message, stack: e.stack });
    }
})();
