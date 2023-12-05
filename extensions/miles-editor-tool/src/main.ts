import { CmdExecute } from "./CmdExecute";
import { HotUpdate } from "./postbuild/HotUpdate";


/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    loadExcel: CmdExecute.loadExcel,
    genConst: CmdExecute.genConst,
    formatProject: CmdExecute.formatProject,
    autoGenProperty: CmdExecute.autoGenProperty,
    replaceComponent: CmdExecute.replaceComponent,
    closeTexCompress: CmdExecute.closeTexCompress,
    setTexCompress: CmdExecute.setTexCompress,
    openBuildTemplate: CmdExecute.openBuildTemplate,
    closeBuildTemplate: CmdExecute.closeBuildTemplate,
    saveHotUpdateConfig: CmdExecute.saveHotUpdateConfig,
    genHotUpdateRes: HotUpdate.genHotUpdateRes.bind(HotUpdate),
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



