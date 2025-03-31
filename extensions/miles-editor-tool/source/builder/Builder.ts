
import { ipcRenderer } from "electron";
import { BuildPlugin } from "../../@cocos/creator-types/editor/packages/builder/@types";

export const load: BuildPlugin.load = function () {
};

export const unload: BuildPlugin.Unload = function () {
};


export const configs: BuildPlugin.Configs = {
    '*': {
        hooks: './Hooks',
    },
};
