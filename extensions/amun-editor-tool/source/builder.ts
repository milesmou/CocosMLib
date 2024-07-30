
import { BuildPlugin } from "@cocos/creator-types/editor/packages/builder/@types/public";

export const load: BuildPlugin.load = function() {
};

export const unload: BuildPlugin.load = function() {
};


export const configs: BuildPlugin.Configs = {
    '*': {
        hooks: './hooks',
    },
};

