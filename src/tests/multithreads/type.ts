import {interfaces} from 'inversify';
import {PropTypes, validateVariable} from '../../guards';

export const EnumTestThreadMethod = 'TEST';
export interface ITestThreadData {
    a: number;
    b: number;
}

export namespace ITestThreadData {
    export const guard = (data: unknown): data is ITestThreadData => {
        return validateVariable((data as ITestThreadData), PropTypes.shape({
            a: PropTypes.number.isRequired,
            b: PropTypes.number.isRequired,
        }).isRequired);
    };
}

export interface ITestThread {
    init(): Promise<void>;
    destroy(): Promise<void>;
    manyAsOne(a: number, b: number): Promise<Array<number>>;
    manyAsQueue(a: number, b: number, count: number): Promise<Array<number>>;
}

export namespace ITestThread {
    export const serviceId: interfaces.ServiceIdentifier<ITestThread> = Symbol('ITestThread');
}

