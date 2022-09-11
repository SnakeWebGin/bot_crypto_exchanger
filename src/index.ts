import 'reflect-metadata';
import {moduleInjection} from './container/inversify.config';
import {connectLogger} from './logger/index.module';
import {connectServices} from './services/index.module';

const botModule = () => {
    connectLogger(moduleInjection);
    connectServices(moduleInjection);
};

try {
    botModule();
} catch (e) {
    console.error('Stack error:', e.message, e.stack);
}
