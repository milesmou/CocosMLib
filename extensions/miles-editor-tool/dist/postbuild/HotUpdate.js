"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotUpdate = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Config_1 = require("../tools/Config");
const LogToFile_1 = require("../tools/LogToFile");
const Utils_1 = require("../tools/Utils");
const MainJsCode_1 = require("./MainJsCode");
const VersionGgenerator_1 = require("./VersionGgenerator");
/** 原生平台检查构建配置和修改main.js */
class HotUpdate {
    static modifyMainJs(options, result) {
        if (Utils_1.Utils.isNative(options.platform)) {
            if (options.md5Cache) {
                LogToFile_1.LogToFile.log("若使用热更请关闭md5Cache");
                return;
            }
            let buildPath = Utils_1.Utils.toUniSeparator(result.dest);
            Config_1.Config.set("hotupdate.src", buildPath);
            let filePath = path_1.default.join(result.dest, 'data', 'main.js');
            if (!fs_extra_1.default.existsSync(filePath)) {
                filePath = path_1.default.join(result.dest, 'assets', 'main.js');
            }
            if (fs_extra_1.default.existsSync(filePath)) {
                let version = Config_1.Config.get("hotupdate.version", "");
                if (version) {
                    let arr = version.split(".");
                    if (arr.length == 4)
                        version = arr.slice(0, 3).join(".");
                    let content = MainJsCode_1.MainJsCode.code.replace("<%version%>", version) + "\n" + fs_extra_1.default.readFileSync(filePath, { encoding: "utf8" });
                    fs_extra_1.default.writeFileSync(filePath, content, { encoding: "utf8" });
                    LogToFile_1.LogToFile.log("修改热更搜索路径完成", version);
                }
                else {
                    LogToFile_1.LogToFile.log("若使用热更请先保存热更配置");
                }
            }
        }
    }
    static genHotUpdateRes() {
        let url = Config_1.Config.get("hotupdate.url", "");
        let version = Config_1.Config.get("hotupdate.version", "");
        let src = Config_1.Config.get("hotupdate.src", "");
        let dest = Utils_1.Utils.ProjectPath + "/hotupdate/" + version;
        if (!url || !version) {
            LogToFile_1.LogToFile.log(`热更配置不正确,请先检查热更配置`);
        }
        if (!src) {
            LogToFile_1.LogToFile.log(`请先构建一次Native工程 再生成热更资源`);
            return;
        }
        let newSrc = path_1.default.join(src, 'data');
        if (!fs_extra_1.default.existsSync(newSrc)) {
            newSrc = path_1.default.join(src, 'assets');
        }
        src = Utils_1.Utils.toUniSeparator(newSrc);
        LogToFile_1.LogToFile.log(`url=${url}`);
        LogToFile_1.LogToFile.log(`version=${version}`);
        LogToFile_1.LogToFile.log(`src=${src}`);
        LogToFile_1.LogToFile.log(`dest=${dest}`);
        try {
            VersionGgenerator_1.VersionGgenerator.gen(url, version, src, dest);
            fs_extra_1.default.copySync(src + '/src', dest + "/src");
            fs_extra_1.default.copySync(src + '/assets', dest + "/assets");
            fs_extra_1.default.copySync(src + '/jsb-adapter', dest + "/jsb-adapter");
            fs_extra_1.default.copySync(dest + '/project.manifest', Utils_1.Utils.ProjectPath + "/assets/resources/project.manifest");
            Utils_1.Utils.refreshAsset(Utils_1.Utils.toAssetDBUrl(Utils_1.Utils.ProjectPath + "/assets/resources/project.manifest"));
        }
        catch (e) {
            LogToFile_1.LogToFile.log(`生成热更资源失败 ${e}`);
        }
        LogToFile_1.LogToFile.log(`生成热更资源完成 ${dest}`);
    }
}
exports.HotUpdate = HotUpdate;
