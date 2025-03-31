import fs, { FSWatcher, WatchEventType } from "fs-extra";
// 临时在当前模块增加编辑器内的模块为搜索路径，为了能够正常 require 到 cc 模块，后续版本将优化调用方式
import { join } from 'path';
module.paths.push(join(Editor.App.path, 'node_modules'));

import { Constant } from "../tools/Constant";
import { Logger } from "../tools/Logger";
import { SceneCmdExecute } from "./SceneCmdExecute";


/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    replaceComponent: SceneCmdExecute.replaceComponent.bind(SceneCmdExecute)
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() {
    if (!fs.existsSync(Constant.SceneConnectFilePath)) {
        fs.createFileSync(Constant.SceneConnectFilePath);
        fs.writeJSONSync(Constant.SceneConnectFilePath, {});
    }
    sceneconnectWatcher = fs.watch(Constant.SceneConnectFilePath, sceneconnectListener);
}

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() {
    sceneconnectWatcher.close();
}

let sceneconnectWatcher: FSWatcher;
let isWork = false;
let workDelay = 100;

function sceneconnectListener(event: WatchEventType, filename: string) {
    if (event != 'change') return;
    if (isWork) return;//控制处理频率
    isWork = true;
    setTimeout(() => {
        isWork = false;
        try {
            let obj = fs.readJSONSync(Constant.SceneConnectFilePath);
            if (Object.keys(obj).length == 0) return;
            for (const key in obj) {
                let params: any[] = obj[key];
                let func = methods[key];
                if (typeof func === "function") {
                    func.apply(this, params);
                } else {
                    Logger.error(`${key}方法未在SceneMain的methods中注册`);
                }
            }
            fs.writeJSONSync(Constant.SceneConnectFilePath, {});
        } catch (e) {
            Logger.error(e);
        }
    }, workDelay);
}
