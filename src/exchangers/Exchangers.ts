import {inject, injectable} from "inversify";
import {Subject} from "rxjs/Subject";
import {map} from "rxjs/operators/map";
import {Observable} from "rxjs/Observable";
import {merge} from "rxjs/observable/merge";
import {
    EnumMultiThreadsService, IExchangerInitData,
    IExchangers, IExchangersEvent,
    IMultiThreadsService,
    IStreamListenBroker
} from "../guards";

@injectable()
export class Exchangers implements IExchangers {
    readonly currencyValue$: Subject<IExchangersEvent> = new Subject<IExchangersEvent>();

    constructor(
        @inject(IMultiThreadsService.serviceId) protected _multiThreadsService: IMultiThreadsService,
        @inject(IStreamListenBroker.serviceFactoryId) protected _streamListenBroker: (id: EnumMultiThreadsService) => IStreamListenBroker,
    ) {
    }

    async init(pairs: Array<IExchangerInitData>): Promise<void> {
        // await this._multiThreadsService.create(
        //     EnumMultiThreadsService.ExchangerV2,
        //     pairs.length,
        //     './exchangers/ExchangerV2Thread.ts',
        //     index => pairs[index]
        // );
        //
        // const v2$: Observable<IExchangersEvent> = this._streamListenBroker(EnumMultiThreadsService.ExchangerV2)
        //     .events$.pipe(map(e => ({...e, type: 'v2'})));

        await this._multiThreadsService.create(
            EnumMultiThreadsService.ExchangerV3,
            pairs.length,
            './exchangers/ExchangerV3Thread.ts',
            index => pairs[index]
        );

        const v3$: Observable<IExchangersEvent> = this._streamListenBroker(EnumMultiThreadsService.ExchangerV3)
            .events$.pipe(map(e => ({...e, type: 'v3'})));

        merge(/*v2$, */v3$).subscribe(data => this.currencyValue$.next(data));
    }
}
