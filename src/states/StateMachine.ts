import {inject, injectable} from 'inversify';
import {interval} from 'rxjs/observable/interval';
import {filter} from 'rxjs/operators/filter';
import {getTransitionName} from '../helpers/transitionName';
import {ILogger, IState, IStateMachine} from '../guards';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@injectable()
export class StateMachine implements IStateMachine {
    private _states: IState[] = [];
    private _currentState: symbol | undefined = undefined;

    private _nextPending = false;
    private _currentStateItem: IState;
    private _action: string;

    public type: string;

    readonly currentState$: BehaviorSubject<symbol> = new BehaviorSubject<symbol>(undefined);

    constructor(
        @inject(ILogger.serviceId) protected _logger: ILogger,
    ) {
        interval(100)
            .pipe(filter(_ => !this._nextPending))
            .subscribe(_ => this.next());
    }

    get currentState(): symbol | undefined {
        return this._currentState;
    }

    setStates(states: IState[]) {
        this._states = states;
    }

    async next(): Promise<void> {
        if (this._nextPending === true) { return; }

        const nextState = this._states.find(e =>
            e.from === this._currentState &&
            (e.act === undefined || this._action === e.act) &&
            (typeof e.guard === 'function' ? e.guard() : true)
        );

        this._action = undefined;

        if (!nextState) { return; }

        this._nextPending = true;

        const fromState = getTransitionName(this._currentState);
        const toState = getTransitionName(nextState.to);

        this._logger.log(`${this.type}: ${fromState} -> ${toState}`);

        await this.leaveCurrentState();
        await this.introNewState(nextState);

        this._nextPending = false;
    }

    act(event: string): void {
        this._action = event;
    }

    private async leaveCurrentState(): Promise<void> {
        if (!this._currentStateItem) { return; }

        try {
            await this._currentStateItem.controller.onOutro();
        } catch (e) {
            this._logger.err(`SM onOutro: ${e.message}! ${e.stack}`);
        }
    }

    private async introNewState(state: IState): Promise<void> {
        if (!state) { return; }

        this._currentStateItem = state;
        this._currentState = state.to;
        this.currentState$.next(this._currentState);

        try {
            await state.controller.onIntro();
        } catch (e) {
            await state.controller.onError(e);
            this._logger.err(`SM onIntro: ${e.message}! ${e.stack}`);
        }
    }
}
