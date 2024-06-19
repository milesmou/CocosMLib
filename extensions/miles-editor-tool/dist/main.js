"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
const CmdExecute_1 = require("./CmdExecute");
const HotUpdate_1 = require("./postbuild/HotUpdate");
const SceneCmdExecute_1 = require("./scene/SceneCmdExecute");
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    saveGameSetting: CmdExecute_1.CmdExecute.saveGameSetting,
    loadExcel: CmdExecute_1.CmdExecute.loadExcel,
    genConst: CmdExecute_1.CmdExecute.genConst,
    formatProject: CmdExecute_1.CmdExecute.formatProject,
    closeTexCompress: CmdExecute_1.CmdExecute.closeTexCompress,
    setTexCompress: CmdExecute_1.CmdExecute.setTexCompress,
    openBuildTemplate: CmdExecute_1.CmdExecute.openBuildTemplate,
    closeBuildTemplate: CmdExecute_1.CmdExecute.closeBuildTemplate,
    genHotUpdateRes: HotUpdate_1.HotUpdate.genHotUpdateRes.bind(HotUpdate_1.HotUpdate),
    delInvalidProperty: CmdExecute_1.CmdExecute.delInvalidProperty,
    //场景操作命令
    autoGenProperty: SceneCmdExecute_1.SceneCmdExecute.autoGenProperty,
    replaceComponent: SceneCmdExecute_1.SceneCmdExecute.replaceComponent,
    //测试
    test: CmdExecute_1.CmdExecute.test,
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
