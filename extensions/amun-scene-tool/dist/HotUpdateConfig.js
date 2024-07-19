"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotUpdateConfig = void 0;
const cc_1 = require("cc");
const Config_1 = require("./tools/Config");
const Logger_1 = require("./tools/Logger");
class HotUpdateConfig {
    static save() {
        let setting = cc_1.director.getScene().getComponentInChildren("GameSetting");
        if (setting) {
            let gameName = setting._gameName;
            let channelName = setting._channel;
            let version = setting._version;
            let cdnUrl = setting.m_CdnUrl;
            let url = `${cdnUrl.trim()}/${gameName}/Channel/${channelName}/${this.getMainVersion(version)}/ResPkg`;
            Config_1.Config.set("hotupdate.url", url);
            Config_1.Config.set("hotupdate.version", version);
            Logger_1.Logger.info("更新热更配置成功", url, version);
            return;
        }
        Logger_1.Logger.warn("场景中未找到GameSetting组件");
    }
    //主版本号 取前三位
    static getMainVersion(version) {
        let versionArr = version.split(".");
        if (versionArr.length == 4) {
            return versionArr.slice(0, 3).join(".");
        }
        return version;
    }
}
exports.HotUpdateConfig = HotUpdateConfig;
