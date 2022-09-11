import {PropTypes, validateVariable} from "./PropType";

export interface IExchangerInitData {
    from: string;
    to: string;
}

export namespace IExchangerInitData {
    export const guard = (data: unknown): data is IExchangerInitData => {
        return validateVariable((data as IExchangerInitData), PropTypes.shape({
            from: PropTypes.string.isRequired,
            to: PropTypes.string.isRequired,
        }))
    }
}
