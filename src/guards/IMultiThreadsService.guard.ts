import {interfaces} from 'inversify';
import {Subject} from 'rxjs/Subject';
import {PropTypes, validateVariable} from './PropType';
import {IBaseChildThread} from './IBaseChildThread.guard';

export interface IMultiThreadsService {
    create(id: EnumMultiThreadsService, length: number, tsPathFile: string, initData?: Object): Promise<string[]>;
    createThread(id: EnumMultiThreadsService, tsPathFile: string, initData?: unknown): Promise<string>;
    findById(id: EnumMultiThreadsService): IThreadMain[];
    findByThreadId(uuid: string): IThreadMain;
    destroyById(id: EnumMultiThreadsService): Promise<void>;
    destroyByThreadId(id: EnumMultiThreadsService, uuid: string): Promise<void>;
}

export enum EnumMultiThreadsService {
    ExchangerV2 = 'ExchangerV2',
    ExchangerV3 = 'ExchangerV3',
}

export namespace IMultiThreadsService {
    export const serviceId: interfaces.ServiceIdentifier<IMultiThreadsService> = Symbol('IMultiThreadsService');
}

export interface IThreadState {
    state: string;
}

export namespace IThreadState {
    export const guard = (data: unknown): data is IThreadState => {
        return validateVariable((data as IThreadState), PropTypes.shape({
            state: PropTypes.oneOf(['initted']).isRequired
        }), false);
    };
}

export interface IThreadError {
    error: string;
    stack?: string;
    requestId?: string;
}

export namespace IThreadError {
    export const guard = (data: unknown): data is IThreadError => {
        return validateVariable((data as IThreadError), PropTypes.shape({
            error: PropTypes.string.isRequired,
            stack: PropTypes.string,
            requestId: PropTypes.string,
        }).isRequired, false);
    };
}

export interface IThreadData {
    method: string;
    data?: unknown;
    requestId?: string;
}

export namespace IThreadData {
    export const guard = (data: unknown): data is IThreadData => {
        return validateVariable((data as IThreadData), PropTypes.shape({
            method: PropTypes.string.isRequired,
            data: PropTypes.any,
            requestId: PropTypes.string,
        }).isRequired, false);
    };
}

export interface IThreadMain {
    readonly id: string;
    readonly request$: Subject<IThreadData>;
    readonly response$: Subject<IThreadData>;
    init(tsPathFile: string, initData?: unknown): Promise<string>;
    destroy(): Promise<void>;
}

export namespace IThreadMain {
    export const serviceId: interfaces.ServiceIdentifier<IThreadMain> = Symbol('IThreadMain');
    export const serviceFactoryId: interfaces.ServiceIdentifier<interfaces.Factory<IThreadMain>> = Symbol('Factory<IThreadMain>');
}

export interface IThreadChild {
    readonly request$: Subject<IThreadData>;
    readonly response$: Subject<IThreadData | IThreadError>;
    initConnectionClass(childPathFile: string): Promise<new (...args: any[]) => IBaseChildThread>;
    destroy(): void;
}

export namespace IThreadChild {
    export const serviceId: interfaces.ServiceIdentifier<IThreadChild> = Symbol('IThreadChild');
}
