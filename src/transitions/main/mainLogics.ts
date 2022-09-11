import {State} from '../../states/State';
import {EnumMainTransition} from "./type";

export const getMainLogics = () => {
    return [
        new State(EnumMainTransition, undefined, EnumMainTransition.InitMainTransition),
        new State(EnumMainTransition, EnumMainTransition.InitMainTransition, EnumMainTransition.ReadyMainTransition, 'ready'),
    ];
};
