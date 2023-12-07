import { Config } from "./tools/Config";
import { MLogger } from "./tools/MLogger";
import { SceneTool } from "./tools/SceneTool";
interface IApp {
    _channel: string;
    _version: string;
    m_CdnUrl: string;
}

export class HotUpdateConfig {
    static save(uuid: string) {
        let node = SceneTool.getNodeByUUid(uuid);
        if (node) {
            let setting: IApp = node.getComponent("GameSetting") as any;
            if (setting) {
                let channelName = setting._channel;
                let version = setting._version;
                let cdnUrl = setting.m_CdnUrl;
                let url = `${cdnUrl.trim()}/Channel/${channelName}/${this.getMainVersion(version)}/ResPkg`;
                Config.set("hotupdate.url", url);
                Config.set("hotupdate.version", version);
                MLogger.info("更新热更配置成功", url, version);
                return;
            }
        }
        MLogger.warn("请选择GameSetting脚本所在节点再进行操作");
    }

    //主版本号 取前三位
    private static getMainVersion(version: string) {
        let versionArr = version.split(".");
        if (versionArr.length == 4) {
            return versionArr.slice(0, 3).join(".");
        }
        return version;
    }
}