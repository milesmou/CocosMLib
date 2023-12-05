import { CmdExecute } from "./CmdExecute";
import { HotUpdate } from "./postbuild/HotUpdate";
import { SceneCmdExecute } from "./scene/SceneCmdExecute";


/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    loadExcel: CmdExecute.loadExcel,
    genConst: CmdExecute.genConst,
    formatProject: CmdExecute.formatProject,
    closeTexCompress: CmdExecute.closeTexCompress,
    setTexCompress: CmdExecute.setTexCompress,
    openBuildTemplate: CmdExecute.openBuildTemplate,
    closeBuildTemplate: CmdExecute.closeBuildTemplate,
    genHotUpdateRes: HotUpdate.genHotUpdateRes.bind(HotUpdate),
    delInvalidProperty: CmdExecute.delInvalidProperty,
    //场景操作命令
    autoGenProperty: SceneCmdExecute.autoGenProperty,
    replaceComponent: SceneCmdExecute.replaceComponent,
    saveHotUpdateConfig: SceneCmdExecute.saveHotUpdateConfig,
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() { }

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() { }



