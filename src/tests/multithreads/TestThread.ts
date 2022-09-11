import {inject, injectable} from 'inversify';
import {take, toArray} from 'rxjs/operators';
import {EnumMultiThreadsService, IManyAsOneBroker, IMultiThreadsService, IQueueBroker} from '../../guards';
import {EnumTestThreadMethod, ITestThread} from './type';

@injectable()
export class TestThread implements ITestThread {
    constructor(
        @inject(IMultiThreadsService.serviceId) protected _multiThreadsService: IMultiThreadsService,
        @inject(IManyAsOneBroker.serviceId) protected _manyAsOneBroker: IManyAsOneBroker,
        @inject(IQueueBroker.serviceId) protected _queueBroker: IQueueBroker,
    ) {
    }

    async init(): Promise<void> {
        await this._multiThreadsService.create(
            EnumMultiThreadsService.Accounts,
            10,
            './tests/multithreads/TestChildThread.ts',
            index => index
        );

        this._manyAsOneBroker.init(EnumMultiThreadsService.Accounts);
        this._queueBroker.init(EnumMultiThreadsService.Accounts);
    }

    async manyAsOne(a: number, b: number): Promise<Array<number>> {
        const result = await this._manyAsOneBroker.send({ method: EnumTestThreadMethod, data: {a, b} });
        return result.map(e => e.data) as Array<number>;
    }

    async manyAsQueue(a: number, b: number, count: number): Promise<Array<number>> {
        const results = this._queueBroker.results$.pipe(take(count), toArray()).toPromise();

        for (let i = 0; i < count; i++) {
            this._queueBroker.add({ method: EnumTestThreadMethod, data: {a, b} });
        }

        return (await results).map(e => e.data) as Array<number>;
    }

    async destroy(): Promise<void> {
        await this._multiThreadsService.destroyById(EnumMultiThreadsService.Accounts);
    }
}
