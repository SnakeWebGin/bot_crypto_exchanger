import { interfaces } from 'inversify';
export interface IConnectModule {
    bind: interfaces.Bind;
    unbind: interfaces.Unbind;
    isBound: interfaces.IsBound;
    rebind: interfaces.Rebind;
}

export type TypeConnectModule = (params: IConnectModule) => void;

// Connect modules to main container
export const connectModule = (
    module: TypeConnectModule
): TypeConnectModule => {
    return module;
};
