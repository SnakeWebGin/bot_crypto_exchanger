import {EnumMultiThreadsService, IThreadData} from './IMultiThreadsService.guard';
import {Subject} from 'rxjs/Subject';
import {interfaces} from 'inversify';
import {IThreadDataQueue} from './IQueueBroker.guard';

export interface IManyAsOneBroker {
    readonly result$: Subject<IThreadDataQueue>;
    init(id: EnumMultiThreadsService): void;
    send(item: IThreadData): Promise<IThreadDataQueue[]>;
}

export namespace IManyAsOneBroker {
    export const serviceId: interfaces.ServiceIdentifier<IManyAsOneBroker> = Symbol('IManyAsOneBroker');
}
