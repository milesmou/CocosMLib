"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotUpdateConfig = void 0;
const cc_1 = require("cc");
const Config_1 = require("./tools/Config");
const MLogger_1 = require("./tools/MLogger");
class HotUpdateConfig {
    static save() {
        let setting = cc_1.director.getScene().getComponentInChildren("GameSetting");
        if (setting) {
            let channelName = setting._channel;
            let version = setting._version;
            let cdnUrl = setting.m_CdnUrl;
            let url = `${cdnUrl.trim()}/Channel/${channelName}/${this.getMainVersion(version)}/ResPkg`;
            Config_1.Config.set("hotupdate.url", url);
            Config_1.Config.set("hotupdate.version", version);
            MLogger_1.MLogger.info("更新热更配置成功", url, version);
            return;
        }
        MLogger_1.MLogger.warn("场景中未找到GameSetting组件");
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
