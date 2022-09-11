import 'reflect-metadata';
import {moduleInjection} from './container/inversify.config';
import {connectLogger} from './logger/index.module';
import {connectServices} from './services/index.module';
import {connectStates} from "./states/index.module";
import {connectTransitions} from "./transitions/index.module";
import {connectExchangers} from "./exchangers/index.module";

const botModule = () => {
    connectLogger(moduleInjection);
    connectServices(moduleInjection);
    connectStates(moduleInjection);
    connectExchangers(moduleInjection);
    connectTransitions(moduleInjection);
};

try {
    botModule();
} catch (e) {
    console.error('Stack error:', e.message, e.stack);
}
