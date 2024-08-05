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
    /** 修改main.js脚本 插入添加搜索路径的代码 */
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
            let content = fs_extra_1.default.readFileSync(mainjs, { encoding: "utf8" });
            content = MainJsCode_1.MainJsCode.insertCode + "\n" + content;
            fs_extra_1.default.writeFileSync(mainjs, content, { encoding: "utf8" });
            Logger_1.Logger.info("修改热更搜索路径完成");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSG90VXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc291cmNlL2J1aWxkZXIvcG9zdGJ1aWxkL0hvdFVwZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQSx3REFBMEI7QUFDMUIsZ0RBQXdCO0FBQ3hCLCtDQUE0QztBQUM1Qyw2Q0FBMEM7QUFDMUMsdURBQW9EO0FBQ3BELDZDQUEwQztBQUMxQyx5REFBc0Q7QUFFdEQsMkJBQTJCO0FBQzNCLE1BQWEsU0FBUztJQUVsQiw4QkFBOEI7SUFDdkIsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUF5QixFQUFFLE1BQW9CO1FBQ3RFLElBQUksU0FBUyxHQUFHLGFBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xELGlDQUFlLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUV0QyxJQUFJLE9BQU8sR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFN0MsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ2xCLGVBQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtTQUNqQztRQUVELGtCQUFrQjtRQUNsQixJQUFJLE1BQU0sR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMzQyxJQUFJLGtCQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3ZCLElBQUksT0FBTyxHQUFHLGtCQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzVELE9BQU8sR0FBRyx1QkFBVSxDQUFDLFVBQVUsR0FBRyxJQUFJLEdBQUcsT0FBTyxDQUFDO1lBQ2pELGtCQUFFLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxRQUFR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TyxFQUFFLENBQUMsQ0FBQTtZQUNqQyxlQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQTtZQUMzQixlQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQTtTQUM5QjtRQUNELElBQUk7WUFDQSxtQ0FBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDbEQ7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBR0o7QUE1R0QsOEJBNEdDIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBJQnVpbGRSZXN1bHQsIElCdWlsZFRhc2tPcHRpb24gfSBmcm9tIFwiQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL2J1aWxkZXIvQHR5cGVzL3B1YmxpY1wiO1xuaW1wb3J0IGZzIGZyb20gXCJmcy1leHRyYVwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuLi8uLi90b29scy9Mb2dnZXJcIjtcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSBcIi4uLy4uL3Rvb2xzL1V0aWxzXCI7XG5pbXBvcnQgeyBIb3RVcGRhdGVDb25maWcgfSBmcm9tIFwiLi9Ib3RVcGRhdGVDb25maWdcIjtcbmltcG9ydCB7IE1haW5Kc0NvZGUgfSBmcm9tIFwiLi9NYWluSnNDb2RlXCI7XG5pbXBvcnQgeyBWZXJzaW9uR2VuZXJhdG9yIH0gZnJvbSBcIi4vVmVyc2lvbkdlbmVyYXRvclwiO1xuXG4vKiog5Y6f55Sf5bmz5Y+w5qOA5p+l5p6E5bu66YWN572u5ZKM5L+u5pS5bWFpbi5qcyAqL1xuZXhwb3J0IGNsYXNzIEhvdFVwZGF0ZSB7XG5cbiAgICAvKiog5L+u5pS5bWFpbi5qc+iEmuacrCDmj5LlhaXmt7vliqDmkJzntKLot6/lvoTnmoTku6PnoIEgKi9cbiAgICBwdWJsaWMgc3RhdGljIG1vZGlmeUpzRmlsZShvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCkge1xuICAgICAgICBsZXQgYnVpbGRQYXRoID0gVXRpbHMudG9VbmlTZXBhcmF0b3IocmVzdWx0LmRlc3QpO1xuICAgICAgICBIb3RVcGRhdGVDb25maWcuYnVpbGRQYXRoID0gYnVpbGRQYXRoO1xuXG4gICAgICAgIGxldCBkYXRhRGlyID0gcGF0aC5qb2luKHJlc3VsdC5kZXN0LCAnZGF0YScpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLm1kNUNhY2hlKSB7XG4gICAgICAgICAgICBMb2dnZXIuZXJyb3IoXCLlkK/nlKjng63mm7Tml7blupTlvZPlhbPpl61NRDXnvJPlrZhcIilcbiAgICAgICAgfVxuXG4gICAgICAgIC8v5L+u5pS5bWFpbi5qcyDkuK3nmoTmkJzntKLot6/lvoRcbiAgICAgICAgbGV0IG1haW5qcyA9IHBhdGguam9pbihkYXRhRGlyLCAnbWFpbi5qcycpO1xuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhtYWluanMpKSB7XG4gICAgICAgICAgICBsZXQgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhtYWluanMsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pO1xuICAgICAgICAgICAgY29udGVudCA9IE1haW5Kc0NvZGUuaW5zZXJ0Q29kZSArIFwiXFxuXCIgKyBjb250ZW50O1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhtYWluanMsIGNvbnRlbnQsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pO1xuICAgICAgICAgICAgTG9nZ2VyLmluZm8oXCLkv67mlLnng63mm7TmkJzntKLot6/lvoTlrozmiJBcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiog6LWE5rqQ5omT5YyF5ZCO5L2/55So5pyA5paw55qE5riF5Y2V5paH5Lu25pu/5o2i5pen55qE5riF5Y2V5paH5Lu2ICovXG4gICAgcHVibGljIHN0YXRpYyByZXBsYWNlTWFuaWZlc3Qob3B0aW9uczogSUJ1aWxkVGFza09wdGlvbiwgcmVzdWx0OiBJQnVpbGRSZXN1bHQpIHtcbiAgICAgICAgbGV0IG9sZE1hbmlmZXN0ID0gVXRpbHMuUHJvamVjdFBhdGggKyBcIi9hc3NldHMvcHJvamVjdC5tYW5pZmVzdFwiO1xuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMob2xkTWFuaWZlc3QpKSB7XG4gICAgICAgICAgICBMb2dnZXIud2FybihcImFzc2V0cy9wcm9qZWN0Lm1hbmlmZXN05paH5Lu25LiN5a2Y5ZyoLOivt+WvvOWFpeaWh+S7tuWQjumHjeaWsOaJk+WMhSzlpoLkuI3pnIDopoHng63mm7Tor7flv73nlaVcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGZpbGVVdWlkID0gZnMucmVhZEpTT05TeW5jKG9sZE1hbmlmZXN0ICsgXCIubWV0YVwiKT8udXVpZDtcbiAgICAgICAgbGV0IGJ1aWxkUGF0aCA9IEhvdFVwZGF0ZUNvbmZpZy5idWlsZFBhdGg7XG4gICAgICAgIGxldCBkZXN0ID0gVXRpbHMuUHJvamVjdFBhdGggKyBcIi90ZW1wL21hbmlmZXN0XCI7XG4gICAgICAgIGZzLmVuc3VyZURpclN5bmMoZGVzdCk7XG4gICAgICAgIGlmICh0aGlzLmdlbk1hbmlmZXN0KGRlc3QsIHRydWUpKSB7XG4gICAgICAgICAgICBsZXQgbmV3TWFuaWZlc3QgPSBkZXN0ICsgJy9wcm9qZWN0Lm1hbmlmZXN0JztcbiAgICAgICAgICAgIGxldCBkaXIgPSBidWlsZFBhdGggKyAnL2RhdGEvYXNzZXRzL21haW4nO1xuICAgICAgICAgICAgbGV0IG9sZE1hbmlmZXN0ID0gVXRpbHMuZ2V0QWxsRmlsZXMoZGlyLCBmaWxlID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBiYXNlbmFtZS5zdGFydHNXaXRoKGZpbGVVdWlkKSAmJiBiYXNlbmFtZS5lbmRzV2l0aChcIi5tYW5pZmVzdFwiKTtcbiAgICAgICAgICAgIH0pWzBdO1xuICAgICAgICAgICAgaWYgKG9sZE1hbmlmZXN0KSB7XG4gICAgICAgICAgICAgICAgZnMuY29weUZpbGVTeW5jKG5ld01hbmlmZXN0LCBvbGRNYW5pZmVzdCk7XG4gICAgICAgICAgICAgICAgTG9nZ2VyLmluZm8oYOabv+aNoueDreabtOi1hOa6kOa4heWNleaWh+S7tuaIkOWKn2AsIHBhdGguYmFzZW5hbWUob2xkTWFuaWZlc3QpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgTG9nZ2VyLmVycm9yKGDmm7/mjaLng63mm7TotYTmupDmuIXljZXmlofku7blpLHotKUg5pyq5Zyo5p6E5bu655qE5bel56iL5Lit5om+5Yiw5riF5Y2V5paH5Lu2YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBMb2dnZXIuZXJyb3IoYOabv+aNoueDreabtOi1hOa6kOa4heWNleaWh+S7tuWksei0pWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIOeUn+aIkOeDreabtOi1hOa6kCAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2VuSG90VXBkYXRlUmVzKCkge1xuICAgICAgICBsZXQgYnVpbGRQYXRoID0gSG90VXBkYXRlQ29uZmlnLmJ1aWxkUGF0aDtcbiAgICAgICAgbGV0IHVybCA9IEhvdFVwZGF0ZUNvbmZpZy51cmw7XG4gICAgICAgIGxldCB2ZXJzaW9uID0gSG90VXBkYXRlQ29uZmlnLnZlcnNpb247XG4gICAgICAgIGxldCBkZXN0ID0gVXRpbHMuUHJvamVjdFBhdGggKyBcIi9ob3R1cGRhdGUvXCIgKyB2ZXJzaW9uO1xuICAgICAgICBsZXQgZGF0YSA9IFV0aWxzLnRvVW5pU2VwYXJhdG9yKHBhdGguam9pbihidWlsZFBhdGgsICdkYXRhJykpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZ2VuTWFuaWZlc3QoZGVzdCwgZmFsc2UpKSB7Ly/nlJ/miJDmuIXljZXlkI4g5ou36LSd6LWE5rqQXG4gICAgICAgICAgICAgICAgZnMuY29weVN5bmMoZGF0YSArICcvc3JjJywgZGVzdCArIFwiL3NyY1wiKTtcbiAgICAgICAgICAgICAgICBmcy5jb3B5U3luYyhkYXRhICsgJy9hc3NldHMnLCBkZXN0ICsgXCIvYXNzZXRzXCIpO1xuICAgICAgICAgICAgICAgIGZzLmNvcHlTeW5jKGRhdGEgKyAnL2pzYi1hZGFwdGVyJywgZGVzdCArIFwiL2pzYi1hZGFwdGVyXCIpO1xuICAgICAgICAgICAgICAgIGZzLmNvcHlTeW5jKGRlc3QgKyAnL3Byb2plY3QubWFuaWZlc3QnLCBVdGlscy5Qcm9qZWN0UGF0aCArIFwiL2Fzc2V0cy9wcm9qZWN0Lm1hbmlmZXN0XCIpO1xuICAgICAgICAgICAgICAgIFV0aWxzLnJlZnJlc2hBc3NldChVdGlscy5Qcm9qZWN0UGF0aCArIFwiL2Fzc2V0cy9wcm9qZWN0Lm1hbmlmZXN0XCIpO1xuICAgICAgICAgICAgICAgIExvZ2dlci5pbmZvKGDnlJ/miJDng63mm7TotYTmupDlrozmiJAgJHtkZXN0fWApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBMb2dnZXIuZXJyb3IoYOeUn+aIkOeDreabtOi1hOa6kOWksei0pWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBMb2dnZXIuZXJyb3IoYOeUn+aIkOeDreabtOi1hOa6kOWksei0pSAke2V9YCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiDnlJ/miJDotYTmupDmuIXljZXmlofku7ZcbiAgICAgKiBAcGFyYW0gbm9ybWFsQnVpbGQg5piv5ZCm5piv5q2j5bi45p6E5bu65bel56iLLOiAjOS4jeaYr+eUn+aIkOeDreabtOi1hOa6kFxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGdlbk1hbmlmZXN0KGRlc3Q6IHN0cmluZywgbm9ybWFsQnVpbGQ6IGJvb2xlYW4pIHtcbiAgICAgICAgbGV0IGJ1aWxkUGF0aCA9IEhvdFVwZGF0ZUNvbmZpZy5idWlsZFBhdGg7XG4gICAgICAgIGxldCB1cmwgPSBIb3RVcGRhdGVDb25maWcudXJsO1xuICAgICAgICBsZXQgdmVyc2lvbiA9IEhvdFVwZGF0ZUNvbmZpZy52ZXJzaW9uO1xuICAgICAgICBpZiAoIXVybCB8fCAhdmVyc2lvbikge1xuICAgICAgICAgICAgTG9nZ2VyLndhcm4oYOeDreabtOmFjee9ruS4jeato+ehrizoi6XpnIDopoHkvb/nlKjng63mm7Qs6K+35YWI5qOA5p+l54Ot5pu06YWN572uYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFidWlsZFBhdGgpIHtcbiAgICAgICAgICAgIExvZ2dlci5pbmZvKGDor7flhYjmnoTlu7rkuIDmrKFOYXRpdmXlt6XnqIsg5YaN55Sf5oiQ54Ot5pu06LWE5rqQYCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGRhdGEgPSBVdGlscy50b1VuaVNlcGFyYXRvcihwYXRoLmpvaW4oYnVpbGRQYXRoLCAnZGF0YScpKTtcbiAgICAgICAgaWYgKCFub3JtYWxCdWlsZCkge1xuICAgICAgICAgICAgTG9nZ2VyLmluZm8oYHVybD0ke3VybH1gKVxuICAgICAgICAgICAgTG9nZ2VyLmluZm8oYHZlcnNpb249JHt2ZXJzaW9ufWApXG4gICAgICAgICAgICBMb2dnZXIuaW5mbyhgZGF0YT0ke2RhdGF9YClcbiAgICAgICAgICAgIExvZ2dlci5pbmZvKGBkZXN0PSR7ZGVzdH1gKVxuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBWZXJzaW9uR2VuZXJhdG9yLmdlbih1cmwsIHZlcnNpb24sIGRhdGEsIGRlc3QpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBMb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG5cbn0iXX0=