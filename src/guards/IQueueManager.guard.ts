import {interfaces} from 'inversify';

export interface IBaseQueueManager<T> {
    addTask(task: T): void;
    hasTask(find: (item: T) => boolean): boolean;
    getTask(find: (item: T) => boolean): T;
    getNextTask(): T;
    waitByTask<R>(find: (item: T) => boolean): Promise<T>;
}

// export interface IWSTaskQueueManager extends IBaseQueueManager<IWSTaskGuard> {}
// export interface IStrategyTaskQueueManager extends IBaseQueueManager<IStrategyTask> {}
// export interface ICurrencyTaskQueueManager extends IBaseQueueManager<ICurrencyTask> {}
// export interface IBinanceTaskQueueManager extends IBaseQueueManager<IBinanceQueueTask> {}
// export interface IBinanceResultQueueManager extends IBaseQueueManager<IBinanceQueueResult> {}

export namespace IQueueManager {
    // export const serviceWSTaskId: interfaces.ServiceIdentifier<IWSTaskQueueManager> = Symbol('IWSTaskQueueManager');
    // export const serviceStrategyTaskId: interfaces.ServiceIdentifier<IStrategyTaskQueueManager> = Symbol('IStrategyTaskQueueManager');
    // export const serviceCurrencyTaskId: interfaces.ServiceIdentifier<ICurrencyTaskQueueManager> = Symbol('ICurrencyTaskQueueManager');
    // export const serviceBinanceTaskId: interfaces.ServiceIdentifier<IBinanceTaskQueueManager> = Symbol('IBinanceTaskQueueManager');
    // export const serviceBinanceResultId: interfaces.ServiceIdentifier<IBinanceResultQueueManager> = Symbol('IBinanceResultQueueManager');
}
