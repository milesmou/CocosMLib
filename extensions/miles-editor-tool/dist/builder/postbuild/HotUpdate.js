"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotUpdate = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const AliOSS_1 = require("../../thirdpart/alioss/AliOSS");
const Config_1 = require("../../tools/Config");
const Utils_1 = require("../../tools/Utils");
const BuildLogger_1 = require("../BuildLogger");
const HotUpdateConfig_1 = require("./HotUpdateConfig");
const MainJsCode_1 = require("./MainJsCode");
const VersionGenerator_1 = require("./VersionGenerator");
const tag = "[HotUpdate]";
/** 原生平台检查构建配置和修改main.js */
class HotUpdate {
    /** 修改main.js脚本 插入添加搜索路径的代码 */
    static modifyJsFile(options, result) {
        let buildPath = Utils_1.Utils.toUniSeparator(result.dest);
        HotUpdateConfig_1.HotUpdateConfig.buildPath = buildPath;
        HotUpdateConfig_1.HotUpdateConfig.buildTaskName = options.taskName;
        let dataDir = path_1.default.join(result.dest, 'data');
        if (options.md5Cache) {
            BuildLogger_1.BuildLogger.error(tag, "启用热更时应当关闭MD5缓存");
        }
        //修改main.js 中的搜索路径
        let mainjs = path_1.default.join(dataDir, 'main.js');
        if (fs_extra_1.default.existsSync(mainjs)) {
            let content = fs_extra_1.default.readFileSync(mainjs, { encoding: "utf8" });
            content = MainJsCode_1.MainJsCode.insertCode.replace("%version%", HotUpdateConfig_1.HotUpdateConfig.appVersion) + "\n" + content;
            fs_extra_1.default.writeFileSync(mainjs, content, { encoding: "utf8" });
            BuildLogger_1.BuildLogger.info(tag, "修改main.js,追加搜索路径完成 搜索路径Key=" + HotUpdateConfig_1.HotUpdateConfig.appVersion);
        }
    }
    /** 资源打包后使用最新的清单文件替换旧的清单文件 */
    static replaceManifest(options, result) {
        var _a;
        let oldManifest = Utils_1.Utils.ProjectPath + "/assets/resources/project.manifest";
        if (!fs_extra_1.default.existsSync(oldManifest)) {
            BuildLogger_1.BuildLogger.error(tag, "assets/resources/project.manifest文件不存在,请导入文件后重新打包,如不需要热更请忽略");
            return;
        }
        let fileUuid = (_a = fs_extra_1.default.readJSONSync(oldManifest + ".meta")) === null || _a === void 0 ? void 0 : _a.uuid;
        let buildPath = HotUpdateConfig_1.HotUpdateConfig.buildPath;
        let dest = Utils_1.Utils.ProjectPath + "/temp/manifest";
        fs_extra_1.default.ensureDirSync(dest);
        if (this.genManifest(dest, true)) {
            let newManifest = dest + '/project.manifest';
            let dir = buildPath + '/data/assets/resources';
            let oldManifest = Utils_1.Utils.getAllFiles(dir, file => {
                let basename = path_1.default.basename(file);
                return basename.startsWith(fileUuid) && basename.endsWith(".manifest");
            })[0];
            if (oldManifest) {
                fs_extra_1.default.copyFileSync(newManifest, oldManifest);
                BuildLogger_1.BuildLogger.info(tag, `替换热更资源清单文件成功`, path_1.default.basename(oldManifest));
            }
            else {
                BuildLogger_1.BuildLogger.error(tag, `替换热更资源清单文件失败 未在构建的工程中找到清单文件 dir=${dir}`);
            }
        }
        else {
            BuildLogger_1.BuildLogger.error(tag, `替换热更资源清单文件失败`);
        }
    }
    /** 生成热更资源 */
    static genHotUpdateRes() {
        let buildPath = HotUpdateConfig_1.HotUpdateConfig.buildPath;
        let dest = Utils_1.Utils.ProjectPath + "/hotupdate/" + HotUpdateConfig_1.HotUpdateConfig.appVersion + "/" + HotUpdateConfig_1.HotUpdateConfig.patchVersion;
        let data = Utils_1.Utils.toUniSeparator(path_1.default.join(buildPath, 'data'));
        try {
            if (this.genManifest(dest, false)) { //生成清单后 拷贝资源
                fs_extra_1.default.copySync(data + '/src', dest + "/src");
                fs_extra_1.default.copySync(data + '/assets', dest + "/assets");
                fs_extra_1.default.copySync(data + '/jsb-adapter', dest + "/jsb-adapter");
                fs_extra_1.default.copySync(dest + '/project.manifest', Utils_1.Utils.ProjectPath + "/assets/resources/project.manifest");
                Utils_1.Utils.refreshAsset(Utils_1.Utils.ProjectPath + "/assets/resources/project.manifest");
                BuildLogger_1.BuildLogger.info(`生成热更资源完成 ${dest}`);
            }
            else {
                BuildLogger_1.BuildLogger.error(`生成热更资源失败`);
            }
        }
        catch (e) {
            BuildLogger_1.BuildLogger.error(`生成热更资源失败 ${e}`);
        }
    }
    /** 上传热更资源到OSS */
    static async uploadHotUpdateRes() {
        let dest = Utils_1.Utils.ProjectPath + "/hotupdate/" + HotUpdateConfig_1.HotUpdateConfig.appVersion + "/" + HotUpdateConfig_1.HotUpdateConfig.patchVersion;
        let ossDir = Config_1.Config.get("gameSetting.hotupdateResOSSUploadDir", "");
        BuildLogger_1.BuildLogger.info(`appVersion=${HotUpdateConfig_1.HotUpdateConfig.appVersion} patchVersion=${HotUpdateConfig_1.HotUpdateConfig.patchVersion}`);
        if (fs_extra_1.default.existsSync(dest)) {
            let value = await Editor.Dialog.info(`是否上传文件到OSS?`, {
                title: "上传远程资源",
                detail: ossDir,
                default: 1,
                buttons: ['取消', '确认']
            });
            let upload = value.response != 0;
            if (upload) {
                let alioss = new AliOSS_1.AliOSS(dest, ossDir);
                let files = Utils_1.Utils.getAllFiles(dest);
                await alioss.upload(HotUpdateConfig_1.HotUpdateConfig.buildTaskName, files);
            }
            else {
                BuildLogger_1.BuildLogger.info(`取消上传`);
            }
        }
        else {
            BuildLogger_1.BuildLogger.error(`热更资源目录不存在 ${dest}`);
        }
    }
    /**
     * 生成资源清单文件
     * @param normalBuild 是否是正常构建工程,而不是生成热更资源
     */
    static genManifest(dest, normalBuild) {
        let buildPath = HotUpdateConfig_1.HotUpdateConfig.buildPath;
        let url = HotUpdateConfig_1.HotUpdateConfig.url;
        let patchVersion = HotUpdateConfig_1.HotUpdateConfig.patchVersion;
        if (!url || !patchVersion) {
            BuildLogger_1.BuildLogger.warn(`热更配置不正确,若需要使用热更,请先检查热更配置`);
        }
        if (!buildPath) {
            BuildLogger_1.BuildLogger.info(`请先构建一次Native工程 再生成热更资源`);
            return false;
        }
        let data = Utils_1.Utils.toUniSeparator(path_1.default.join(buildPath, 'data'));
        if (!normalBuild) {
            BuildLogger_1.BuildLogger.info(`url=${url}`);
            BuildLogger_1.BuildLogger.info(`appVersion=${HotUpdateConfig_1.HotUpdateConfig.appVersion} patchVersion=${patchVersion}`);
            BuildLogger_1.BuildLogger.info(`data=${data}`);
            BuildLogger_1.BuildLogger.info(`dest=${dest}`);
        }
        try {
            VersionGenerator_1.VersionGenerator.gen(url, patchVersion, data, dest);
        }
        catch (e) {
            BuildLogger_1.BuildLogger.error(e);
            return false;
        }
        return true;
    }
}
exports.HotUpdate = HotUpdate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSG90VXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc291cmNlL2J1aWxkZXIvcG9zdGJ1aWxkL0hvdFVwZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSx3REFBMEI7QUFDMUIsZ0RBQXdCO0FBRXhCLDBEQUF1RDtBQUN2RCwrQ0FBNEM7QUFDNUMsNkNBQTBDO0FBQzFDLGdEQUE2QztBQUM3Qyx1REFBb0Q7QUFDcEQsNkNBQTBDO0FBQzFDLHlEQUFzRDtBQUV0RCxNQUFNLEdBQUcsR0FBRyxhQUFhLENBQUM7QUFFMUIsMkJBQTJCO0FBQzNCLE1BQWEsU0FBUztJQUVsQiw4QkFBOEI7SUFDdkIsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUF5QixFQUFFLE1BQW9CO1FBQ3RFLElBQUksU0FBUyxHQUFHLGFBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xELGlDQUFlLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUN0QyxpQ0FBZSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBRWpELElBQUksT0FBTyxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUU3QyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7WUFDbEIseUJBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDLENBQUM7U0FDNUM7UUFFRCxrQkFBa0I7UUFDbEIsSUFBSSxNQUFNLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDM0MsSUFBSSxrQkFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN2QixJQUFJLE9BQU8sR0FBRyxrQkFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FB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QXdCLENBQUMsQ0FBQztZQUMzQyxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUNELElBQUksSUFBSSxHQUFHLGFBQUssQ0FBQyxjQUFjLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2QseUJBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQy9CLHlCQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsaUNBQWUsQ0FBQyxVQUFVLGlCQUFpQixZQUFZLEVBQUUsQ0FBQyxDQUFBO1lBQ3pGLHlCQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNqQyx5QkFBVyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUM7U0FDcEM7UUFDRCxJQUFJO1lBQ0EsbUNBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3ZEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUix5QkFBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FHSjtBQXRJRCw4QkFzSUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBJQnVpbGRSZXN1bHQsIElCdWlsZFRhc2tPcHRpb24gfSBmcm9tIFwiLi4vLi4vLi4vQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL2J1aWxkZXIvQHR5cGVzXCI7XG5pbXBvcnQgeyBBbGlPU1MgfSBmcm9tIFwiLi4vLi4vdGhpcmRwYXJ0L2FsaW9zcy9BbGlPU1NcIjtcbmltcG9ydCB7IENvbmZpZyB9IGZyb20gXCIuLi8uLi90b29scy9Db25maWdcIjtcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSBcIi4uLy4uL3Rvb2xzL1V0aWxzXCI7XG5pbXBvcnQgeyBCdWlsZExvZ2dlciB9IGZyb20gXCIuLi9CdWlsZExvZ2dlclwiO1xuaW1wb3J0IHsgSG90VXBkYXRlQ29uZmlnIH0gZnJvbSBcIi4vSG90VXBkYXRlQ29uZmlnXCI7XG5pbXBvcnQgeyBNYWluSnNDb2RlIH0gZnJvbSBcIi4vTWFpbkpzQ29kZVwiO1xuaW1wb3J0IHsgVmVyc2lvbkdlbmVyYXRvciB9IGZyb20gXCIuL1ZlcnNpb25HZW5lcmF0b3JcIjtcblxuY29uc3QgdGFnID0gXCJbSG90VXBkYXRlXVwiO1xuXG4vKiog5Y6f55Sf5bmz5Y+w5qOA5p+l5p6E5bu66YWN572u5ZKM5L+u5pS5bWFpbi5qcyAqL1xuZXhwb3J0IGNsYXNzIEhvdFVwZGF0ZSB7XG5cbiAgICAvKiog5L+u5pS5bWFpbi5qc+iEmuacrCDmj5LlhaXmt7vliqDmkJzntKLot6/lvoTnmoTku6PnoIEgKi9cbiAgICBwdWJsaWMgc3RhdGljIG1vZGlmeUpzRmlsZShvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCkge1xuICAgICAgICBsZXQgYnVpbGRQYXRoID0gVXRpbHMudG9VbmlTZXBhcmF0b3IocmVzdWx0LmRlc3QpO1xuICAgICAgICBIb3RVcGRhdGVDb25maWcuYnVpbGRQYXRoID0gYnVpbGRQYXRoO1xuICAgICAgICBIb3RVcGRhdGVDb25maWcuYnVpbGRUYXNrTmFtZSA9IG9wdGlvbnMudGFza05hbWU7XG5cbiAgICAgICAgbGV0IGRhdGFEaXIgPSBwYXRoLmpvaW4ocmVzdWx0LmRlc3QsICdkYXRhJyk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubWQ1Q2FjaGUpIHtcbiAgICAgICAgICAgIEJ1aWxkTG9nZ2VyLmVycm9yKHRhZywgXCLlkK/nlKjng63mm7Tml7blupTlvZPlhbPpl61NRDXnvJPlrZhcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvL+S/ruaUuW1haW4uanMg5Lit55qE5pCc57Si6Lev5b6EXG4gICAgICAgIGxldCBtYWluanMgPSBwYXRoLmpvaW4oZGF0YURpciwgJ21haW4uanMnKTtcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMobWFpbmpzKSkge1xuICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMobWFpbmpzLCB7IGVuY29kaW5nOiBcInV0ZjhcIiB9KTtcbiAgICAgICAgICAgIGNvbnRlbnQgPSBNYWluSnNDb2RlLmluc2VydENvZGUucmVwbGFjZShcIiV2ZXJzaW9uJVwiLCBIb3RVcGRhdGVDb25maWcuYXBwVmVyc2lvbikgKyBcIlxcblwiICsgY29udGVudDtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMobWFpbmpzLCBjb250ZW50LCB7IGVuY29kaW5nOiBcInV0ZjhcIiB9KTtcbiAgICAgICAgICAgIEJ1aWxkTG9nZ2VyLmluZm8odGFnLCBcIuS/ruaUuW1haW4uanMs6L+95Yqg5pCc57Si6Lev5b6E5a6M5oiQIOaQnOe0oui3r+W+hEtleT1cIiArIEhvdFVwZGF0ZUNvbmZpZy5hcHBWZXJzaW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiDotYTmupDmiZPljIXlkI7kvb/nlKjmnIDmlrDnmoTmuIXljZXmlofku7bmm7/mjaLml6fnmoTmuIXljZXmlofku7YgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlcGxhY2VNYW5pZmVzdChvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCkge1xuICAgICAgICBsZXQgb2xkTWFuaWZlc3QgPSBVdGlscy5Qcm9qZWN0UGF0aCArIFwiL2Fzc2V0cy9yZXNvdXJjZXMvcHJvamVjdC5tYW5pZmVzdFwiO1xuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMob2xkTWFuaWZlc3QpKSB7XG4gICAgICAgICAgICBCdWlsZExvZ2dlci5lcnJvcih0YWcsIFwiYXNzZXRzL3Jlc291cmNlcy9wcm9qZWN0Lm1hbmlmZXN05paH5Lu25LiN5a2Y5ZyoLOivt+WvvOWFpeaWh+S7tuWQjumHjeaWsOaJk+WMhSzlpoLkuI3pnIDopoHng63mm7Tor7flv73nlaVcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGZpbGVVdWlkID0gZnMucmVhZEpTT05TeW5jKG9sZE1hbmlmZXN0ICsgXCIubWV0YVwiKT8udXVpZDtcbiAgICAgICAgbGV0IGJ1aWxkUGF0aCA9IEhvdFVwZGF0ZUNvbmZpZy5idWlsZFBhdGg7XG4gICAgICAgIGxldCBkZXN0ID0gVXRpbHMuUHJvamVjdFBhdGggKyBcIi90ZW1wL21hbmlmZXN0XCI7XG4gICAgICAgIGZzLmVuc3VyZURpclN5bmMoZGVzdCk7XG4gICAgICAgIGlmICh0aGlzLmdlbk1hbmlmZXN0KGRlc3QsIHRydWUpKSB7XG4gICAgICAgICAgICBsZXQgbmV3TWFuaWZlc3QgPSBkZXN0ICsgJy9wcm9qZWN0Lm1hbmlmZXN0JztcbiAgICAgICAgICAgIGxldCBkaXIgPSBidWlsZFBhdGggKyAnL2RhdGEvYXNzZXRzL3Jlc291cmNlcyc7XG4gICAgICAgICAgICBsZXQgb2xkTWFuaWZlc3QgPSBVdGlscy5nZXRBbGxGaWxlcyhkaXIsIGZpbGUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBiYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJhc2VuYW1lLnN0YXJ0c1dpdGgoZmlsZVV1aWQpICYmIGJhc2VuYW1lLmVuZHNXaXRoKFwiLm1hbmlmZXN0XCIpO1xuICAgICAgICAgICAgfSlbMF07XG4gICAgICAgICAgICBpZiAob2xkTWFuaWZlc3QpIHtcbiAgICAgICAgICAgICAgICBmcy5jb3B5RmlsZVN5bmMobmV3TWFuaWZlc3QsIG9sZE1hbmlmZXN0KTtcbiAgICAgICAgICAgICAgICBCdWlsZExvZ2dlci5pbmZvKHRhZywgYOabv+aNoueDreabtOi1hOa6kOa4heWNleaWh+S7tuaIkOWKn2AsIHBhdGguYmFzZW5hbWUob2xkTWFuaWZlc3QpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgQnVpbGRMb2dnZXIuZXJyb3IodGFnLCBg5pu/5o2i54Ot5pu06LWE5rqQ5riF5Y2V5paH5Lu25aSx6LSlIOacquWcqOaehOW7uueahOW3peeoi+S4reaJvuWIsOa4heWNleaWh+S7tiBkaXI9JHtkaXJ9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBCdWlsZExvZ2dlci5lcnJvcih0YWcsIGDmm7/mjaLng63mm7TotYTmupDmuIXljZXmlofku7blpLHotKVgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiDnlJ/miJDng63mm7TotYTmupAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdlbkhvdFVwZGF0ZVJlcygpIHtcbiAgICAgICAgbGV0IGJ1aWxkUGF0aCA9IEhvdFVwZGF0ZUNvbmZpZy5idWlsZFBhdGg7XG4gICAgICAgIGxldCBkZXN0ID0gVXRpbHMuUHJvamVjdFBhdGggKyBcIi9ob3R1cGRhdGUvXCIgKyBIb3RVcGRhdGVDb25maWcuYXBwVmVyc2lvbiArIFwiL1wiICsgSG90VXBkYXRlQ29uZmlnLnBhdGNoVmVyc2lvbjtcbiAgICAgICAgbGV0IGRhdGEgPSBVdGlscy50b1VuaVNlcGFyYXRvcihwYXRoLmpvaW4oYnVpbGRQYXRoLCAnZGF0YScpKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmdlbk1hbmlmZXN0KGRlc3QsIGZhbHNlKSkgey8v55Sf5oiQ5riF5Y2V5ZCOIOaLt+i0nei1hOa6kFxuICAgICAgICAgICAgICAgIGZzLmNvcHlTeW5jKGRhdGEgKyAnL3NyYycsIGRlc3QgKyBcIi9zcmNcIik7XG4gICAgICAgICAgICAgICAgZnMuY29weVN5bmMoZGF0YSArICcvYXNzZXRzJywgZGVzdCArIFwiL2Fzc2V0c1wiKTtcbiAgICAgICAgICAgICAgICBmcy5jb3B5U3luYyhkYXRhICsgJy9qc2ItYWRhcHRlcicsIGRlc3QgKyBcIi9qc2ItYWRhcHRlclwiKTtcbiAgICAgICAgICAgICAgICBmcy5jb3B5U3luYyhkZXN0ICsgJy9wcm9qZWN0Lm1hbmlmZXN0JywgVXRpbHMuUHJvamVjdFBhdGggKyBcIi9hc3NldHMvcmVzb3VyY2VzL3Byb2plY3QubWFuaWZlc3RcIik7XG4gICAgICAgICAgICAgICAgVXRpbHMucmVmcmVzaEFzc2V0KFV0aWxzLlByb2plY3RQYXRoICsgXCIvYXNzZXRzL3Jlc291cmNlcy9wcm9qZWN0Lm1hbmlmZXN0XCIpO1xuICAgICAgICAgICAgICAgIEJ1aWxkTG9nZ2VyLmluZm8oYOeUn+aIkOeDreabtOi1hOa6kOWujOaIkCAke2Rlc3R9YCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIEJ1aWxkTG9nZ2VyLmVycm9yKGDnlJ/miJDng63mm7TotYTmupDlpLHotKVgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgQnVpbGRMb2dnZXIuZXJyb3IoYOeUn+aIkOeDreabtOi1hOa6kOWksei0pSAke2V9YCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKiDkuIrkvKDng63mm7TotYTmupDliLBPU1MgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIHVwbG9hZEhvdFVwZGF0ZVJlcygpIHtcbiAgICAgICAgbGV0IGRlc3QgPSBVdGlscy5Qcm9qZWN0UGF0aCArIFwiL2hvdHVwZGF0ZS9cIiArIEhvdFVwZGF0ZUNvbmZpZy5hcHBWZXJzaW9uICsgXCIvXCIgKyBIb3RVcGRhdGVDb25maWcucGF0Y2hWZXJzaW9uO1xuICAgICAgICBsZXQgb3NzRGlyID0gQ29uZmlnLmdldChcImdhbWVTZXR0aW5nLmhvdHVwZGF0ZVJlc09TU1VwbG9hZERpclwiLCBcIlwiKTtcbiAgICAgICAgQnVpbGRMb2dnZXIuaW5mbyhgYXBwVmVyc2lvbj0ke0hvdFVwZGF0ZUNvbmZpZy5hcHBWZXJzaW9ufSBwYXRjaFZlcnNpb249JHtIb3RVcGRhdGVDb25maWcucGF0Y2hWZXJzaW9ufWApO1xuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhkZXN0KSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gYXdhaXQgRWRpdG9yLkRpYWxvZy5pbmZvKGDmmK/lkKbkuIrkvKDmlofku7bliLBPU1M/YCwge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBcIuS4iuS8oOi/nOeoi+i1hOa6kFwiLFxuICAgICAgICAgICAgICAgIGRldGFpbDogb3NzRGlyLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IDEsXG4gICAgICAgICAgICAgICAgYnV0dG9uczogWyflj5bmtognLCAn56Gu6K6kJ11cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBsZXQgdXBsb2FkID0gdmFsdWUucmVzcG9uc2UgIT0gMDtcbiAgICAgICAgICAgIGlmICh1cGxvYWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgYWxpb3NzID0gbmV3IEFsaU9TUyhkZXN0LCBvc3NEaXIpO1xuICAgICAgICAgICAgICAgIGxldCBmaWxlczogc3RyaW5nW10gPSBVdGlscy5nZXRBbGxGaWxlcyhkZXN0KTtcbiAgICAgICAgICAgICAgICBhd2FpdCBhbGlvc3MudXBsb2FkKEhvdFVwZGF0ZUNvbmZpZy5idWlsZFRhc2tOYW1lLCBmaWxlcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIEJ1aWxkTG9nZ2VyLmluZm8oYOWPlua2iOS4iuS8oGApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgQnVpbGRMb2dnZXIuZXJyb3IoYOeDreabtOi1hOa6kOebruW9leS4jeWtmOWcqCAke2Rlc3R9YCk7XG4gICAgICAgIH1cblxuXG4gICAgfVxuXG4gICAgLyoqIFxuICAgICAqIOeUn+aIkOi1hOa6kOa4heWNleaWh+S7tlxuICAgICAqIEBwYXJhbSBub3JtYWxCdWlsZCDmmK/lkKbmmK/mraPluLjmnoTlu7rlt6XnqIss6ICM5LiN5piv55Sf5oiQ54Ot5pu06LWE5rqQXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2VuTWFuaWZlc3QoZGVzdDogc3RyaW5nLCBub3JtYWxCdWlsZDogYm9vbGVhbikge1xuICAgICAgICBsZXQgYnVpbGRQYXRoID0gSG90VXBkYXRlQ29uZmlnLmJ1aWxkUGF0aDtcbiAgICAgICAgbGV0IHVybCA9IEhvdFVwZGF0ZUNvbmZpZy51cmw7XG4gICAgICAgIGxldCBwYXRjaFZlcnNpb24gPSBIb3RVcGRhdGVDb25maWcucGF0Y2hWZXJzaW9uO1xuICAgICAgICBpZiAoIXVybCB8fCAhcGF0Y2hWZXJzaW9uKSB7XG4gICAgICAgICAgICBCdWlsZExvZ2dlci53YXJuKGDng63mm7TphY3nva7kuI3mraPnoa4s6Iul6ZyA6KaB5L2/55So54Ot5pu0LOivt+WFiOajgOafpeeDreabtOmFjee9rmApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYnVpbGRQYXRoKSB7XG4gICAgICAgICAgICBCdWlsZExvZ2dlci5pbmZvKGDor7flhYjmnoTlu7rkuIDmrKFOYXRpdmXlt6XnqIsg5YaN55Sf5oiQ54Ot5pu06LWE5rqQYCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGRhdGEgPSBVdGlscy50b1VuaVNlcGFyYXRvcihwYXRoLmpvaW4oYnVpbGRQYXRoLCAnZGF0YScpKTtcbiAgICAgICAgaWYgKCFub3JtYWxCdWlsZCkge1xuICAgICAgICAgICAgQnVpbGRMb2dnZXIuaW5mbyhgdXJsPSR7dXJsfWApO1xuICAgICAgICAgICAgQnVpbGRMb2dnZXIuaW5mbyhgYXBwVmVyc2lvbj0ke0hvdFVwZGF0ZUNvbmZpZy5hcHBWZXJzaW9ufSBwYXRjaFZlcnNpb249JHtwYXRjaFZlcnNpb259YClcbiAgICAgICAgICAgIEJ1aWxkTG9nZ2VyLmluZm8oYGRhdGE9JHtkYXRhfWApO1xuICAgICAgICAgICAgQnVpbGRMb2dnZXIuaW5mbyhgZGVzdD0ke2Rlc3R9YCk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIFZlcnNpb25HZW5lcmF0b3IuZ2VuKHVybCwgcGF0Y2hWZXJzaW9uLCBkYXRhLCBkZXN0KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgQnVpbGRMb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG5cbn0iXX0=