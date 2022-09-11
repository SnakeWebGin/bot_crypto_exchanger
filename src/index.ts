import 'reflect-metadata';
import {moduleInjection} from './container/inversify.config';
import {connectLogger} from './logger/index.module';

const botModule = () => {
    connectLogger(moduleInjection);
};

try {
    botModule();
} catch (e) {
    console.error('Stack error:', e.message, e.stack);
}
