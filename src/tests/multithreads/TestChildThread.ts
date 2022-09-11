import {inject, injectable} from 'inversify';
import {IBaseChildThread, ILogger, IThreadChild} from '../../guards';
import {BaseChildThread} from '../../services/multithreads/childRequirements/BaseChildThread';
import {EnumTestThreadMethod, ITestThreadData} from './type';

@injectable()
export default class TestChildThread extends BaseChildThread implements IBaseChildThread {
    constructor(
        @inject(IThreadChild.serviceId) protected _threadChild: IThreadChild,
        @inject(ILogger.serviceId) protected _logger: ILogger,
    ) {
        super(_threadChild);
    }

    protected async init(): Promise<void> {

    }

    protected async execute(method: string, data: unknown): Promise<Object | undefined> {
        if (!ITestThreadData.guard(data)) {
            this._logger.err(`ITestThreadData is not valid! ${JSON.stringify(data)}`);
            return;
        }

        switch (method) {
            case EnumTestThreadMethod:
                return data.a * data.b;

            default:
                this._logger.err(`TestChildThread have not case "${method}" with data ${JSON.stringify(data)}`);
                return undefined;
        }
    }

    protected onDestroy() {
        super.onDestroy();
    }
}
