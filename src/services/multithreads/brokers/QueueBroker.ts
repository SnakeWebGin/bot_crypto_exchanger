import {inject, injectable} from 'inversify';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {map} from 'rxjs/operators/map';
import {
    EnumMultiThreadsService,
    ILogger,
    IMultiThreadsService,
    IQueueBroker,
    IThreadData,
    IThreadDataQueue,
    IThreadMain
} from '../../../guards';

@injectable()
export class QueueBroker implements IQueueBroker {
    readonly results$: Subject<IThreadData> = new Subject<IThreadData>();

    private _mapThreats: Map<string, IThreadMain> = new Map<string, IThreadMain>();
    private _mapAvailable: Map<string, boolean> = new Map<string, boolean>();
    private _queueRequests: IThreadData[] = [];

    constructor(
        @inject(IMultiThreadsService.serviceId) protected _multiThreadsService: IMultiThreadsService,
        @inject(ILogger.serviceId) protected _logger: ILogger,
    ) {
    }

    init(id: EnumMultiThreadsService): void {
        const subscriptions: Observable<IThreadDataQueue>[] = [];
        const threads = this._multiThreadsService.findById(id);
        if (threads === undefined) {
            this._logger.err(`QueueBroker: Not found threads by id: ${id.toString()}`);
            return;
        }

        threads.forEach(item => {
            this._mapAvailable.set(item.id, true);
            this._mapThreats.set(item.id, item);
            subscriptions.push(
                item.response$.pipe(map(e => ({ ...e, id: item.id })))
            );
        });

        merge(...subscriptions)
            .subscribe(({ id: threadId, ...data }) => {
                this._mapAvailable.set(threadId, true);
                this.results$.next(data);
                this.next();
            });
    }

    add(item: IThreadData): void {
        this._queueRequests.push(item);
        this.next();
    }

    private findFree(): string {
        const item = Array.from(this._mapAvailable.entries()).find(([_, isFree]) => isFree);
        if (!item) { return undefined; }
        return item[0];
    }

    private next(): void {
        const freeId = this.findFree();
        if (freeId === undefined) { return; }
        const data = this._queueRequests.shift();
        if (!data) { return; }

        this._mapAvailable.set(freeId, false);
        Promise.resolve().then(() => this._mapThreats.get(freeId).request$.next(data));
    }
}
