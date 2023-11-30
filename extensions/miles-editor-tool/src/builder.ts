
import { BuildPlugin } from '../@types';

export const load: BuildPlugin.load = function() {
};

export const unload: BuildPlugin.load = function() {
};


export const configs: BuildPlugin.Configs = {
    '*': {
        hooks: './hooks',
    },
};

