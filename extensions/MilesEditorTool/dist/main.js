"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
const CmdExecute_1 = require("./CmdExecute");
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    loadExcel: CmdExecute_1.CmdExecute.loadExcel,
    genConst: CmdExecute_1.CmdExecute.genConst,
    autoBind: CmdExecute_1.CmdExecute.autoBind,
    formatProject: CmdExecute_1.CmdExecute.formatProject,
    testSelection: CmdExecute_1.CmdExecute.testSelection
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
function load() {
}
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
function unload() { }
exports.unload = unload;
