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
        Config_1.Config.set("hotupdate.buildPath", buildPath);
        let dataDir = path_1.default.join(result.dest, 'data');
        let srcDir = path_1.default.join(dataDir, 'src');
        if (options.md5Cache) {
            let files = Utils_1.Utils.getAllFiles(srcDir, null, true);
            files = files.concat(Utils_1.Utils.getAllFiles(dataDir, null, true));
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
        let mainjs = path_1.default.join(dataDir, 'main.js');
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
        let buildPath = Config_1.Config.get("hotupdate.buildPath", "");
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
        let buildPath = Config_1.Config.get("hotupdate.buildPath", "");
        let url = Config_1.Config.get("gameSetting.hotupdateServer", "");
        let version = Config_1.Config.get("gameSetting.version", "");
        let dest = Utils_1.Utils.ProjectPath + "/hotupdate/" + version;
        let data = Utils_1.Utils.toUniSeparator(path_1.default.join(buildPath, 'data'));
        try {
            if (this.genManifest(dest, false)) { //生成清单后 拷贝资源
                fs_extra_1.default.copySync(data + '/src', dest + "/src");
                fs_extra_1.default.copySync(data + '/assets', dest + "/assets");
                fs_extra_1.default.copySync(data + '/jsb-adapter', dest + "/jsb-adapter");
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
    /**
     * 生成资源清单文件
     * @param normalBuild 是否是正常构建工程,而不是生成热更资源
     */
    static genManifest(dest, normalBuild) {
        let buildPath = Config_1.Config.get("hotupdate.buildPath", "");
        let url = Config_1.Config.get("gameSetting.hotupdateServer", "");
        let version = Config_1.Config.get("gameSetting.version", "");
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
            VersionGenerator_1.VersionGenerator.gen(url, version, data, dest, normalBuild);
        }
        catch (e) {
            Logger_1.Logger.error(e);
            return false;
        }
        return true;
    }
}
exports.HotUpdate = HotUpdate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSG90VXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc291cmNlL2J1aWxkZXIvcG9zdGJ1aWxkL0hvdFVwZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQSx3REFBMEI7QUFDMUIsZ0RBQXdCO0FBQ3hCLCtDQUE0QztBQUM1QywrQ0FBNEM7QUFDNUMsNkNBQTBDO0FBQzFDLDZDQUEwQztBQUMxQyx5REFBc0Q7QUFFdEQsMkJBQTJCO0FBQzNCLE1BQWEsU0FBUztJQUVsQiw0QkFBNEI7SUFDckIsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUF5QixFQUFFLE1BQW9CO1FBQ3RFLElBQUksU0FBUyxHQUFHLGFBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xELGVBQU0sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFN0MsSUFBSSxPQUFPLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTdDLElBQUksTUFBTSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXZDLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRTtZQUNsQixJQUFJLEtBQUssR0FBRyxhQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbEQsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDN0QsSUFBSSxRQUFRLEdBQWEsRUFBRSxDQUFDO1lBQzVCLHNCQUFzQjtZQUN0QixJQUFJLFdBQVcsR0FBd0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNqRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FB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SSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQy9EO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUdKO0FBNUlELDhCQTRJQyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgSUJ1aWxkUmVzdWx0LCBJQnVpbGRUYXNrT3B0aW9uIH0gZnJvbSBcIkBjb2Nvcy9jcmVhdG9yLXR5cGVzL2VkaXRvci9wYWNrYWdlcy9idWlsZGVyL0B0eXBlcy9wdWJsaWNcIjtcbmltcG9ydCBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBDb25maWcgfSBmcm9tIFwiLi4vLi4vdG9vbHMvQ29uZmlnXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi4vLi4vdG9vbHMvTG9nZ2VyXCI7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gXCIuLi8uLi90b29scy9VdGlsc1wiO1xuaW1wb3J0IHsgTWFpbkpzQ29kZSB9IGZyb20gXCIuL01haW5Kc0NvZGVcIjtcbmltcG9ydCB7IFZlcnNpb25HZW5lcmF0b3IgfSBmcm9tIFwiLi9WZXJzaW9uR2VuZXJhdG9yXCI7XG5cbi8qKiDljp/nlJ/lubPlj7Dmo4Dmn6XmnoTlu7rphY3nva7lkozkv67mlLltYWluLmpzICovXG5leHBvcnQgY2xhc3MgSG90VXBkYXRlIHtcblxuICAgIC8qKiDkv67mlLltYWluLmpzIOWSjCBzcmPnm67lvZXkuK3nmoTohJrmnKwgKi9cbiAgICBwdWJsaWMgc3RhdGljIG1vZGlmeUpzRmlsZShvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCkge1xuICAgICAgICBsZXQgYnVpbGRQYXRoID0gVXRpbHMudG9VbmlTZXBhcmF0b3IocmVzdWx0LmRlc3QpO1xuICAgICAgICBDb25maWcuc2V0KFwiaG90dXBkYXRlLmJ1aWxkUGF0aFwiLCBidWlsZFBhdGgpO1xuXG4gICAgICAgIGxldCBkYXRhRGlyID0gcGF0aC5qb2luKHJlc3VsdC5kZXN0LCAnZGF0YScpO1xuXG4gICAgICAgIGxldCBzcmNEaXIgPSBwYXRoLmpvaW4oZGF0YURpciwgJ3NyYycpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLm1kNUNhY2hlKSB7XG4gICAgICAgICAgICBsZXQgZmlsZXMgPSBVdGlscy5nZXRBbGxGaWxlcyhzcmNEaXIsIG51bGwsIHRydWUpO1xuICAgICAgICAgICAgZmlsZXMgPSBmaWxlcy5jb25jYXQoVXRpbHMuZ2V0QWxsRmlsZXMoZGF0YURpciwgbnVsbCwgdHJ1ZSkpO1xuICAgICAgICAgICAgbGV0IG5ld0ZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgLy/kv67mlLlzcmPnm67lvZXkuIvmlofku7bnmoTmlofku7blkI0g5Y676ZmkbWQ1XG4gICAgICAgICAgICBsZXQgZmlsZU5hbWVNYXA6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBmaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBuZXdGaWxlID0gVXRpbHMucmVzdG9yZUZpbGVQYXRoKGZpbGUpO1xuICAgICAgICAgICAgICAgIGxldCBmaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZSk7XG4gICAgICAgICAgICAgICAgbGV0IG5ld0ZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShuZXdGaWxlKTtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZU1hcC5zZXQoZmlsZU5hbWUsIG5ld0ZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICBmcy5yZW5hbWVTeW5jKGZpbGUsIG5ld0ZpbGUpO1xuICAgICAgICAgICAgICAgIExvZ2dlci5pbmZvKFwi5Y676Zmk5paH5Lu25ZCN55qETUQ1XCIsIGZpbGUpXG4gICAgICAgICAgICAgICAgbmV3RmlsZXMucHVzaChuZXdGaWxlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvL+S/ruaUuXNyY+ebruW9leS4i+aWh+S7tiDkv67mlLnmlofku7bkuK3luKZtZDXnmoTlvJXnlKhcbiAgICAgICAgICAgIG5ld0ZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZSwgeyBlbmNvZGluZzogXCJ1dGY4XCIgfSk7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWVNYXAuZm9yRWFjaCgodiwgaykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKGssIFwiZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShyZWdleCwgdik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlLCBjb250ZW50LCB7IGVuY29kaW5nOiBcInV0ZjhcIiB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTG9nZ2VyLmVycm9yKFwi5ZCv55So54Ot5pu05pe25bqU5b2T5byA5ZCvTUQ157yT5a2YXCIpXG4gICAgICAgIH1cblxuICAgICAgICAvL+S/ruaUuW1haW4uanMg5Lit55qE5pCc57Si6Lev5b6EXG4gICAgICAgIGxldCBtYWluanMgPSBwYXRoLmpvaW4oZGF0YURpciwgJ21haW4uanMnKTtcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMobWFpbmpzKSkge1xuICAgICAgICAgICAgbGV0IHZlcnNpb24gPSBDb25maWcuZ2V0KFwiZ2FtZVNldHRpbmcubWFpblZlcnNpb25cIiwgXCJcIik7XG4gICAgICAgICAgICBpZiAodmVyc2lvbikge1xuICAgICAgICAgICAgICAgIGxldCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKG1haW5qcywgeyBlbmNvZGluZzogXCJ1dGY4XCIgfSk7XG4gICAgICAgICAgICAgICAgY29udGVudCA9IE1haW5Kc0NvZGUuY29kZS5yZXBsYWNlKFwiPCV2ZXJzaW9uJT5cIiwgdmVyc2lvbikgKyBcIlxcblwiICsgY29udGVudDtcbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKG1haW5qcywgY29udGVudCwgeyBlbmNvZGluZzogXCJ1dGY4XCIgfSk7XG4gICAgICAgICAgICAgICAgTG9nZ2VyLmluZm8oXCLkv67mlLnng63mm7TmkJzntKLot6/lvoTlrozmiJBcIiwgdmVyc2lvbik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIExvZ2dlci5pbmZvKFwi6Iul5L2/55So54Ot5pu06K+35YWI5L+d5a2Y54Ot5pu06YWN572uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIOi1hOa6kOaJk+WMheWQjuS9v+eUqOacgOaWsOeahOa4heWNleaWh+S7tuabv+aNouaXp+eahOa4heWNleaWh+S7tiAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVwbGFjZU1hbmlmZXN0KG9wdGlvbnM6IElCdWlsZFRhc2tPcHRpb24sIHJlc3VsdDogSUJ1aWxkUmVzdWx0KSB7XG4gICAgICAgIGxldCBvbGRNYW5pZmVzdCA9IFV0aWxzLlByb2plY3RQYXRoICsgXCIvYXNzZXRzL3Jlc291cmNlcy9wcm9qZWN0Lm1hbmlmZXN0XCI7XG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhvbGRNYW5pZmVzdCkpIHtcbiAgICAgICAgICAgIExvZ2dlci53YXJuKFwiYXNzZXRzL3Jlc291cmNlcy9wcm9qZWN0Lm1hbmlmZXN05paH5Lu25LiN5a2Y5ZyoLOivt+WvvOWFpeaWh+S7tuWQjumHjeaWsOaJk+WMhSzlpoLkuI3pnIDopoHng63mm7Tor7flv73nlaVcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGZpbGVVdWlkID0gZnMucmVhZEpTT05TeW5jKG9sZE1hbmlmZXN0ICsgXCIubWV0YVwiKT8udXVpZDtcbiAgICAgICAgbGV0IGJ1aWxkUGF0aCA9IENvbmZpZy5nZXQoXCJob3R1cGRhdGUuYnVpbGRQYXRoXCIsIFwiXCIpO1xuICAgICAgICBsZXQgZGVzdCA9IFV0aWxzLlByb2plY3RQYXRoICsgXCIvdGVtcC9tYW5pZmVzdFwiO1xuICAgICAgICBmcy5lbnN1cmVEaXJTeW5jKGRlc3QpO1xuICAgICAgICBpZiAodGhpcy5nZW5NYW5pZmVzdChkZXN0LCB0cnVlKSkge1xuICAgICAgICAgICAgbGV0IG5ld01hbmlmZXN0ID0gZGVzdCArICcvcHJvamVjdC5tYW5pZmVzdCc7XG4gICAgICAgICAgICBsZXQgZGlyID0gYnVpbGRQYXRoICsgJy9kYXRhL2Fzc2V0cy9yZXNvdXJjZXMnO1xuICAgICAgICAgICAgbGV0IG9sZE1hbmlmZXN0ID0gVXRpbHMuZ2V0QWxsRmlsZXMoZGlyLCBmaWxlID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBiYXNlbmFtZS5zdGFydHNXaXRoKGZpbGVVdWlkKSAmJiBiYXNlbmFtZS5lbmRzV2l0aChcIi5tYW5pZmVzdFwiKTtcbiAgICAgICAgICAgIH0pWzBdO1xuICAgICAgICAgICAgaWYgKG9sZE1hbmlmZXN0KSB7XG4gICAgICAgICAgICAgICAgZnMuY29weUZpbGVTeW5jKG5ld01hbmlmZXN0LCBvbGRNYW5pZmVzdCk7XG4gICAgICAgICAgICAgICAgTG9nZ2VyLmluZm8oYOabv+aNoueDreabtOi1hOa6kOa4heWNleaWh+S7tuaIkOWKn2AsIHBhdGguYmFzZW5hbWUob2xkTWFuaWZlc3QpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgTG9nZ2VyLmVycm9yKGDmm7/mjaLng63mm7TotYTmupDmuIXljZXmlofku7blpLHotKUg5pyq5Zyo5p6E5bu655qE5bel56iL5Lit5om+5Yiw5riF5Y2V5paH5Lu2YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBMb2dnZXIuZXJyb3IoYOabv+aNoueDreabtOi1hOa6kOa4heWNleaWh+S7tuWksei0pWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIOeUn+aIkOeDreabtOi1hOa6kCAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2VuSG90VXBkYXRlUmVzKCkge1xuICAgICAgICBsZXQgYnVpbGRQYXRoID0gQ29uZmlnLmdldChcImhvdHVwZGF0ZS5idWlsZFBhdGhcIiwgXCJcIik7XG4gICAgICAgIGxldCB1cmwgPSBDb25maWcuZ2V0KFwiZ2FtZVNldHRpbmcuaG90dXBkYXRlU2VydmVyXCIsIFwiXCIpO1xuICAgICAgICBsZXQgdmVyc2lvbiA9IENvbmZpZy5nZXQoXCJnYW1lU2V0dGluZy52ZXJzaW9uXCIsIFwiXCIpO1xuICAgICAgICBsZXQgZGVzdCA9IFV0aWxzLlByb2plY3RQYXRoICsgXCIvaG90dXBkYXRlL1wiICsgdmVyc2lvbjtcbiAgICAgICAgbGV0IGRhdGEgPSBVdGlscy50b1VuaVNlcGFyYXRvcihwYXRoLmpvaW4oYnVpbGRQYXRoLCAnZGF0YScpKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmdlbk1hbmlmZXN0KGRlc3QsIGZhbHNlKSkgey8v55Sf5oiQ5riF5Y2V5ZCOIOaLt+i0nei1hOa6kFxuICAgICAgICAgICAgICAgIGZzLmNvcHlTeW5jKGRhdGEgKyAnL3NyYycsIGRlc3QgKyBcIi9zcmNcIik7XG4gICAgICAgICAgICAgICAgZnMuY29weVN5bmMoZGF0YSArICcvYXNzZXRzJywgZGVzdCArIFwiL2Fzc2V0c1wiKTtcbiAgICAgICAgICAgICAgICBmcy5jb3B5U3luYyhkYXRhICsgJy9qc2ItYWRhcHRlcicsIGRlc3QgKyBcIi9qc2ItYWRhcHRlclwiKTtcbiAgICAgICAgICAgICAgICBmcy5jb3B5U3luYyhkZXN0ICsgJy9wcm9qZWN0Lm1hbmlmZXN0JywgVXRpbHMuUHJvamVjdFBhdGggKyBcIi9hc3NldHMvcmVzb3VyY2VzL3Byb2plY3QubWFuaWZlc3RcIik7XG4gICAgICAgICAgICAgICAgVXRpbHMucmVmcmVzaEFzc2V0KFV0aWxzLlByb2plY3RQYXRoICsgXCIvYXNzZXRzL3Jlc291cmNlcy9wcm9qZWN0Lm1hbmlmZXN0XCIpO1xuICAgICAgICAgICAgICAgIExvZ2dlci5pbmZvKGDnlJ/miJDng63mm7TotYTmupDlrozmiJAgJHtkZXN0fWApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBMb2dnZXIuZXJyb3IoYOeUn+aIkOeDreabtOi1hOa6kOWksei0pWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBMb2dnZXIuZXJyb3IoYOeUn+aIkOeDreabtOi1hOa6kOWksei0pSAke2V9YCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiDnlJ/miJDotYTmupDmuIXljZXmlofku7ZcbiAgICAgKiBAcGFyYW0gbm9ybWFsQnVpbGQg5piv5ZCm5piv5q2j5bi45p6E5bu65bel56iLLOiAjOS4jeaYr+eUn+aIkOeDreabtOi1hOa6kFxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGdlbk1hbmlmZXN0KGRlc3Q6IHN0cmluZywgbm9ybWFsQnVpbGQ6IGJvb2xlYW4pIHtcbiAgICAgICAgbGV0IGJ1aWxkUGF0aCA9IENvbmZpZy5nZXQoXCJob3R1cGRhdGUuYnVpbGRQYXRoXCIsIFwiXCIpO1xuICAgICAgICBsZXQgdXJsID0gQ29uZmlnLmdldChcImdhbWVTZXR0aW5nLmhvdHVwZGF0ZVNlcnZlclwiLCBcIlwiKTtcbiAgICAgICAgbGV0IHZlcnNpb24gPSBDb25maWcuZ2V0KFwiZ2FtZVNldHRpbmcudmVyc2lvblwiLCBcIlwiKTtcbiAgICAgICAgaWYgKCF1cmwgfHwgIXZlcnNpb24pIHtcbiAgICAgICAgICAgIExvZ2dlci53YXJuKGDng63mm7TphY3nva7kuI3mraPnoa4s6Iul6ZyA6KaB5L2/55So54Ot5pu0LOivt+WFiOajgOafpeeDreabtOmFjee9rmApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYnVpbGRQYXRoKSB7XG4gICAgICAgICAgICBMb2dnZXIuaW5mbyhg6K+35YWI5p6E5bu65LiA5qyhTmF0aXZl5bel56iLIOWGjeeUn+aIkOeDreabtOi1hOa6kGApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkYXRhID0gVXRpbHMudG9VbmlTZXBhcmF0b3IocGF0aC5qb2luKGJ1aWxkUGF0aCwgJ2RhdGEnKSk7XG4gICAgICAgIGlmICghbm9ybWFsQnVpbGQpIHtcbiAgICAgICAgICAgIExvZ2dlci5pbmZvKGB1cmw9JHt1cmx9YClcbiAgICAgICAgICAgIExvZ2dlci5pbmZvKGB2ZXJzaW9uPSR7dmVyc2lvbn1gKVxuICAgICAgICAgICAgTG9nZ2VyLmluZm8oYGRhdGE9JHtkYXRhfWApXG4gICAgICAgICAgICBMb2dnZXIuaW5mbyhgZGVzdD0ke2Rlc3R9YClcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgVmVyc2lvbkdlbmVyYXRvci5nZW4odXJsLCB2ZXJzaW9uLCBkYXRhLCBkZXN0LCBub3JtYWxCdWlsZCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIExvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cblxufSJdfQ==