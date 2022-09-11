import {inject, injectable} from 'inversify';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {map} from 'rxjs/operators/map';
import {
    EnumMultiThreadsService,
    ILogger,
    IManyAsOneBroker,
    IMultiThreadsService,
    IThreadData,
    IThreadDataQueue,
    IThreadMain
} from '../../../guards';
import {take} from 'rxjs/operators';

@injectable()
export class ManyAsOneBroker implements IManyAsOneBroker {
    readonly result$: Subject<IThreadDataQueue> = new Subject<IThreadDataQueue>();
    private _mapBrokers: Map<string, IThreadMain> = new Map<string, IThreadMain>();

    constructor(
        @inject(IMultiThreadsService.serviceId) protected _multiThreadsService: IMultiThreadsService,
        @inject(ILogger.serviceId) protected _logger: ILogger,
    ) {
    }

    init(id: EnumMultiThreadsService): void {
        const subscriptions: Observable<IThreadDataQueue>[] = [];

        const threads = this._multiThreadsService.findById(id);
        if (threads === undefined) {
            this._logger.err(`ManyAsOneBroker: Not found threads by id: ${id.toString()}`);
            return;
        }

        for (let i = 0, l = threads.length; i < l; i++) {
            const thread = threads[i];
            this._mapBrokers.set(thread.id, thread);

            subscriptions.push(
                thread.response$.pipe(map(e => ({ ...e, id: thread.id })))
            );
        }

        merge(...subscriptions)
            .subscribe(data => this.result$.next(data));
    }

    send(item: IThreadData): Promise<IThreadDataQueue[]> {
        const promises = [];

        this._mapBrokers.forEach(thread => {
            promises.push(thread.response$.pipe(take(1)).toPromise());
            thread.request$.next(item);
        });

        return Promise.all(promises);
    }
}
