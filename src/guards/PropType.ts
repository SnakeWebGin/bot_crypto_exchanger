import {getContainer} from '../container/inversify.config';
import {ILogger} from './ILogger.guard';

interface IPropTypeShim {
    fn: (value: unknown) => boolean;
    type: string;
    isRequired: IPropTypeShim;
}

export interface IPropTypes {
    readonly array: IPropTypeShim;
    readonly bool: IPropTypeShim;
    readonly func: IPropTypeShim;
    readonly number: IPropTypeShim;
    readonly object: IPropTypeShim;
    readonly string: IPropTypeShim;
    readonly any: IPropTypeShim;
    arrayOf(type: IPropTypeShim): IPropTypeShim;
    instanceOf(instance: Function): IPropTypeShim;
    objectOf(type: IPropTypeShim): IPropTypeShim;
    oneOf(items: Array<string | number>): IPropTypeShim;
    oneOfType(types: IPropTypeShim[]): IPropTypeShim;
    shape(object: { [index: string]: IPropTypeShim }): IPropTypeShim;
    regExp(regEx: RegExp): IPropTypeShim;
}

const shim = (fn: (value: unknown) => boolean, type: string): IPropTypeShim => {
    return {
        fn,
        type,
        // @ts-ignore
        _isRequired: false,

        get isRequired() {
            // @ts-ignore
            this._isRequired = true;
            return this;
        },
    };
};

export const validateVariable = (
    value: unknown,
    checker: IPropTypeShim,
    withThrow = true,
    key?: string
): boolean => {
    // @ts-ignore
    if (checker._isRequired === false && value === undefined) {
        return true;
    }

    if (!checker.fn(value)) {
        if (withThrow) {
            throw new Error(
                `Validation of PropType.${checker.type}: value - ${JSON.stringify(value)}${
                    key ? ` in key "${key}"` : ''
                } is not valid!`
            );
        }

        return false;
    }

    // @ts-ignore
    if (checker._isRequired && String(value).length === 0) {
        if (withThrow) {
            throw new Error(
                `Validation of PropType.isRequired: value - ${JSON.stringify(value)}${
                    key ? ` in key "${key}"` : ''
                } is empty!`
            );
        }

        return false;
    }

    return true;
};

export const validateObject = (
    values: { [index: string]: unknown },
    checkers: { [index: string]: IPropTypeShim },
    withThrow = true
): boolean => {
    if (values === undefined || values === null || typeof values !== 'object' || Array.isArray(values)) {
        if (withThrow) {
            throw new Error(`Validation: validation property is not object!`);
        }

        return false;
    }

    const keys = Object.keys(checkers);

    for (const key of keys) {
        const result = validateVariable(values[key], checkers[key], withThrow, key);
        if (!result) {
            return false;
        }
    }

    return true;
};

export const PropTypes: IPropTypes = {
    get array() {
        return shim((value) => Array.isArray(value), 'array');
    },
    get bool() {
        return shim((value) => typeof value === 'boolean', 'bool');
    },
    get func() {
        return shim((value) => typeof value === 'function', 'func');
    },
    get number() {
        return shim((value) => !Number.isNaN(value) && typeof value === 'number', 'number');
    },
    get object() {
        return shim((value) => typeof value === 'object' && !Array.isArray(value), 'object');
    },
    get string() {
        return shim((value) => typeof value === 'string', 'string');
    },
    get any() {
        return shim((value) => true, 'any');
    },
    arrayOf(type: IPropTypeShim) {
        return shim(
            (value) => Array.isArray(value) && value.every((e) => validateVariable(e, type, false)),
            'arrayOf'
        );
    },
    instanceOf(fn: Function) {
        return shim((value) => value instanceof fn, 'instanceOf');
    },
    objectOf(type: IPropTypeShim) {
        return shim(
            (value: any) => Object.values(value).every((e) => validateVariable(e, type, false)),
            'objectOf'
        );
    },
    oneOf(items: Array<string | number>) {
        if (!Array.isArray(items)) {
            getContainer().get(ILogger.serviceId).err(
                `Validation structure error! oneOf need receive array! "${JSON.stringify(items)}"`
            );
        }

        return shim((value: any) => items.includes(value), 'oneOf');
    },
    oneOfType(types: IPropTypeShim[]) {
        return shim(
            (value) => types.some((type) => validateVariable(value, type, false)),
            'oneOfType'
        );
    },
    shape(object: { [index: string]: IPropTypeShim }) {
        return shim((value: any) => validateObject(value, object, false), 'shape');
    },
    regExp(regEx: RegExp): IPropTypeShim {
        return shim((value) => typeof value === 'string' && regEx.test(value), 'regExp');
    }
};
