import 'reflect-metadata';
import {Container} from 'inversify';
import { createContainer } from '../testContainer';
import {connectLogger} from '../../logger/index.module';
import {ITestThread} from './type';
import {TestThread} from './TestThread';
import {connectMultiThreads} from '../../services/multithreads/index.module';

const connectTestMultiTread = (): Container => {
    const { container, moduleInjection } = createContainer();
    const { bind } = moduleInjection;

    connectLogger(moduleInjection);
    connectMultiThreads(moduleInjection);

    bind<ITestThread>(ITestThread.serviceId).to(TestThread).inSingletonScope();

    return container;
};

test('test many as one', async () => {
    const container = connectTestMultiTread();
    const testThread = container.get(ITestThread.serviceId);
    await testThread.init();

    const result = await testThread.manyAsOne(123, 234);
    result.forEach(value => expect(value).toBe(28782));

    await testThread.destroy();
    container.unbindAll();
}, 30000);

test('test many as queue', async () => {
    const container = connectTestMultiTread();
    const testThread = container.get(ITestThread.serviceId);
    await testThread.init();

    const result2 = await testThread.manyAsQueue(234, 0.1234, 10);
    result2.forEach(value => expect(value).toBe(28.8756));
    await testThread.destroy();
    container.unbindAll();
}, 30000);
