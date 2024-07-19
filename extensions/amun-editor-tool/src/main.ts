import { CmdExecute } from "./CmdExecute";
import { HotUpdate } from "./postbuild/HotUpdate";
import { SceneCmdExecute } from "./scene/SceneCmdExecute";


/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    saveGameSetting: CmdExecute.saveGameSetting.bind(CmdExecute),
    loadExcel: CmdExecute.loadExcel.bind(CmdExecute),
    genConst: CmdExecute.genConst.bind(CmdExecute),
    formatProject: CmdExecute.formatProject.bind(CmdExecute),
    closeTexCompress: CmdExecute.closeTexCompress.bind(CmdExecute),
    setTexCompress: CmdExecute.setTexCompress.bind(CmdExecute),
    openBuildTemplate: CmdExecute.openBuildTemplate.bind(CmdExecute),
    closeBuildTemplate: CmdExecute.closeBuildTemplate.bind(CmdExecute),
    genHotUpdateRes: HotUpdate.genHotUpdateRes.bind(HotUpdate),
    delInvalidProperty: CmdExecute.delInvalidProperty.bind(CmdExecute),
    //场景操作命令
    autoGenProperty: SceneCmdExecute.autoGenProperty.bind(SceneCmdExecute),
    replaceComponent: SceneCmdExecute.replaceComponent.bind(SceneCmdExecute),
    //测试
    test: HotUpdate.replaceManifest.bind(HotUpdate),
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



