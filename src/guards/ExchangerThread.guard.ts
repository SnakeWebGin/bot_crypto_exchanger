import {PropTypes, validateVariable} from './PropType';

export interface IExchangerInitData {
    from: string;
    fromToken: string;
    fromDecimals: number;
    to: string;
    toToken: string;
    toDecimals: number;
    poolAddress: string;
}

export namespace IExchangerInitData {
    export const guard = (data: unknown): data is IExchangerInitData => {
        return validateVariable((data as IExchangerInitData), PropTypes.shape({
            from: PropTypes.string.isRequired,
            fromToken: PropTypes.string.isRequired,
            to: PropTypes.string.isRequired,
            toToken: PropTypes.string.isRequired,
        }));
    };
}

export interface IExchangerPrice {
    aSymbol: string;
    bSymbol: string;
    a2bPrice: string;
    b2aPrice: string;
}

export namespace IExchangerPrice {
    export const guard = (data: unknown): data is IExchangerPrice => {
        return validateVariable((data as IExchangerPrice), PropTypes.shape({
            aSymbol: PropTypes.string.isRequired,
            bSymbol: PropTypes.string.isRequired,
            a2bPrice: PropTypes.string.isRequired,
            b2aPrice: PropTypes.string.isRequired,
        }));
    };
}
