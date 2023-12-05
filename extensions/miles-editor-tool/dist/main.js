"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
const CmdExecute_1 = require("./CmdExecute");
const HotUpdate_1 = require("./postbuild/HotUpdate");
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    loadExcel: CmdExecute_1.CmdExecute.loadExcel,
    genConst: CmdExecute_1.CmdExecute.genConst,
    formatProject: CmdExecute_1.CmdExecute.formatProject,
    autoGenProperty: CmdExecute_1.CmdExecute.autoGenProperty,
    replaceComponent: CmdExecute_1.CmdExecute.replaceComponent,
    closeTexCompress: CmdExecute_1.CmdExecute.closeTexCompress,
    setTexCompress: CmdExecute_1.CmdExecute.setTexCompress,
    openBuildTemplate: CmdExecute_1.CmdExecute.openBuildTemplate,
    closeBuildTemplate: CmdExecute_1.CmdExecute.closeBuildTemplate,
    saveHotUpdateConfig: CmdExecute_1.CmdExecute.saveHotUpdateConfig,
    genHotUpdateRes: HotUpdate_1.HotUpdate.genHotUpdateRes.bind(HotUpdate_1.HotUpdate),
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
