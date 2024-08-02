"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotUpdate = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Config_1 = require("../../tools/Config");
const Logger_1 = require("../../tools/Logger");
const Utils_1 = require("../../tools/Utils");
const MainJsCode_1 = require("./MainJsCode");
const VersionGenerator_1 = require("./VersionGenerator");
/** 原生平台检查构建配置和修改main.js */
class HotUpdate {
    /** 修改main.js 和 src目录中的脚本 */
    static modifyJsFile(options, result) {
        let buildPath = Utils_1.Utils.toUniSeparator(result.dest);
        Config_1.Config.set("hotupdate.src", buildPath);
        let rootDir = path_1.default.join(result.dest, 'data');
        if (!fs_extra_1.default.existsSync(rootDir)) {
            rootDir = path_1.default.join(result.dest, 'assets');
        }
        let srcDir = path_1.default.join(rootDir, 'src');
        if (options.md5Cache) {
            let files = Utils_1.Utils.getAllFiles(srcDir, null, true);
            files = files.concat(Utils_1.Utils.getAllFiles(rootDir, null, true));
            let newFiles = [];
            //修改src目录下文件的文件名 去除md5
            let fileNameMap = new Map();
            files.forEach(file => {
                let newFile = Utils_1.Utils.restoreFilePath(file);
                let fileName = path_1.default.basename(file);
                let newFileName = path_1.default.basename(newFile);
                fileNameMap.set(fileName, newFileName);
                fs_extra_1.default.renameSync(file, newFile);
                Logger_1.Logger.info("去除文件名的MD5", file);
                newFiles.push(newFile);
            });
            //修改src目录下文件 修改文件中带md5的引用
            newFiles.forEach(file => {
                let content = fs_extra_1.default.readFileSync(file, { encoding: "utf8" });
                fileNameMap.forEach((v, k) => {
                    let regex = new RegExp(k, "g");
                    content = content.replace(regex, v);
                });
                fs_extra_1.default.writeFileSync(file, content, { encoding: "utf8" });
            });
        }
        else {
            Logger_1.Logger.error("启用热更时应当开启MD5缓存");
        }
        //修改main.js 中的搜索路径
        let mainjs = path_1.default.join(rootDir, 'main.js');
        if (fs_extra_1.default.existsSync(mainjs)) {
            let version = Config_1.Config.get("gameSetting.mainVersion", "");
            if (version) {
                let content = fs_extra_1.default.readFileSync(mainjs, { encoding: "utf8" });
                content = MainJsCode_1.MainJsCode.code.replace("<%version%>", version) + "\n" + content;
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
        let oldManifest = Utils_1.Utils.ProjectPath + "/assets/resources/project.manifest";
        if (!fs_extra_1.default.existsSync(oldManifest)) {
            Logger_1.Logger.warn("assets/resources/project.manifest文件不存在,请导入文件后重新打包,如不需要热更请忽略");
            return;
        }
        let fileUuid = (_a = fs_extra_1.default.readJSONSync(oldManifest + ".meta")) === null || _a === void 0 ? void 0 : _a.uuid;
        let src = Config_1.Config.get("hotupdate.src", "");
        let dest = Utils_1.Utils.ProjectPath + "/temp/manifest";
        fs_extra_1.default.ensureDirSync(dest);
        if (this.genManifest(dest, false)) {
            let newManifest = dest + '/project.manifest';
            let dir = src + '/data/assets/resources';
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
        let src = Config_1.Config.get("hotupdate.src", "");
        let url = Config_1.Config.get("gameSetting.hotupdateServer", "");
        let version = Config_1.Config.get("gameSetting.version", "");
        let dest = Utils_1.Utils.ProjectPath + "/hotupdate/" + version;
        try {
            if (this.genManifest(dest)) { //生成清单后 拷贝资源
                fs_extra_1.default.copySync(src + '/src', dest + "/src");
                fs_extra_1.default.copySync(src + '/assets', dest + "/assets");
                fs_extra_1.default.copySync(src + '/jsb-adapter', dest + "/jsb-adapter");
                fs_extra_1.default.copySync(dest + '/project.manifest', Utils_1.Utils.ProjectPath + "/assets/resources/project.manifest");
                Utils_1.Utils.refreshAsset(Utils_1.Utils.ProjectPath + "/assets/resources/project.manifest");
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
    /** 生成资源清单文件 */
    static genManifest(dest, printConfig = true) {
        let src = Config_1.Config.get("hotupdate.src", "");
        let url = Config_1.Config.get("gameSetting.hotupdateServer", "");
        let version = Config_1.Config.get("gameSetting.version", "");
        if (!url || !version) {
            Logger_1.Logger.warn(`热更配置不正确,若需要使用热更,请先检查热更配置`);
        }
        if (!src) {
            Logger_1.Logger.info(`请先构建一次Native工程 再生成热更资源`);
            return false;
        }
        let newSrc = path_1.default.join(src, 'data');
        if (!fs_extra_1.default.existsSync(newSrc)) {
            newSrc = path_1.default.join(src, 'assets');
        }
        src = Utils_1.Utils.toUniSeparator(newSrc);
        if (printConfig) {
            Logger_1.Logger.info(`url=${url}`);
            Logger_1.Logger.info(`version=${version}`);
            Logger_1.Logger.info(`src=${src}`);
            Logger_1.Logger.info(`dest=${dest}`);
        }
        try {
            VersionGenerator_1.VersionGenerator.gen(url, version, src, dest);
        }
        catch (e) {
            Logger_1.Logger.error(e);
            return false;
        }
        return true;
    }
}
exports.HotUpdate = HotUpdate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSG90VXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc291cmNlL2J1aWxkZXIvcG9zdGJ1aWxkL0hvdFVwZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQSx3REFBMEI7QUFDMUIsZ0RBQXdCO0FBQ3hCLCtDQUE0QztBQUM1QywrQ0FBNEM7QUFDNUMsNkNBQTBDO0FBQzFDLDZDQUEwQztBQUMxQyx5REFBc0Q7QUFFdEQsMkJBQTJCO0FBQzNCLE1BQWEsU0FBUztJQUVsQiw0QkFBNEI7SUFDckIsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUF5QixFQUFFLE1BQW9CO1FBQ3RFLElBQUksU0FBUyxHQUFHLGFBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xELGVBQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRXZDLElBQUksT0FBTyxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsa0JBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDekIsT0FBTyxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztTQUM5QztRQUNELElBQUksTUFBTSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXZDLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRTtZQUNsQixJQUFJLEtBQUssR0FBRyxhQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbEQsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFD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QUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQTtZQUN6QixlQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQTtTQUM5QjtRQUNELElBQUk7WUFDQSxtQ0FBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDakQ7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBR0o7QUE5SUQsOEJBOElDIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBJQnVpbGRSZXN1bHQsIElCdWlsZFRhc2tPcHRpb24gfSBmcm9tIFwiQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL2J1aWxkZXIvQHR5cGVzL3B1YmxpY1wiO1xuaW1wb3J0IGZzIGZyb20gXCJmcy1leHRyYVwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IENvbmZpZyB9IGZyb20gXCIuLi8uLi90b29scy9Db25maWdcIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuLi8uLi90b29scy9Mb2dnZXJcIjtcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSBcIi4uLy4uL3Rvb2xzL1V0aWxzXCI7XG5pbXBvcnQgeyBNYWluSnNDb2RlIH0gZnJvbSBcIi4vTWFpbkpzQ29kZVwiO1xuaW1wb3J0IHsgVmVyc2lvbkdlbmVyYXRvciB9IGZyb20gXCIuL1ZlcnNpb25HZW5lcmF0b3JcIjtcblxuLyoqIOWOn+eUn+W5s+WPsOajgOafpeaehOW7uumFjee9ruWSjOS/ruaUuW1haW4uanMgKi9cbmV4cG9ydCBjbGFzcyBIb3RVcGRhdGUge1xuXG4gICAgLyoqIOS/ruaUuW1haW4uanMg5ZKMIHNyY+ebruW9leS4reeahOiEmuacrCAqL1xuICAgIHB1YmxpYyBzdGF0aWMgbW9kaWZ5SnNGaWxlKG9wdGlvbnM6IElCdWlsZFRhc2tPcHRpb24sIHJlc3VsdDogSUJ1aWxkUmVzdWx0KSB7XG4gICAgICAgIGxldCBidWlsZFBhdGggPSBVdGlscy50b1VuaVNlcGFyYXRvcihyZXN1bHQuZGVzdCk7XG4gICAgICAgIENvbmZpZy5zZXQoXCJob3R1cGRhdGUuc3JjXCIsIGJ1aWxkUGF0aCk7XG5cbiAgICAgICAgbGV0IHJvb3REaXIgPSBwYXRoLmpvaW4ocmVzdWx0LmRlc3QsICdkYXRhJyk7XG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhyb290RGlyKSkge1xuICAgICAgICAgICAgcm9vdERpciA9IHBhdGguam9pbihyZXN1bHQuZGVzdCwgJ2Fzc2V0cycpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzcmNEaXIgPSBwYXRoLmpvaW4ocm9vdERpciwgJ3NyYycpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLm1kNUNhY2hlKSB7XG4gICAgICAgICAgICBsZXQgZmlsZXMgPSBVdGlscy5nZXRBbGxGaWxlcyhzcmNEaXIsIG51bGwsIHRydWUpO1xuICAgICAgICAgICAgZmlsZXMgPSBmaWxlcy5jb25jYXQoVXRpbHMuZ2V0QWxsRmlsZXMocm9vdERpciwgbnVsbCwgdHJ1ZSkpO1xuICAgICAgICAgICAgbGV0IG5ld0ZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgLy/kv67mlLlzcmPnm67lvZXkuIvmlofku7bnmoTmlofku7blkI0g5Y676ZmkbWQ1XG4gICAgICAgICAgICBsZXQgZmlsZU5hbWVNYXA6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBmaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBuZXdGaWxlID0gVXRpbHMucmVzdG9yZUZpbGVQYXRoKGZpbGUpO1xuICAgICAgICAgICAgICAgIGxldCBmaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZSk7XG4gICAgICAgICAgICAgICAgbGV0IG5ld0ZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShuZXdGaWxlKTtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZU1hcC5zZXQoZmlsZU5hbWUsIG5ld0ZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICBmcy5yZW5hbWVTeW5jKGZpbGUsIG5ld0ZpbGUpO1xuICAgICAgICAgICAgICAgIExvZ2dlci5pbmZvKFwi5Y676Zmk5paH5Lu25ZCN55qETUQ1XCIsIGZpbGUpXG4gICAgICAgICAgICAgICAgbmV3RmlsZXMucHVzaChuZXdGaWxlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvL+S/ruaUuXNyY+ebruW9leS4i+aWh+S7tiDkv67mlLnmlofku7bkuK3luKZtZDXnmoTlvJXnlKhcbiAgICAgICAgICAgIG5ld0ZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZSwgeyBlbmNvZGluZzogXCJ1dGY4XCIgfSk7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWVNYXAuZm9yRWFjaCgodiwgaykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKGssIFwiZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShyZWdleCwgdik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlLCBjb250ZW50LCB7IGVuY29kaW5nOiBcInV0ZjhcIiB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTG9nZ2VyLmVycm9yKFwi5ZCv55So54Ot5pu05pe25bqU5b2T5byA5ZCvTUQ157yT5a2YXCIpXG4gICAgICAgIH1cblxuICAgICAgICAvL+S/ruaUuW1haW4uanMg5Lit55qE5pCc57Si6Lev5b6EXG4gICAgICAgIGxldCBtYWluanMgPSBwYXRoLmpvaW4ocm9vdERpciwgJ21haW4uanMnKTtcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMobWFpbmpzKSkge1xuICAgICAgICAgICAgbGV0IHZlcnNpb24gPSBDb25maWcuZ2V0KFwiZ2FtZVNldHRpbmcubWFpblZlcnNpb25cIiwgXCJcIik7XG4gICAgICAgICAgICBpZiAodmVyc2lvbikge1xuICAgICAgICAgICAgICAgIGxldCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKG1haW5qcywgeyBlbmNvZGluZzogXCJ1dGY4XCIgfSk7XG4gICAgICAgICAgICAgICAgY29udGVudCA9IE1haW5Kc0NvZGUuY29kZS5yZXBsYWNlKFwiPCV2ZXJzaW9uJT5cIiwgdmVyc2lvbikgKyBcIlxcblwiICsgY29udGVudDtcbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKG1haW5qcywgY29udGVudCwgeyBlbmNvZGluZzogXCJ1dGY4XCIgfSk7XG4gICAgICAgICAgICAgICAgTG9nZ2VyLmluZm8oXCLkv67mlLnng63mm7TmkJzntKLot6/lvoTlrozmiJBcIiwgdmVyc2lvbik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIExvZ2dlci5pbmZvKFwi6Iul5L2/55So54Ot5pu06K+35YWI5L+d5a2Y54Ot5pu06YWN572uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIOi1hOa6kOaJk+WMheWQjuS9v+eUqOacgOaWsOeahOa4heWNleaWh+S7tuabv+aNouaXp+eahOa4heWNleaWh+S7tiAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVwbGFjZU1hbmlmZXN0KG9wdGlvbnM6IElCdWlsZFRhc2tPcHRpb24sIHJlc3VsdDogSUJ1aWxkUmVzdWx0KSB7XG4gICAgICAgIGxldCBvbGRNYW5pZmVzdCA9IFV0aWxzLlByb2plY3RQYXRoICsgXCIvYXNzZXRzL3Jlc291cmNlcy9wcm9qZWN0Lm1hbmlmZXN0XCI7XG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhvbGRNYW5pZmVzdCkpIHtcbiAgICAgICAgICAgIExvZ2dlci53YXJuKFwiYXNzZXRzL3Jlc291cmNlcy9wcm9qZWN0Lm1hbmlmZXN05paH5Lu25LiN5a2Y5ZyoLOivt+WvvOWFpeaWh+S7tuWQjumHjeaWsOaJk+WMhSzlpoLkuI3pnIDopoHng63mm7Tor7flv73nlaVcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGZpbGVVdWlkID0gZnMucmVhZEpTT05TeW5jKG9sZE1hbmlmZXN0ICsgXCIubWV0YVwiKT8udXVpZDtcbiAgICAgICAgbGV0IHNyYyA9IENvbmZpZy5nZXQoXCJob3R1cGRhdGUuc3JjXCIsIFwiXCIpO1xuICAgICAgICBsZXQgZGVzdCA9IFV0aWxzLlByb2plY3RQYXRoICsgXCIvdGVtcC9tYW5pZmVzdFwiO1xuICAgICAgICBmcy5lbnN1cmVEaXJTeW5jKGRlc3QpO1xuICAgICAgICBpZiAodGhpcy5nZW5NYW5pZmVzdChkZXN0LCBmYWxzZSkpIHtcbiAgICAgICAgICAgIGxldCBuZXdNYW5pZmVzdCA9IGRlc3QgKyAnL3Byb2plY3QubWFuaWZlc3QnO1xuICAgICAgICAgICAgbGV0IGRpciA9IHNyYyArICcvZGF0YS9hc3NldHMvcmVzb3VyY2VzJztcbiAgICAgICAgICAgIGxldCBvbGRNYW5pZmVzdCA9IFV0aWxzLmdldEFsbEZpbGVzKGRpciwgZmlsZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2VuYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmFzZW5hbWUuc3RhcnRzV2l0aChmaWxlVXVpZCkgJiYgYmFzZW5hbWUuZW5kc1dpdGgoXCIubWFuaWZlc3RcIik7XG4gICAgICAgICAgICB9KVswXTtcbiAgICAgICAgICAgIGlmIChvbGRNYW5pZmVzdCkge1xuICAgICAgICAgICAgICAgIGZzLmNvcHlGaWxlU3luYyhuZXdNYW5pZmVzdCwgb2xkTWFuaWZlc3QpO1xuICAgICAgICAgICAgICAgIExvZ2dlci5pbmZvKGDmm7/mjaLng63mm7TotYTmupDmuIXljZXmlofku7bmiJDlip9gLCBwYXRoLmJhc2VuYW1lKG9sZE1hbmlmZXN0KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIExvZ2dlci5lcnJvcihg5pu/5o2i54Ot5pu06LWE5rqQ5riF5Y2V5paH5Lu25aSx6LSlIOacquWcqOaehOW7uueahOW3peeoi+S4reaJvuWIsOa4heWNleaWh+S7tmApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTG9nZ2VyLmVycm9yKGDmm7/mjaLng63mm7TotYTmupDmuIXljZXmlofku7blpLHotKVgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiDnlJ/miJDng63mm7TotYTmupAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdlbkhvdFVwZGF0ZVJlcygpIHtcbiAgICAgICAgbGV0IHNyYyA9IENvbmZpZy5nZXQoXCJob3R1cGRhdGUuc3JjXCIsIFwiXCIpO1xuICAgICAgICBsZXQgdXJsID0gQ29uZmlnLmdldChcImdhbWVTZXR0aW5nLmhvdHVwZGF0ZVNlcnZlclwiLCBcIlwiKTtcbiAgICAgICAgbGV0IHZlcnNpb24gPSBDb25maWcuZ2V0KFwiZ2FtZVNldHRpbmcudmVyc2lvblwiLCBcIlwiKTtcbiAgICAgICAgbGV0IGRlc3QgPSBVdGlscy5Qcm9qZWN0UGF0aCArIFwiL2hvdHVwZGF0ZS9cIiArIHZlcnNpb247XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodGhpcy5nZW5NYW5pZmVzdChkZXN0KSkgey8v55Sf5oiQ5riF5Y2V5ZCOIOaLt+i0nei1hOa6kFxuICAgICAgICAgICAgICAgIGZzLmNvcHlTeW5jKHNyYyArICcvc3JjJywgZGVzdCArIFwiL3NyY1wiKTtcbiAgICAgICAgICAgICAgICBmcy5jb3B5U3luYyhzcmMgKyAnL2Fzc2V0cycsIGRlc3QgKyBcIi9hc3NldHNcIik7XG4gICAgICAgICAgICAgICAgZnMuY29weVN5bmMoc3JjICsgJy9qc2ItYWRhcHRlcicsIGRlc3QgKyBcIi9qc2ItYWRhcHRlclwiKTtcbiAgICAgICAgICAgICAgICBmcy5jb3B5U3luYyhkZXN0ICsgJy9wcm9qZWN0Lm1hbmlmZXN0JywgVXRpbHMuUHJvamVjdFBhdGggKyBcIi9hc3NldHMvcmVzb3VyY2VzL3Byb2plY3QubWFuaWZlc3RcIik7XG4gICAgICAgICAgICAgICAgVXRpbHMucmVmcmVzaEFzc2V0KFV0aWxzLlByb2plY3RQYXRoICsgXCIvYXNzZXRzL3Jlc291cmNlcy9wcm9qZWN0Lm1hbmlmZXN0XCIpO1xuICAgICAgICAgICAgICAgIExvZ2dlci5pbmZvKGDnlJ/miJDng63mm7TotYTmupDlrozmiJAgJHtkZXN0fWApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBMb2dnZXIuZXJyb3IoYOeUn+aIkOeDreabtOi1hOa6kOWksei0pWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBMb2dnZXIuZXJyb3IoYOeUn+aIkOeDreabtOi1hOa6kOWksei0pSAke2V9YCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKiDnlJ/miJDotYTmupDmuIXljZXmlofku7YgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBnZW5NYW5pZmVzdChkZXN0OiBzdHJpbmcsIHByaW50Q29uZmlnID0gdHJ1ZSkge1xuICAgICAgICBsZXQgc3JjID0gQ29uZmlnLmdldChcImhvdHVwZGF0ZS5zcmNcIiwgXCJcIik7XG4gICAgICAgIGxldCB1cmwgPSBDb25maWcuZ2V0KFwiZ2FtZVNldHRpbmcuaG90dXBkYXRlU2VydmVyXCIsIFwiXCIpO1xuICAgICAgICBsZXQgdmVyc2lvbiA9IENvbmZpZy5nZXQoXCJnYW1lU2V0dGluZy52ZXJzaW9uXCIsIFwiXCIpO1xuICAgICAgICBpZiAoIXVybCB8fCAhdmVyc2lvbikge1xuICAgICAgICAgICAgTG9nZ2VyLndhcm4oYOeDreabtOmFjee9ruS4jeato+ehrizoi6XpnIDopoHkvb/nlKjng63mm7Qs6K+35YWI5qOA5p+l54Ot5pu06YWN572uYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFzcmMpIHtcbiAgICAgICAgICAgIExvZ2dlci5pbmZvKGDor7flhYjmnoTlu7rkuIDmrKFOYXRpdmXlt6XnqIsg5YaN55Sf5oiQ54Ot5pu06LWE5rqQYCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG5ld1NyYyA9IHBhdGguam9pbihzcmMsICdkYXRhJyk7XG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhuZXdTcmMpKSB7XG4gICAgICAgICAgICBuZXdTcmMgPSBwYXRoLmpvaW4oc3JjLCAnYXNzZXRzJyk7XG4gICAgICAgIH1cbiAgICAgICAgc3JjID0gVXRpbHMudG9VbmlTZXBhcmF0b3IobmV3U3JjKTtcbiAgICAgICAgaWYgKHByaW50Q29uZmlnKSB7XG4gICAgICAgICAgICBMb2dnZXIuaW5mbyhgdXJsPSR7dXJsfWApXG4gICAgICAgICAgICBMb2dnZXIuaW5mbyhgdmVyc2lvbj0ke3ZlcnNpb259YClcbiAgICAgICAgICAgIExvZ2dlci5pbmZvKGBzcmM9JHtzcmN9YClcbiAgICAgICAgICAgIExvZ2dlci5pbmZvKGBkZXN0PSR7ZGVzdH1gKVxuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBWZXJzaW9uR2VuZXJhdG9yLmdlbih1cmwsIHZlcnNpb24sIHNyYywgZGVzdCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIExvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cblxufSJdfQ==