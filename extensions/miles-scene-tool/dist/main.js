"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
const path_1 = require("path");
const GenProperty_1 = require("./GenProperty");
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
const HotUpdateConfig_1 = require("./HotUpdateConfig");
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    autoGenProperty: GenProperty_1.GenProperty.gen.bind(GenProperty_1.GenProperty),
    saveHotUpdateConfig: HotUpdateConfig_1.HotUpdateConfig.save.bind(HotUpdateConfig_1.HotUpdateConfig),
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
function load() { }
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
function unload() { }
exports.unload = unload;
