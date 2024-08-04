"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotUpdate = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Logger_1 = require("../../tools/Logger");
const Utils_1 = require("../../tools/Utils");
const HotUpdateConfig_1 = require("./HotUpdateConfig");
const MainJsCode_1 = require("./MainJsCode");
const VersionGenerator_1 = require("./VersionGenerator");
/** 原生平台检查构建配置和修改main.js */
class HotUpdate {
    /** 修改main.js脚本version */
    static modifyJsFile(options, result) {
        let buildPath = Utils_1.Utils.toUniSeparator(result.dest);
        HotUpdateConfig_1.HotUpdateConfig.buildPath = buildPath;
        let dataDir = path_1.default.join(result.dest, 'data');
        if (options.md5Cache) {
            Logger_1.Logger.error("启用热更时应当关闭MD5缓存");
        }
        //修改main.js 中的搜索路径
        let mainjs = path_1.default.join(dataDir, 'main.js');
        if (fs_extra_1.default.existsSync(mainjs)) {
            let version = HotUpdateConfig_1.HotUpdateConfig.mainVersion;
            if (version) {
                let content = fs_extra_1.default.readFileSync(mainjs, { encoding: "utf8" });
                content = MainJsCode_1.MainJsCode.insertCode.replace("<%version%>", version) + "\n" + content;
                fs_extra_1.default.writeFileSync(mainjs, content, { encoding: "utf8" });
                Logger_1.Logger.info("修改热更搜索路径完成", version);
            }
            else {
                Logger_1.Logger.info("若使用热更请先保存热更配置");
            }
        }
    }
    /** 资源打包后使用最新的清单文件替换旧的清单文件 */
    static replaceManifest(options, result) {
        var _a;
        let oldManifest = Utils_1.Utils.ProjectPath + "/assets/project.manifest";
        if (!fs_extra_1.default.existsSync(oldManifest)) {
            Logger_1.Logger.warn("assets/project.manifest文件不存在,请导入文件后重新打包,如不需要热更请忽略");
            return;
        }
        let fileUuid = (_a = fs_extra_1.default.readJSONSync(oldManifest + ".meta")) === null || _a === void 0 ? void 0 : _a.uuid;
        let buildPath = HotUpdateConfig_1.HotUpdateConfig.buildPath;
        let dest = Utils_1.Utils.ProjectPath + "/temp/manifest";
        fs_extra_1.default.ensureDirSync(dest);
        if (this.genManifest(dest, true)) {
            let newManifest = dest + '/project.manifest';
            let dir = buildPath + '/data/assets/main';
            let oldManifest = Utils_1.Utils.getAllFiles(dir, file => {
                let basename = path_1.default.basename(file);
                return basename.startsWith(fileUuid) && basename.endsWith(".manifest");
            })[0];
            if (oldManifest) {
                fs_extra_1.default.copyFileSync(newManifest, oldManifest);
                Logger_1.Logger.info(`替换热更资源清单文件成功`, path_1.default.basename(oldManifest));
            }
            else {
                Logger_1.Logger.error(`替换热更资源清单文件失败 未在构建的工程中找到清单文件`);
            }
        }
        else {
            Logger_1.Logger.error(`替换热更资源清单文件失败`);
        }
    }
    /** 生成热更资源 */
    static genHotUpdateRes() {
        let buildPath = HotUpdateConfig_1.HotUpdateConfig.buildPath;
        let url = HotUpdateConfig_1.HotUpdateConfig.url;
        let version = HotUpdateConfig_1.HotUpdateConfig.version;
        let dest = Utils_1.Utils.ProjectPath + "/hotupdate/" + version;
        let data = Utils_1.Utils.toUniSeparator(path_1.default.join(buildPath, 'data'));
        try {
            if (this.genManifest(dest, false)) { //生成清单后 拷贝资源
                fs_extra_1.default.copySync(data + '/src', dest + "/src");
                fs_extra_1.default.copySync(data + '/assets', dest + "/assets");
                fs_extra_1.default.copySync(data + '/jsb-adapter', dest + "/jsb-adapter");
                fs_extra_1.default.copySync(dest + '/project.manifest', Utils_1.Utils.ProjectPath + "/assets/project.manifest");
                Utils_1.Utils.refreshAsset(Utils_1.Utils.ProjectPath + "/assets/project.manifest");
                Logger_1.Logger.info(`生成热更资源完成 ${dest}`);
            }
            else {
                Logger_1.Logger.error(`生成热更资源失败`);
            }
        }
        catch (e) {
            Logger_1.Logger.error(`生成热更资源失败 ${e}`);
        }
    }
    /**
     * 生成资源清单文件
     * @param normalBuild 是否是正常构建工程,而不是生成热更资源
     */
    static genManifest(dest, normalBuild) {
        let buildPath = HotUpdateConfig_1.HotUpdateConfig.buildPath;
        let url = HotUpdateConfig_1.HotUpdateConfig.url;
        let version = HotUpdateConfig_1.HotUpdateConfig.version;
        if (!url || !version) {
            Logger_1.Logger.warn(`热更配置不正确,若需要使用热更,请先检查热更配置`);
        }
        if (!buildPath) {
            Logger_1.Logger.info(`请先构建一次Native工程 再生成热更资源`);
            return false;
        }
        let data = Utils_1.Utils.toUniSeparator(path_1.default.join(buildPath, 'data'));
        if (!normalBuild) {
            Logger_1.Logger.info(`url=${url}`);
            Logger_1.Logger.info(`version=${version}`);
            Logger_1.Logger.info(`data=${data}`);
            Logger_1.Logger.info(`dest=${dest}`);
        }
        try {
            VersionGenerator_1.VersionGenerator.gen(url, version, data, dest);
        }
        catch (e) {
            Logger_1.Logger.error(e);
            return false;
        }
        return true;
    }
}
exports.HotUpdate = HotUpdate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSG90VXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc291cmNlL2J1aWxkZXIvcG9zdGJ1aWxkL0hvdFVwZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQSx3REFBMEI7QUFDMUIsZ0RBQXdCO0FBQ3hCLCtDQUE0QztBQUM1Qyw2Q0FBMEM7QUFDMUMsdURBQW9EO0FBQ3BELDZDQUEwQztBQUMxQyx5REFBc0Q7QUFFdEQsMkJBQTJCO0FBQzNCLE1BQWEsU0FBUztJQUVsQix5QkFBeUI7SUFDbEIsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUF5QixFQUFFLE1BQW9CO1FBQ3RFLElBQUksU0FBUyxHQUFHLGFBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xELGlDQUFlLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUV0QyxJQUFJLE9BQU8sR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFN0MsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ2xCLGVBQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtTQUNqQztRQUVELGtCQUFrQjtRQUNsQixJQUFJLE1BQU0sR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMzQyxJQUFJLGtCQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3ZCLElBQUksT0FBTyxHQUFHLGlDQUFlLENBQUMsV0FBVyxDQUFDO1lBQzFDLElBQUksT0FBTyxFQUFFO2dCQUNULElBQUksT0FBTyxHQUFHLGtCQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUM1RCxPQUFPLEdBQUcsdUJBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLGFB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QUFjLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2QsZUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUE7WUFDekIsZUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLE9BQU8sRUFBRSxDQUFDLENBQUE7WUFDakMsZUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUE7WUFDM0IsZUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUE7U0FDOUI7UUFDRCxJQUFJO1lBQ0EsbUNBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ2xEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUdKO0FBakhELDhCQWlIQyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgSUJ1aWxkUmVzdWx0LCBJQnVpbGRUYXNrT3B0aW9uIH0gZnJvbSBcIkBjb2Nvcy9jcmVhdG9yLXR5cGVzL2VkaXRvci9wYWNrYWdlcy9idWlsZGVyL0B0eXBlcy9wdWJsaWNcIjtcbmltcG9ydCBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi4vLi4vdG9vbHMvTG9nZ2VyXCI7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gXCIuLi8uLi90b29scy9VdGlsc1wiO1xuaW1wb3J0IHsgSG90VXBkYXRlQ29uZmlnIH0gZnJvbSBcIi4vSG90VXBkYXRlQ29uZmlnXCI7XG5pbXBvcnQgeyBNYWluSnNDb2RlIH0gZnJvbSBcIi4vTWFpbkpzQ29kZVwiO1xuaW1wb3J0IHsgVmVyc2lvbkdlbmVyYXRvciB9IGZyb20gXCIuL1ZlcnNpb25HZW5lcmF0b3JcIjtcblxuLyoqIOWOn+eUn+W5s+WPsOajgOafpeaehOW7uumFjee9ruWSjOS/ruaUuW1haW4uanMgKi9cbmV4cG9ydCBjbGFzcyBIb3RVcGRhdGUge1xuXG4gICAgLyoqIOS/ruaUuW1haW4uanPohJrmnKx2ZXJzaW9uICovXG4gICAgcHVibGljIHN0YXRpYyBtb2RpZnlKc0ZpbGUob3B0aW9uczogSUJ1aWxkVGFza09wdGlvbiwgcmVzdWx0OiBJQnVpbGRSZXN1bHQpIHtcbiAgICAgICAgbGV0IGJ1aWxkUGF0aCA9IFV0aWxzLnRvVW5pU2VwYXJhdG9yKHJlc3VsdC5kZXN0KTtcbiAgICAgICAgSG90VXBkYXRlQ29uZmlnLmJ1aWxkUGF0aCA9IGJ1aWxkUGF0aDtcblxuICAgICAgICBsZXQgZGF0YURpciA9IHBhdGguam9pbihyZXN1bHQuZGVzdCwgJ2RhdGEnKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5tZDVDYWNoZSkge1xuICAgICAgICAgICAgTG9nZ2VyLmVycm9yKFwi5ZCv55So54Ot5pu05pe25bqU5b2T5YWz6ZetTUQ157yT5a2YXCIpXG4gICAgICAgIH1cblxuICAgICAgICAvL+S/ruaUuW1haW4uanMg5Lit55qE5pCc57Si6Lev5b6EXG4gICAgICAgIGxldCBtYWluanMgPSBwYXRoLmpvaW4oZGF0YURpciwgJ21haW4uanMnKTtcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMobWFpbmpzKSkge1xuICAgICAgICAgICAgbGV0IHZlcnNpb24gPSBIb3RVcGRhdGVDb25maWcubWFpblZlcnNpb247XG4gICAgICAgICAgICBpZiAodmVyc2lvbikge1xuICAgICAgICAgICAgICAgIGxldCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKG1haW5qcywgeyBlbmNvZGluZzogXCJ1dGY4XCIgfSk7XG4gICAgICAgICAgICAgICAgY29udGVudCA9IE1haW5Kc0NvZGUuaW5zZXJ0Q29kZS5yZXBsYWNlKFwiPCV2ZXJzaW9uJT5cIiwgdmVyc2lvbikgKyBcIlxcblwiICsgY29udGVudDtcbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKG1haW5qcywgY29udGVudCwgeyBlbmNvZGluZzogXCJ1dGY4XCIgfSk7XG4gICAgICAgICAgICAgICAgTG9nZ2VyLmluZm8oXCLkv67mlLnng63mm7TmkJzntKLot6/lvoTlrozmiJBcIiwgdmVyc2lvbik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIExvZ2dlci5pbmZvKFwi6Iul5L2/55So54Ot5pu06K+35YWI5L+d5a2Y54Ot5pu06YWN572uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIOi1hOa6kOaJk+WMheWQjuS9v+eUqOacgOaWsOeahOa4heWNleaWh+S7tuabv+aNouaXp+eahOa4heWNleaWh+S7tiAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVwbGFjZU1hbmlmZXN0KG9wdGlvbnM6IElCdWlsZFRhc2tPcHRpb24sIHJlc3VsdDogSUJ1aWxkUmVzdWx0KSB7XG4gICAgICAgIGxldCBvbGRNYW5pZmVzdCA9IFV0aWxzLlByb2plY3RQYXRoICsgXCIvYXNzZXRzL3Byb2plY3QubWFuaWZlc3RcIjtcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKG9sZE1hbmlmZXN0KSkge1xuICAgICAgICAgICAgTG9nZ2VyLndhcm4oXCJhc3NldHMvcHJvamVjdC5tYW5pZmVzdOaWh+S7tuS4jeWtmOWcqCzor7flr7zlhaXmlofku7blkI7ph43mlrDmiZPljIUs5aaC5LiN6ZyA6KaB54Ot5pu06K+35b+955WlXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBmaWxlVXVpZCA9IGZzLnJlYWRKU09OU3luYyhvbGRNYW5pZmVzdCArIFwiLm1ldGFcIik/LnV1aWQ7XG4gICAgICAgIGxldCBidWlsZFBhdGggPSBIb3RVcGRhdGVDb25maWcuYnVpbGRQYXRoO1xuICAgICAgICBsZXQgZGVzdCA9IFV0aWxzLlByb2plY3RQYXRoICsgXCIvdGVtcC9tYW5pZmVzdFwiO1xuICAgICAgICBmcy5lbnN1cmVEaXJTeW5jKGRlc3QpO1xuICAgICAgICBpZiAodGhpcy5nZW5NYW5pZmVzdChkZXN0LCB0cnVlKSkge1xuICAgICAgICAgICAgbGV0IG5ld01hbmlmZXN0ID0gZGVzdCArICcvcHJvamVjdC5tYW5pZmVzdCc7XG4gICAgICAgICAgICBsZXQgZGlyID0gYnVpbGRQYXRoICsgJy9kYXRhL2Fzc2V0cy9tYWluJztcbiAgICAgICAgICAgIGxldCBvbGRNYW5pZmVzdCA9IFV0aWxzLmdldEFsbEZpbGVzKGRpciwgZmlsZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2VuYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmFzZW5hbWUuc3RhcnRzV2l0aChmaWxlVXVpZCkgJiYgYmFzZW5hbWUuZW5kc1dpdGgoXCIubWFuaWZlc3RcIik7XG4gICAgICAgICAgICB9KVswXTtcbiAgICAgICAgICAgIGlmIChvbGRNYW5pZmVzdCkge1xuICAgICAgICAgICAgICAgIGZzLmNvcHlGaWxlU3luYyhuZXdNYW5pZmVzdCwgb2xkTWFuaWZlc3QpO1xuICAgICAgICAgICAgICAgIExvZ2dlci5pbmZvKGDmm7/mjaLng63mm7TotYTmupDmuIXljZXmlofku7bmiJDlip9gLCBwYXRoLmJhc2VuYW1lKG9sZE1hbmlmZXN0KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIExvZ2dlci5lcnJvcihg5pu/5o2i54Ot5pu06LWE5rqQ5riF5Y2V5paH5Lu25aSx6LSlIOacquWcqOaehOW7uueahOW3peeoi+S4reaJvuWIsOa4heWNleaWh+S7tmApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTG9nZ2VyLmVycm9yKGDmm7/mjaLng63mm7TotYTmupDmuIXljZXmlofku7blpLHotKVgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiDnlJ/miJDng63mm7TotYTmupAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdlbkhvdFVwZGF0ZVJlcygpIHtcbiAgICAgICAgbGV0IGJ1aWxkUGF0aCA9IEhvdFVwZGF0ZUNvbmZpZy5idWlsZFBhdGg7XG4gICAgICAgIGxldCB1cmwgPSBIb3RVcGRhdGVDb25maWcudXJsO1xuICAgICAgICBsZXQgdmVyc2lvbiA9IEhvdFVwZGF0ZUNvbmZpZy52ZXJzaW9uO1xuICAgICAgICBsZXQgZGVzdCA9IFV0aWxzLlByb2plY3RQYXRoICsgXCIvaG90dXBkYXRlL1wiICsgdmVyc2lvbjtcbiAgICAgICAgbGV0IGRhdGEgPSBVdGlscy50b1VuaVNlcGFyYXRvcihwYXRoLmpvaW4oYnVpbGRQYXRoLCAnZGF0YScpKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmdlbk1hbmlmZXN0KGRlc3QsIGZhbHNlKSkgey8v55Sf5oiQ5riF5Y2V5ZCOIOaLt+i0nei1hOa6kFxuICAgICAgICAgICAgICAgIGZzLmNvcHlTeW5jKGRhdGEgKyAnL3NyYycsIGRlc3QgKyBcIi9zcmNcIik7XG4gICAgICAgICAgICAgICAgZnMuY29weVN5bmMoZGF0YSArICcvYXNzZXRzJywgZGVzdCArIFwiL2Fzc2V0c1wiKTtcbiAgICAgICAgICAgICAgICBmcy5jb3B5U3luYyhkYXRhICsgJy9qc2ItYWRhcHRlcicsIGRlc3QgKyBcIi9qc2ItYWRhcHRlclwiKTtcbiAgICAgICAgICAgICAgICBmcy5jb3B5U3luYyhkZXN0ICsgJy9wcm9qZWN0Lm1hbmlmZXN0JywgVXRpbHMuUHJvamVjdFBhdGggKyBcIi9hc3NldHMvcHJvamVjdC5tYW5pZmVzdFwiKTtcbiAgICAgICAgICAgICAgICBVdGlscy5yZWZyZXNoQXNzZXQoVXRpbHMuUHJvamVjdFBhdGggKyBcIi9hc3NldHMvcHJvamVjdC5tYW5pZmVzdFwiKTtcbiAgICAgICAgICAgICAgICBMb2dnZXIuaW5mbyhg55Sf5oiQ54Ot5pu06LWE5rqQ5a6M5oiQICR7ZGVzdH1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgTG9nZ2VyLmVycm9yKGDnlJ/miJDng63mm7TotYTmupDlpLHotKVgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgTG9nZ2VyLmVycm9yKGDnlJ/miJDng63mm7TotYTmupDlpLHotKUgJHtlfWApO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKiogXG4gICAgICog55Sf5oiQ6LWE5rqQ5riF5Y2V5paH5Lu2XG4gICAgICogQHBhcmFtIG5vcm1hbEJ1aWxkIOaYr+WQpuaYr+ato+W4uOaehOW7uuW3peeoiyzogIzkuI3mmK/nlJ/miJDng63mm7TotYTmupBcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBnZW5NYW5pZmVzdChkZXN0OiBzdHJpbmcsIG5vcm1hbEJ1aWxkOiBib29sZWFuKSB7XG4gICAgICAgIGxldCBidWlsZFBhdGggPSBIb3RVcGRhdGVDb25maWcuYnVpbGRQYXRoO1xuICAgICAgICBsZXQgdXJsID0gSG90VXBkYXRlQ29uZmlnLnVybDtcbiAgICAgICAgbGV0IHZlcnNpb24gPSBIb3RVcGRhdGVDb25maWcudmVyc2lvbjtcbiAgICAgICAgaWYgKCF1cmwgfHwgIXZlcnNpb24pIHtcbiAgICAgICAgICAgIExvZ2dlci53YXJuKGDng63mm7TphY3nva7kuI3mraPnoa4s6Iul6ZyA6KaB5L2/55So54Ot5pu0LOivt+WFiOajgOafpeeDreabtOmFjee9rmApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYnVpbGRQYXRoKSB7XG4gICAgICAgICAgICBMb2dnZXIuaW5mbyhg6K+35YWI5p6E5bu65LiA5qyhTmF0aXZl5bel56iLIOWGjeeUn+aIkOeDreabtOi1hOa6kGApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkYXRhID0gVXRpbHMudG9VbmlTZXBhcmF0b3IocGF0aC5qb2luKGJ1aWxkUGF0aCwgJ2RhdGEnKSk7XG4gICAgICAgIGlmICghbm9ybWFsQnVpbGQpIHtcbiAgICAgICAgICAgIExvZ2dlci5pbmZvKGB1cmw9JHt1cmx9YClcbiAgICAgICAgICAgIExvZ2dlci5pbmZvKGB2ZXJzaW9uPSR7dmVyc2lvbn1gKVxuICAgICAgICAgICAgTG9nZ2VyLmluZm8oYGRhdGE9JHtkYXRhfWApXG4gICAgICAgICAgICBMb2dnZXIuaW5mbyhgZGVzdD0ke2Rlc3R9YClcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgVmVyc2lvbkdlbmVyYXRvci5nZW4odXJsLCB2ZXJzaW9uLCBkYXRhLCBkZXN0KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgTG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuXG59Il19