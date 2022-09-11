import {connectModule, IExchangers} from "../guards";
import {Exchangers} from "./Exchangers";

export const connectExchangers = connectModule(({ bind }) => {
    bind<IExchangers>(IExchangers.serviceId).to(Exchangers).inSingletonScope();
});
