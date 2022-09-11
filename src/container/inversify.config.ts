import { Container, interfaces } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import {IConnectModule} from '../guards';

export const container = new Container({
    skipBaseClassChecks: true,
});
// container.applyMiddleware(debug);

const { lazyInject } = getDecorators(container, false);
export const moduleInjection: IConnectModule = {
    bind: <T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T> => container.bind<T>(serviceIdentifier),
    unbind: (serviceIdentifier: interfaces.ServiceIdentifier<any>): void => container.unbind(serviceIdentifier),
    isBound: (serviceIdentifier: interfaces.ServiceIdentifier<any>): boolean => container.isBound(serviceIdentifier),
    rebind: <T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T> => container.rebind(serviceIdentifier)
};

export const getContainer: () => Container = () => container;

export { lazyInject };
