import {connectModule, IExchangeModel, IExchangers} from '../guards';
import {ExchangeModel} from './models/ExchangeModel';
import {Exchangers} from './Exchangers';

export const connectExchangers = connectModule(({ bind }) => {
    bind<IExchangeModel>(IExchangeModel.serviceId).to(ExchangeModel).inSingletonScope();
    bind<IExchangers>(IExchangers.serviceId).to(Exchangers).inSingletonScope();
});
