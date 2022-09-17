import {injectable} from 'inversify';
import {IExchangeModel, IExchangePair, IExchangerPrice} from '../../guards';

@injectable()
export class ExchangeModel implements IExchangeModel {
    private _lastV2Items: Map<string, IExchangerPrice> = new Map<string, IExchangerPrice>();
    private _lastV3Items: Map<string, IExchangerPrice> = new Map<string, IExchangerPrice>();

    private _resolvePairs: Array<IExchangePair> = [];

    addV2(item: IExchangerPrice): void {
        const key = this._name(item.aSymbol, item.bSymbol);
        this._lastV2Items.set(key, item);

        const v3 = this._lastV3Items.get(key);
        if (!v3) { return; }

        this._resolvePairs.push({
            v2: item,
            v3: v3,
            dateTime: +new Date(),
        });
    }

    addV3(item: IExchangerPrice): void {
        const key = this._name(item.aSymbol, item.bSymbol);
        this._lastV3Items.set(key, item);

        const v2 = this._lastV2Items.get(key);
        if (!v2) { return; }

        this._resolvePairs.push({
            v2,
            v3: item,
            dateTime: +new Date(),
        });
    }

    getResolvePairs(): Array<IExchangePair> {
        return this._resolvePairs.splice(0, this._resolvePairs.length - 1);
    }

    private _name(from: string, to: string): string {
        return `${from}/${to}`;
    }
}
