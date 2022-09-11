export const uuidGenerate = (): string => {
    let ts = Date.now();
    return 'xxxxxxxx-xxxx-1xx-yxxxxxx-xxxxxxxx'.replace(/[xy]/g, (v) => {
        // tslint:disable-next-line:no-bitwise
        const r = (ts + Math.random() * 16) % 16 | 0;
        ts = Math.floor(ts / 16);
        // tslint:disable-next-line:no-bitwise
        return (v === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
};
