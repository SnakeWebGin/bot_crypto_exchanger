export const getTransitionName = (name: symbol): string => {
    if (name === undefined) {
        return 'undefined';
    }

    return String(name).match(/\((.+)\)/)[1];
};
