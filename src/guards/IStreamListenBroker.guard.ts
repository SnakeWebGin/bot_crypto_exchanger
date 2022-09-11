import {interfaces} from "inversify";
import {EnumMultiThreadsService, IThreadData} from "./IMultiThreadsService.guard";
import {Subject} from "rxjs/Subject";

export interface IStreamListenEvent extends IThreadData {
    id: string;
}

export interface IStreamListenBroker {
    events$: Subject<IStreamListenEvent>;
    init(id: EnumMultiThreadsService): void;
}

export namespace IStreamListenBroker {
    export const serviceId: interfaces.ServiceIdentifier<IStreamListenBroker> = Symbol('IStreamListenBroker');
    export const serviceFactoryId: interfaces.ServiceIdentifier<interfaces.Factory<IStreamListenBroker>> = Symbol('Factory<IStreamListenBroker>');
}
