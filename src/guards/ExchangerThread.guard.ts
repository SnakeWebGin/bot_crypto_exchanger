import {PropTypes, validateVariable} from "./PropType";

export interface IExchangerInitData {
    from: string;
    fromToken: string;
    to: string;
    toToken: string;
}

export namespace IExchangerInitData {
    export const guard = (data: unknown): data is IExchangerInitData => {
        return validateVariable((data as IExchangerInitData), PropTypes.shape({
            from: PropTypes.string.isRequired,
            fromToken: PropTypes.string.isRequired,
            to: PropTypes.string.isRequired,
            toToken: PropTypes.string.isRequired,
        }))
    }
}
