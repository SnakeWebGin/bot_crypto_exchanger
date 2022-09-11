import {Subject} from 'rxjs/Subject';
import {interfaces} from 'inversify';
import {EnumMultiThreadsService, IThreadData} from './IMultiThreadsService.guard';

export interface IThreadDataQueue extends IThreadData {
    id: string;
}

export interface IQueueBroker {
    readonly results$: Subject<IThreadData>;
    init(id: EnumMultiThreadsService): void;
    add(item: IThreadData): void;
}

export namespace IQueueBroker {
    export const serviceId: interfaces.ServiceIdentifier<IQueueBroker> = Symbol('IQueueBroker');
}
