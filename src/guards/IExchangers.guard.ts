import {interfaces} from 'inversify';
import {IStreamListenEvent} from './IStreamListenBroker.guard';
import {Subject} from 'rxjs/Subject';
import {IExchangerInitData} from './ExchangerThread.guard';

export interface IExchangersEvent extends IStreamListenEvent {
    type: string;
}

export interface IExchangers {
    readonly currencyValue$: Subject<IExchangersEvent>;
    init(pairs: Array<IExchangerInitData>): Promise<void>;
}

export namespace IExchangers {
    export const serviceId: interfaces.ServiceIdentifier<IExchangers> = Symbol('IExchangers');
}
