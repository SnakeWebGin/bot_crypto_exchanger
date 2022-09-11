import {inject, injectable} from 'inversify';
import {EnumMultiThreadsService, IMultiThreadsService, IThreadMain} from '../../guards';

@injectable()
export class MultiThreadsService implements IMultiThreadsService {
    private _threats: Map<string, IThreadMain> = new Map<string, IThreadMain>();
    private _threatsId: Map<string, string[]> = new Map<string, string[]>();

    constructor(
        @inject(IThreadMain.serviceFactoryId) protected _createThreadMain: () => IThreadMain,
    ) {
    }

    async create(id: EnumMultiThreadsService, length: number, tsPathFile: string, init?: (index: number) => Object): Promise<string[]> {
        const threads = [];

        for (let i = 0; i < length; i++) {
            threads.push(this.createThread(id, tsPathFile, typeof init === 'function' ? init(i) : undefined));
        }

        return await Promise.all(threads);
    }

    async createThread(id: EnumMultiThreadsService, tsPathFile: string, initData?: unknown): Promise<string> {
        const thread = this._createThreadMain();
        const uuid = await thread.init(tsPathFile, initData);
        this._threats.set(uuid, thread);
        this.addToGroup(id, [uuid]);
        return uuid;
    }

    findById(id: EnumMultiThreadsService): IThreadMain[] {
        const uuids = this._threatsId.get(id);
        if (!uuids) { return undefined; }

        return uuids.map(uuid => this.findByThreadId(uuid));
    }

    findByThreadId(uuid: string): IThreadMain {
        return this._threats.get(uuid);
    }

    async destroyById(id: EnumMultiThreadsService): Promise<void> {
        const uuids = this._threatsId.get(id);
        if (!uuids) { return; }

        const copyList = uuids.slice();
        await Promise.all(copyList.map(uuid => this.destroyByThreadId(id, uuid)));

        this._threatsId.delete(id);
    }

    async destroyByThreadId(id: EnumMultiThreadsService, uuid: string): Promise<void> {
        this.removeFromGroup(id, [uuid]);
        const item = this.findByThreadId(uuid);
        await item.destroy();

        this._threats.delete(uuid);
    }

    private addToGroup(id: EnumMultiThreadsService, uuids: string[]): void {
        if (!this._threatsId.has(id)) {
            this._threatsId.set(id, uuids);
        } else {
            const value = this._threatsId.get(id);
            this._threatsId.set(id, [...value, ...uuids]);
        }
    }

    private removeFromGroup(id: EnumMultiThreadsService, uuids: string[]): void {
        if (!this._threatsId.has(id)) { return; }
        const values = this._threatsId.get(id);
        let index;
        while ((index = values.findIndex(e => uuids.includes(e))) !== -1) {
            values.splice(index, 1);
        }

        this._threatsId.set(id, values);
    }
}
