import {inject, injectable} from 'inversify';
import fs from 'fs';
import {AbstractTransition} from '../AbstractTransition';
import {IExchangeModel, IExchangePair, ITransition} from '../../guards';

@injectable()
export class WriteLogsMainTransition extends AbstractTransition implements ITransition {
    private _filepath = `${__dirname}/../pairsLogs/logs.log`;

    constructor(
        @inject(IExchangeModel.serviceId) protected _exchangeModel: IExchangeModel,
    ) {
        super();
    }

    onIntro(): Promise<void> {
        const pairs = this._exchangeModel.getResolvePairs();

        if (pairs.length === 0) {
            return Promise.resolve();
        }

        const logs = [];

        for (let i = 0; i < pairs.length; i++) {
            logs.push(this._summaryItem(pairs[i]));
        }

        fs.appendFileSync(this._filepath, logs.join('\n'), { flag: 'a+' });

        return Promise.resolve();
    }

    private _summaryItem(data: IExchangePair): string {
        return JSON.stringify({
            time: new Date(data.dateTime).toISOString(),
            a: data.v2.aSymbol,
            b: data.v2.bSymbol,
            price: {
                v2: {
                    a: Number(data.v2.a2bPrice),
                    b: Number(data.v2.b2aPrice),
                },
                v3: {
                    a: Number(data.v3.a2bPrice),
                    b: Number(data.v3.b2aPrice),
                }
            },
            diff: {
                a: Number(data.v2.a2bPrice) - Number(data.v3.a2bPrice),
                b: Number(data.v2.b2aPrice) - Number(data.v3.b2aPrice),
            }
        });
    }
}
