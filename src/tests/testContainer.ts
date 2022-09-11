import { Container, interfaces } from 'inversify';
import {IConnectModule} from '../guards';

export const createContainer = (): {container: Container, moduleInjection: IConnectModule } => {
    const container = new Container({
        skipBaseClassChecks: true,
    });

    const moduleInjection: IConnectModule = {
        // tslint:disable-next-line:max-line-length
        bind: <T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T> => container.bind<T>(serviceIdentifier),
        unbind: (serviceIdentifier: interfaces.ServiceIdentifier<any>): void => container.unbind(serviceIdentifier),
        isBound: (serviceIdentifier: interfaces.ServiceIdentifier<any>): boolean => container.isBound(serviceIdentifier),
        // tslint:disable-next-line:max-line-length
        rebind: <T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T> => container.rebind(serviceIdentifier)
    };

    return { container, moduleInjection };
};
