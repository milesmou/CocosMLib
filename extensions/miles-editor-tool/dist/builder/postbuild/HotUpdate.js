"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotUpdate = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
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
        let dataDir = path_1.default.join(result.dest, 'data');
        if (options.md5Cache) {
            BuildLogger_1.BuildLogger.error(tag, "启用热更时应当关闭MD5缓存");
        }
        //修改main.js 中的搜索路径
        let mainjs = path_1.default.join(dataDir, 'main.js');
        if (fs_extra_1.default.existsSync(mainjs)) {
            let content = fs_extra_1.default.readFileSync(mainjs, { encoding: "utf8" });
            content = MainJsCode_1.MainJsCode.insertCode.replace("%version%", HotUpdateConfig_1.HotUpdateConfig.mainVersion) + "\n" + content;
            fs_extra_1.default.writeFileSync(mainjs, content, { encoding: "utf8" });
            BuildLogger_1.BuildLogger.info(tag, "修改搜索路径完成");
        }
    }
    /** 资源打包后使用最新的清单文件替换旧的清单文件 */
    static replaceManifest(options, result) {
        var _a;
        let oldManifest = Utils_1.Utils.ProjectPath + "/assets/project.manifest";
        if (!fs_extra_1.default.existsSync(oldManifest)) {
            BuildLogger_1.BuildLogger.warn(tag, "assets/project.manifest文件不存在,请导入文件后重新打包,如不需要热更请忽略");
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
                BuildLogger_1.BuildLogger.info(tag, `替换热更资源清单文件成功`, path_1.default.basename(oldManifest));
            }
            else {
                BuildLogger_1.BuildLogger.error(tag, `替换热更资源清单文件失败 未在构建的工程中找到清单文件`);
            }
        }
        else {
            BuildLogger_1.BuildLogger.error(tag, `替换热更资源清单文件失败`);
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
    /**
     * 生成资源清单文件
     * @param normalBuild 是否是正常构建工程,而不是生成热更资源
     */
    static genManifest(dest, normalBuild) {
        let buildPath = HotUpdateConfig_1.HotUpdateConfig.buildPath;
        let url = HotUpdateConfig_1.HotUpdateConfig.url;
        let version = HotUpdateConfig_1.HotUpdateConfig.version;
        if (!url || !version) {
            BuildLogger_1.BuildLogger.warn(`热更配置不正确,若需要使用热更,请先检查热更配置`);
        }
        if (!buildPath) {
            BuildLogger_1.BuildLogger.info(`请先构建一次Native工程 再生成热更资源`);
            return false;
        }
        let data = Utils_1.Utils.toUniSeparator(path_1.default.join(buildPath, 'data'));
        if (!normalBuild) {
            BuildLogger_1.BuildLogger.info(`url=${url}`);
            BuildLogger_1.BuildLogger.info(`version=${version}`);
            BuildLogger_1.BuildLogger.info(`data=${data}`);
            BuildLogger_1.BuildLogger.info(`dest=${dest}`);
        }
        try {
            VersionGenerator_1.VersionGenerator.gen(url, version, data, dest);
        }
        catch (e) {
            BuildLogger_1.BuildLogger.error(e);
            return false;
        }
        return true;
    }
}
exports.HotUpdate = HotUpdate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSG90VXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc291cmNlL2J1aWxkZXIvcG9zdGJ1aWxkL0hvdFVwZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSx3REFBMEI7QUFDMUIsZ0RBQXdCO0FBRXhCLDZDQUEwQztBQUMxQyxnREFBNkM7QUFDN0MsdURBQW9EO0FBQ3BELDZDQUEwQztBQUMxQyx5REFBc0Q7QUFFdEQsTUFBTSxHQUFHLEdBQUcsYUFBYSxDQUFDO0FBRTFCLDJCQUEyQjtBQUMzQixNQUFhLFNBQVM7SUFFbEIsOEJBQThCO0lBQ3ZCLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBeUIsRUFBRSxNQUFvQjtRQUN0RSxJQUFJLFNBQVMsR0FBRyxhQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsRCxpQ0FBZSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFFdEMsSUFBSSxPQUFPLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTdDLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRTtZQUNsQix5QkFBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztTQUM1QztRQUVELGtCQUFrQjtRQUNsQixJQUFJLE1BQU0sR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMzQyxJQUFJLGtCQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3ZCLElBQUksT0FBTyxHQUFHLGtCQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzVELE9BQU8sR0FBRyx1QkFBVSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLGlDQUFlLENBQUMsV0FB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QUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2QseUJBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUFBO1lBQzlCLHlCQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsT0FBTyxFQUFFLENBQUMsQ0FBQTtZQUN0Qyx5QkFBVyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUE7WUFDaEMseUJBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFBO1NBQ25DO1FBQ0QsSUFBSTtZQUNBLG1DQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNsRDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IseUJBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBR0o7QUE1R0QsOEJBNEdDIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgZnMgZnJvbSBcImZzLWV4dHJhXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgSUJ1aWxkUmVzdWx0LCBJQnVpbGRUYXNrT3B0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL0Bjb2Nvcy9jcmVhdG9yLXR5cGVzL2VkaXRvci9wYWNrYWdlcy9idWlsZGVyL0B0eXBlc1wiO1xuaW1wb3J0IHsgVXRpbHMgfSBmcm9tIFwiLi4vLi4vdG9vbHMvVXRpbHNcIjtcbmltcG9ydCB7IEJ1aWxkTG9nZ2VyIH0gZnJvbSBcIi4uL0J1aWxkTG9nZ2VyXCI7XG5pbXBvcnQgeyBIb3RVcGRhdGVDb25maWcgfSBmcm9tIFwiLi9Ib3RVcGRhdGVDb25maWdcIjtcbmltcG9ydCB7IE1haW5Kc0NvZGUgfSBmcm9tIFwiLi9NYWluSnNDb2RlXCI7XG5pbXBvcnQgeyBWZXJzaW9uR2VuZXJhdG9yIH0gZnJvbSBcIi4vVmVyc2lvbkdlbmVyYXRvclwiO1xuXG5jb25zdCB0YWcgPSBcIltIb3RVcGRhdGVdXCI7XG5cbi8qKiDljp/nlJ/lubPlj7Dmo4Dmn6XmnoTlu7rphY3nva7lkozkv67mlLltYWluLmpzICovXG5leHBvcnQgY2xhc3MgSG90VXBkYXRlIHtcblxuICAgIC8qKiDkv67mlLltYWluLmpz6ISa5pysIOaPkuWFpea3u+WKoOaQnOe0oui3r+W+hOeahOS7o+eggSAqL1xuICAgIHB1YmxpYyBzdGF0aWMgbW9kaWZ5SnNGaWxlKG9wdGlvbnM6IElCdWlsZFRhc2tPcHRpb24sIHJlc3VsdDogSUJ1aWxkUmVzdWx0KSB7XG4gICAgICAgIGxldCBidWlsZFBhdGggPSBVdGlscy50b1VuaVNlcGFyYXRvcihyZXN1bHQuZGVzdCk7XG4gICAgICAgIEhvdFVwZGF0ZUNvbmZpZy5idWlsZFBhdGggPSBidWlsZFBhdGg7XG5cbiAgICAgICAgbGV0IGRhdGFEaXIgPSBwYXRoLmpvaW4ocmVzdWx0LmRlc3QsICdkYXRhJyk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubWQ1Q2FjaGUpIHtcbiAgICAgICAgICAgIEJ1aWxkTG9nZ2VyLmVycm9yKHRhZywgXCLlkK/nlKjng63mm7Tml7blupTlvZPlhbPpl61NRDXnvJPlrZhcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvL+S/ruaUuW1haW4uanMg5Lit55qE5pCc57Si6Lev5b6EXG4gICAgICAgIGxldCBtYWluanMgPSBwYXRoLmpvaW4oZGF0YURpciwgJ21haW4uanMnKTtcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMobWFpbmpzKSkge1xuICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMobWFpbmpzLCB7IGVuY29kaW5nOiBcInV0ZjhcIiB9KTtcbiAgICAgICAgICAgIGNvbnRlbnQgPSBNYWluSnNDb2RlLmluc2VydENvZGUucmVwbGFjZShcIiV2ZXJzaW9uJVwiLCBIb3RVcGRhdGVDb25maWcubWFpblZlcnNpb24pICsgXCJcXG5cIiArIGNvbnRlbnQ7XG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKG1haW5qcywgY29udGVudCwgeyBlbmNvZGluZzogXCJ1dGY4XCIgfSk7XG4gICAgICAgICAgICBCdWlsZExvZ2dlci5pbmZvKHRhZywgXCLkv67mlLnmkJzntKLot6/lvoTlrozmiJBcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiog6LWE5rqQ5omT5YyF5ZCO5L2/55So5pyA5paw55qE5riF5Y2V5paH5Lu25pu/5o2i5pen55qE5riF5Y2V5paH5Lu2ICovXG4gICAgcHVibGljIHN0YXRpYyByZXBsYWNlTWFuaWZlc3Qob3B0aW9uczogSUJ1aWxkVGFza09wdGlvbiwgcmVzdWx0OiBJQnVpbGRSZXN1bHQpIHtcbiAgICAgICAgbGV0IG9sZE1hbmlmZXN0ID0gVXRpbHMuUHJvamVjdFBhdGggKyBcIi9hc3NldHMvcHJvamVjdC5tYW5pZmVzdFwiO1xuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMob2xkTWFuaWZlc3QpKSB7XG4gICAgICAgICAgICBCdWlsZExvZ2dlci53YXJuKHRhZywgXCJhc3NldHMvcHJvamVjdC5tYW5pZmVzdOaWh+S7tuS4jeWtmOWcqCzor7flr7zlhaXmlofku7blkI7ph43mlrDmiZPljIUs5aaC5LiN6ZyA6KaB54Ot5pu06K+35b+955WlXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBmaWxlVXVpZCA9IGZzLnJlYWRKU09OU3luYyhvbGRNYW5pZmVzdCArIFwiLm1ldGFcIik/LnV1aWQ7XG4gICAgICAgIGxldCBidWlsZFBhdGggPSBIb3RVcGRhdGVDb25maWcuYnVpbGRQYXRoO1xuICAgICAgICBsZXQgZGVzdCA9IFV0aWxzLlByb2plY3RQYXRoICsgXCIvdGVtcC9tYW5pZmVzdFwiO1xuICAgICAgICBmcy5lbnN1cmVEaXJTeW5jKGRlc3QpO1xuICAgICAgICBpZiAodGhpcy5nZW5NYW5pZmVzdChkZXN0LCB0cnVlKSkge1xuICAgICAgICAgICAgbGV0IG5ld01hbmlmZXN0ID0gZGVzdCArICcvcHJvamVjdC5tYW5pZmVzdCc7XG4gICAgICAgICAgICBsZXQgZGlyID0gYnVpbGRQYXRoICsgJy9kYXRhL2Fzc2V0cy9tYWluJztcbiAgICAgICAgICAgIGxldCBvbGRNYW5pZmVzdCA9IFV0aWxzLmdldEFsbEZpbGVzKGRpciwgZmlsZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2VuYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmFzZW5hbWUuc3RhcnRzV2l0aChmaWxlVXVpZCkgJiYgYmFzZW5hbWUuZW5kc1dpdGgoXCIubWFuaWZlc3RcIik7XG4gICAgICAgICAgICB9KVswXTtcbiAgICAgICAgICAgIGlmIChvbGRNYW5pZmVzdCkge1xuICAgICAgICAgICAgICAgIGZzLmNvcHlGaWxlU3luYyhuZXdNYW5pZmVzdCwgb2xkTWFuaWZlc3QpO1xuICAgICAgICAgICAgICAgIEJ1aWxkTG9nZ2VyLmluZm8odGFnLCBg5pu/5o2i54Ot5pu06LWE5rqQ5riF5Y2V5paH5Lu25oiQ5YqfYCwgcGF0aC5iYXNlbmFtZShvbGRNYW5pZmVzdCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBCdWlsZExvZ2dlci5lcnJvcih0YWcsIGDmm7/mjaLng63mm7TotYTmupDmuIXljZXmlofku7blpLHotKUg5pyq5Zyo5p6E5bu655qE5bel56iL5Lit5om+5Yiw5riF5Y2V5paH5Lu2YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBCdWlsZExvZ2dlci5lcnJvcih0YWcsIGDmm7/mjaLng63mm7TotYTmupDmuIXljZXmlofku7blpLHotKVgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiDnlJ/miJDng63mm7TotYTmupAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdlbkhvdFVwZGF0ZVJlcygpIHtcbiAgICAgICAgbGV0IGJ1aWxkUGF0aCA9IEhvdFVwZGF0ZUNvbmZpZy5idWlsZFBhdGg7XG4gICAgICAgIGxldCB1cmwgPSBIb3RVcGRhdGVDb25maWcudXJsO1xuICAgICAgICBsZXQgdmVyc2lvbiA9IEhvdFVwZGF0ZUNvbmZpZy52ZXJzaW9uO1xuICAgICAgICBsZXQgZGVzdCA9IFV0aWxzLlByb2plY3RQYXRoICsgXCIvaG90dXBkYXRlL1wiICsgdmVyc2lvbjtcbiAgICAgICAgbGV0IGRhdGEgPSBVdGlscy50b1VuaVNlcGFyYXRvcihwYXRoLmpvaW4oYnVpbGRQYXRoLCAnZGF0YScpKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmdlbk1hbmlmZXN0KGRlc3QsIGZhbHNlKSkgey8v55Sf5oiQ5riF5Y2V5ZCOIOaLt+i0nei1hOa6kFxuICAgICAgICAgICAgICAgIGZzLmNvcHlTeW5jKGRhdGEgKyAnL3NyYycsIGRlc3QgKyBcIi9zcmNcIik7XG4gICAgICAgICAgICAgICAgZnMuY29weVN5bmMoZGF0YSArICcvYXNzZXRzJywgZGVzdCArIFwiL2Fzc2V0c1wiKTtcbiAgICAgICAgICAgICAgICBmcy5jb3B5U3luYyhkYXRhICsgJy9qc2ItYWRhcHRlcicsIGRlc3QgKyBcIi9qc2ItYWRhcHRlclwiKTtcbiAgICAgICAgICAgICAgICBmcy5jb3B5U3luYyhkZXN0ICsgJy9wcm9qZWN0Lm1hbmlmZXN0JywgVXRpbHMuUHJvamVjdFBhdGggKyBcIi9hc3NldHMvcHJvamVjdC5tYW5pZmVzdFwiKTtcbiAgICAgICAgICAgICAgICBVdGlscy5yZWZyZXNoQXNzZXQoVXRpbHMuUHJvamVjdFBhdGggKyBcIi9hc3NldHMvcHJvamVjdC5tYW5pZmVzdFwiKTtcbiAgICAgICAgICAgICAgICBCdWlsZExvZ2dlci5pbmZvKGDnlJ/miJDng63mm7TotYTmupDlrozmiJAgJHtkZXN0fWApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBCdWlsZExvZ2dlci5lcnJvcihg55Sf5oiQ54Ot5pu06LWE5rqQ5aSx6LSlYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIEJ1aWxkTG9nZ2VyLmVycm9yKGDnlJ/miJDng63mm7TotYTmupDlpLHotKUgJHtlfWApO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKiogXG4gICAgICog55Sf5oiQ6LWE5rqQ5riF5Y2V5paH5Lu2XG4gICAgICogQHBhcmFtIG5vcm1hbEJ1aWxkIOaYr+WQpuaYr+ato+W4uOaehOW7uuW3peeoiyzogIzkuI3mmK/nlJ/miJDng63mm7TotYTmupBcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBnZW5NYW5pZmVzdChkZXN0OiBzdHJpbmcsIG5vcm1hbEJ1aWxkOiBib29sZWFuKSB7XG4gICAgICAgIGxldCBidWlsZFBhdGggPSBIb3RVcGRhdGVDb25maWcuYnVpbGRQYXRoO1xuICAgICAgICBsZXQgdXJsID0gSG90VXBkYXRlQ29uZmlnLnVybDtcbiAgICAgICAgbGV0IHZlcnNpb24gPSBIb3RVcGRhdGVDb25maWcudmVyc2lvbjtcbiAgICAgICAgaWYgKCF1cmwgfHwgIXZlcnNpb24pIHtcbiAgICAgICAgICAgIEJ1aWxkTG9nZ2VyLndhcm4oYOeDreabtOmFjee9ruS4jeato+ehrizoi6XpnIDopoHkvb/nlKjng63mm7Qs6K+35YWI5qOA5p+l54Ot5pu06YWN572uYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFidWlsZFBhdGgpIHtcbiAgICAgICAgICAgIEJ1aWxkTG9nZ2VyLmluZm8oYOivt+WFiOaehOW7uuS4gOasoU5hdGl2ZeW3peeoiyDlho3nlJ/miJDng63mm7TotYTmupBgKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGF0YSA9IFV0aWxzLnRvVW5pU2VwYXJhdG9yKHBhdGguam9pbihidWlsZFBhdGgsICdkYXRhJykpO1xuICAgICAgICBpZiAoIW5vcm1hbEJ1aWxkKSB7XG4gICAgICAgICAgICBCdWlsZExvZ2dlci5pbmZvKGB1cmw9JHt1cmx9YClcbiAgICAgICAgICAgIEJ1aWxkTG9nZ2VyLmluZm8oYHZlcnNpb249JHt2ZXJzaW9ufWApXG4gICAgICAgICAgICBCdWlsZExvZ2dlci5pbmZvKGBkYXRhPSR7ZGF0YX1gKVxuICAgICAgICAgICAgQnVpbGRMb2dnZXIuaW5mbyhgZGVzdD0ke2Rlc3R9YClcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgVmVyc2lvbkdlbmVyYXRvci5nZW4odXJsLCB2ZXJzaW9uLCBkYXRhLCBkZXN0KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgQnVpbGRMb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG5cbn0iXX0=