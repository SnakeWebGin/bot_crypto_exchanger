import {interfaces} from 'inversify';
import {IExchangerPrice} from './ExchangerThread.guard';

export interface IExchangePair {
    v2: IExchangerPrice;
    v3: IExchangerPrice;
    dateTime: number;
}

export interface IExchangeModel {
    addV2(item: IExchangerPrice): void;
    addV3(item: IExchangerPrice): void;
    getResolvePairs(): Array<IExchangePair>;
}

export namespace IExchangeModel {
    export const serviceId: interfaces.ServiceIdentifier<IExchangeModel> = Symbol('IExchangeModel');
}
