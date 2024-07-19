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
    saveGameSetting: CmdExecute_1.CmdExecute.saveGameSetting.bind(CmdExecute_1.CmdExecute),
    loadExcel: CmdExecute_1.CmdExecute.loadExcel.bind(CmdExecute_1.CmdExecute),
    genConst: CmdExecute_1.CmdExecute.genConst.bind(CmdExecute_1.CmdExecute),
    formatProject: CmdExecute_1.CmdExecute.formatProject.bind(CmdExecute_1.CmdExecute),
    closeTexCompress: CmdExecute_1.CmdExecute.closeTexCompress.bind(CmdExecute_1.CmdExecute),
    setTexCompress: CmdExecute_1.CmdExecute.setTexCompress.bind(CmdExecute_1.CmdExecute),
    openBuildTemplate: CmdExecute_1.CmdExecute.openBuildTemplate.bind(CmdExecute_1.CmdExecute),
    closeBuildTemplate: CmdExecute_1.CmdExecute.closeBuildTemplate.bind(CmdExecute_1.CmdExecute),
    genHotUpdateRes: HotUpdate_1.HotUpdate.genHotUpdateRes.bind(HotUpdate_1.HotUpdate),
    openLogFile: CmdExecute_1.CmdExecute.openLogFile.bind(CmdExecute_1.CmdExecute),
    //场景操作命令
    autoGenProperty: SceneCmdExecute_1.SceneCmdExecute.autoGenProperty.bind(SceneCmdExecute_1.SceneCmdExecute),
    replaceComponent: SceneCmdExecute_1.SceneCmdExecute.replaceComponent.bind(SceneCmdExecute_1.SceneCmdExecute),
    //测试
    test: CmdExecute_1.CmdExecute.test.bind(CmdExecute_1.CmdExecute),
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
