import {inject, injectable} from "inversify";
import {
    EnumMultiThreadsService,
    ILogger,
    IMultiThreadsService,
    IStreamListenBroker, IStreamListenEvent,
} from "../../../guards";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {map} from "rxjs/operators/map";
import {merge} from "rxjs/observable/merge";

@injectable()
export class StreamListenBroker implements IStreamListenBroker {
    readonly events$: Subject<IStreamListenEvent> = new Subject<IStreamListenEvent>();

    constructor(
        @inject(IMultiThreadsService.serviceId) protected _multiThreadsService: IMultiThreadsService,
        @inject(ILogger.serviceId) protected _logger: ILogger,
    ) {
    }

    init(id: EnumMultiThreadsService): void {
        const subscriptions: Observable<IStreamListenEvent>[] = [];

        const threads = this._multiThreadsService.findById(id);
        if (threads === undefined) {
            this._logger.err(`StreamListenBroker: Not found threads by id: ${id.toString()}`);
            return;
        }

        for (let i = 0, l = threads.length; i < l; i++) {
            const thread = threads[i];

            subscriptions.push(
                thread.response$.pipe(map(e => ({ ...e, id: thread.id })))
            );
        }

        merge(...subscriptions)
            .subscribe(data => this.events$.next(data));
    }
}
