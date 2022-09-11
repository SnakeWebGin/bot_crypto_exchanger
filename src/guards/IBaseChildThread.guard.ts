import {Subject} from 'rxjs/Subject';
import {IThreadData, IThreadError} from './IMultiThreadsService.guard';
import {interfaces} from 'inversify';

export interface IBaseChildThread {
    readonly request$: Subject<IThreadData>;
    readonly response$: Subject<IThreadData | IThreadError>;
}

export namespace IBaseChildThread {
    export const serviceId: interfaces.ServiceIdentifier<IBaseChildThread> = Symbol('IBaseChildThread');
}
