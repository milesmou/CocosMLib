"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotUpdate = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Config_1 = require("../tools/Config");
const Logger_1 = require("../tools/Logger");
const Utils_1 = require("../tools/Utils");
const MainJsCode_1 = require("./MainJsCode");
const VersionGenerator_1 = require("./VersionGenerator");
/** 原生平台检查构建配置和修改main.js */
class HotUpdate {
    /** 是否启用热更 */
    static get hotupdateEnable() {
        return Config_1.Config.get("gameSetting.hotupdate", false);
    }
    /** 修改main.js 和 src目录中的脚本 */
    static modifyJsFile(options, result) {
        if (!this.hotupdateEnable)
            return;
        let buildPath = Utils_1.Utils.toUniSeparator(result.dest);
        Config_1.Config.set("hotupdate.src", buildPath);
        let rootDir = path_1.default.join(result.dest, 'data');
        if (!fs_extra_1.default.existsSync(rootDir)) {
            rootDir = path_1.default.join(result.dest, 'assets');
        }
        let srcDir = path_1.default.join(rootDir, 'src');
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
        if (!this.hotupdateEnable)
            return;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSG90VXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3Bvc3RidWlsZC9Ib3RVcGRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0Esd0RBQTBCO0FBQzFCLGdEQUF3QjtBQUV4Qiw0Q0FBeUM7QUFDekMsNENBQXlDO0FBQ3pDLDBDQUF1QztBQUN2Qyw2Q0FBMEM7QUFDMUMseURBQXNEO0FBRXRELDJCQUEyQjtBQUMzQixNQUFhLFNBQVM7SUFFbEIsYUFBYTtJQUNOLE1BQU0sS0FBSyxlQUFlO1FBQzdCLE9BQU8sZUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsNEJBQTRCO0lBQ3JCLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBeUIsRUFBRSxNQUFvQjtRQUN0RSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWU7WUFBRSxPQUFPO1FBQ2xDLElBQUksU0FBUyxHQUFHLGFBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xELGVBQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRXZDLElBQUksT0FBTyxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsa0JBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDekIsT0FBTyxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztTQUM5QztRQUNELElBQUksTUFBTSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXZDLElBQUksS0FBSyxHQUFHLGFBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENB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LENBQUE7WUFDekIsZUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLE9BQU8sRUFBRSxDQUFDLENBQUE7WUFDakMsZUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUE7WUFDekIsZUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUE7U0FDOUI7UUFDRCxJQUFJO1lBQ0EsbUNBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ2pEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUdKO0FBakpELDhCQWlKQyIsInNvdXJjZXNDb250ZW50IjpbIlxyXG5pbXBvcnQgZnMgZnJvbSBcImZzLWV4dHJhXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IElCdWlsZFJlc3VsdCwgSUJ1aWxkVGFza09wdGlvbiB9IGZyb20gXCJAY29jb3MvY3JlYXRvci10eXBlcy9lZGl0b3IvcGFja2FnZXMvYnVpbGRlci9AdHlwZXMvcHVibGljXCI7XHJcbmltcG9ydCB7IENvbmZpZyB9IGZyb20gXCIuLi90b29scy9Db25maWdcIjtcclxuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4uL3Rvb2xzL0xvZ2dlclwiO1xyXG5pbXBvcnQgeyBVdGlscyB9IGZyb20gXCIuLi90b29scy9VdGlsc1wiO1xyXG5pbXBvcnQgeyBNYWluSnNDb2RlIH0gZnJvbSBcIi4vTWFpbkpzQ29kZVwiO1xyXG5pbXBvcnQgeyBWZXJzaW9uR2VuZXJhdG9yIH0gZnJvbSBcIi4vVmVyc2lvbkdlbmVyYXRvclwiO1xyXG5cclxuLyoqIOWOn+eUn+W5s+WPsOajgOafpeaehOW7uumFjee9ruWSjOS/ruaUuW1haW4uanMgKi9cclxuZXhwb3J0IGNsYXNzIEhvdFVwZGF0ZSB7XHJcblxyXG4gICAgLyoqIOaYr+WQpuWQr+eUqOeDreabtCAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXQgaG90dXBkYXRlRW5hYmxlKCkge1xyXG4gICAgICAgIHJldHVybiBDb25maWcuZ2V0KFwiZ2FtZVNldHRpbmcuaG90dXBkYXRlXCIsIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKiog5L+u5pS5bWFpbi5qcyDlkowgc3Jj55uu5b2V5Lit55qE6ISa5pysICovXHJcbiAgICBwdWJsaWMgc3RhdGljIG1vZGlmeUpzRmlsZShvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCkge1xyXG4gICAgICAgIGlmICghdGhpcy5ob3R1cGRhdGVFbmFibGUpIHJldHVybjtcclxuICAgICAgICBsZXQgYnVpbGRQYXRoID0gVXRpbHMudG9VbmlTZXBhcmF0b3IocmVzdWx0LmRlc3QpO1xyXG4gICAgICAgIENvbmZpZy5zZXQoXCJob3R1cGRhdGUuc3JjXCIsIGJ1aWxkUGF0aCk7XHJcblxyXG4gICAgICAgIGxldCByb290RGlyID0gcGF0aC5qb2luKHJlc3VsdC5kZXN0LCAnZGF0YScpO1xyXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhyb290RGlyKSkge1xyXG4gICAgICAgICAgICByb290RGlyID0gcGF0aC5qb2luKHJlc3VsdC5kZXN0LCAnYXNzZXRzJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzcmNEaXIgPSBwYXRoLmpvaW4ocm9vdERpciwgJ3NyYycpO1xyXG5cclxuICAgICAgICBsZXQgZmlsZXMgPSBVdGlscy5nZXRBbGxGaWxlcyhzcmNEaXIsIG51bGwsIHRydWUpO1xyXG4gICAgICAgIGZpbGVzID0gZmlsZXMuY29uY2F0KFV0aWxzLmdldEFsbEZpbGVzKHJvb3REaXIsIG51bGwsIHRydWUpKTtcclxuICAgICAgICBsZXQgbmV3RmlsZXM6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgLy/kv67mlLlzcmPnm67lvZXkuIvmlofku7bnmoTmlofku7blkI0g5Y676ZmkbWQ1XHJcbiAgICAgICAgbGV0IGZpbGVOYW1lTWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIGZpbGVzLmZvckVhY2goZmlsZSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBuZXdGaWxlID0gVXRpbHMucmVzdG9yZUZpbGVQYXRoKGZpbGUpO1xyXG4gICAgICAgICAgICBsZXQgZmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGUpO1xyXG4gICAgICAgICAgICBsZXQgbmV3RmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKG5ld0ZpbGUpO1xyXG4gICAgICAgICAgICBmaWxlTmFtZU1hcC5zZXQoZmlsZU5hbWUsIG5ld0ZpbGVOYW1lKTtcclxuICAgICAgICAgICAgZnMucmVuYW1lU3luYyhmaWxlLCBuZXdGaWxlKTtcclxuICAgICAgICAgICAgTG9nZ2VyLmluZm8oXCLljrvpmaTmlofku7blkI3nmoRNRDVcIiwgZmlsZSlcclxuICAgICAgICAgICAgbmV3RmlsZXMucHVzaChuZXdGaWxlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy/kv67mlLlzcmPnm67lvZXkuIvmlofku7Yg5L+u5pS55paH5Lu25Lit5bimbWQ155qE5byV55SoXHJcbiAgICAgICAgbmV3RmlsZXMuZm9yRWFjaChmaWxlID0+IHtcclxuICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZSwgeyBlbmNvZGluZzogXCJ1dGY4XCIgfSk7XHJcbiAgICAgICAgICAgIGZpbGVOYW1lTWFwLmZvckVhY2goKHYsIGspID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoaywgXCJnXCIpO1xyXG4gICAgICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShyZWdleCwgdik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGUsIGNvbnRlbnQsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvL+S/ruaUuW1haW4uanMg5Lit55qE5pCc57Si6Lev5b6EXHJcbiAgICAgICAgbGV0IG1haW5qcyA9IHBhdGguam9pbihyb290RGlyLCAnbWFpbi5qcycpO1xyXG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKG1haW5qcykpIHtcclxuICAgICAgICAgICAgbGV0IHZlcnNpb24gPSBDb25maWcuZ2V0KFwiZ2FtZVNldHRpbmcubWFpblZlcnNpb25cIiwgXCJcIik7XHJcbiAgICAgICAgICAgIGlmICh2ZXJzaW9uKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhtYWluanMsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pO1xyXG4gICAgICAgICAgICAgICAgY29udGVudCA9IE1haW5Kc0NvZGUuY29kZS5yZXBsYWNlKFwiPCV2ZXJzaW9uJT5cIiwgdmVyc2lvbikgKyBcIlxcblwiICsgY29udGVudDtcclxuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMobWFpbmpzLCBjb250ZW50LCB7IGVuY29kaW5nOiBcInV0ZjhcIiB9KTtcclxuICAgICAgICAgICAgICAgIExvZ2dlci5pbmZvKFwi5L+u5pS554Ot5pu05pCc57Si6Lev5b6E5a6M5oiQXCIsIHZlcnNpb24pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgTG9nZ2VyLmluZm8oXCLoi6Xkvb/nlKjng63mm7Tor7flhYjkv53lrZjng63mm7TphY3nva5cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIOi1hOa6kOaJk+WMheWQjuS9v+eUqOacgOaWsOeahOa4heWNleaWh+S7tuabv+aNouaXp+eahOa4heWNleaWh+S7tiAqL1xyXG4gICAgcHVibGljIHN0YXRpYyByZXBsYWNlTWFuaWZlc3Qob3B0aW9uczogSUJ1aWxkVGFza09wdGlvbiwgcmVzdWx0OiBJQnVpbGRSZXN1bHQpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaG90dXBkYXRlRW5hYmxlKSByZXR1cm47XHJcbiAgICAgICAgbGV0IG9sZE1hbmlmZXN0ID0gVXRpbHMuUHJvamVjdFBhdGggKyBcIi9hc3NldHMvcmVzb3VyY2VzL3Byb2plY3QubWFuaWZlc3RcIjtcclxuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMob2xkTWFuaWZlc3QpKSB7XHJcbiAgICAgICAgICAgIExvZ2dlci53YXJuKFwiYXNzZXRzL3Jlc291cmNlcy9wcm9qZWN0Lm1hbmlmZXN05paH5Lu25LiN5a2Y5ZyoLOivt+WvvOWFpeaWh+S7tuWQjumHjeaWsOaJk+WMhSzlpoLkuI3pnIDopoHng63mm7Tor7flv73nlaVcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGZpbGVVdWlkID0gZnMucmVhZEpTT05TeW5jKG9sZE1hbmlmZXN0ICsgXCIubWV0YVwiKT8udXVpZDtcclxuICAgICAgICBsZXQgc3JjID0gQ29uZmlnLmdldChcImhvdHVwZGF0ZS5zcmNcIiwgXCJcIik7XHJcbiAgICAgICAgbGV0IGRlc3QgPSBVdGlscy5Qcm9qZWN0UGF0aCArIFwiL3RlbXAvbWFuaWZlc3RcIjtcclxuICAgICAgICBmcy5lbnN1cmVEaXJTeW5jKGRlc3QpO1xyXG4gICAgICAgIGlmICh0aGlzLmdlbk1hbmlmZXN0KGRlc3QsIGZhbHNlKSkge1xyXG4gICAgICAgICAgICBsZXQgbmV3TWFuaWZlc3QgPSBkZXN0ICsgJy9wcm9qZWN0Lm1hbmlmZXN0JztcclxuICAgICAgICAgICAgbGV0IGRpciA9IHNyYyArICcvZGF0YS9hc3NldHMvcmVzb3VyY2VzJztcclxuICAgICAgICAgICAgbGV0IG9sZE1hbmlmZXN0ID0gVXRpbHMuZ2V0QWxsRmlsZXMoZGlyLCBmaWxlID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYmFzZW5hbWUuc3RhcnRzV2l0aChmaWxlVXVpZCkgJiYgYmFzZW5hbWUuZW5kc1dpdGgoXCIubWFuaWZlc3RcIik7XHJcbiAgICAgICAgICAgIH0pWzBdO1xyXG4gICAgICAgICAgICBpZiAob2xkTWFuaWZlc3QpIHtcclxuICAgICAgICAgICAgICAgIGZzLmNvcHlGaWxlU3luYyhuZXdNYW5pZmVzdCwgb2xkTWFuaWZlc3QpO1xyXG4gICAgICAgICAgICAgICAgTG9nZ2VyLmluZm8oYOabv+aNoueDreabtOi1hOa6kOa4heWNleaWh+S7tuaIkOWKn2AsIHBhdGguYmFzZW5hbWUob2xkTWFuaWZlc3QpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIExvZ2dlci5lcnJvcihg5pu/5o2i54Ot5pu06LWE5rqQ5riF5Y2V5paH5Lu25aSx6LSlIOacquWcqOaehOW7uueahOW3peeoi+S4reaJvuWIsOa4heWNleaWh+S7tmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgTG9nZ2VyLmVycm9yKGDmm7/mjaLng63mm7TotYTmupDmuIXljZXmlofku7blpLHotKVgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIOeUn+aIkOeDreabtOi1hOa6kCAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZW5Ib3RVcGRhdGVSZXMoKSB7XHJcbiAgICAgICAgbGV0IHNyYyA9IENvbmZpZy5nZXQoXCJob3R1cGRhdGUuc3JjXCIsIFwiXCIpO1xyXG4gICAgICAgIGxldCB1cmwgPSBDb25maWcuZ2V0KFwiZ2FtZVNldHRpbmcuaG90dXBkYXRlU2VydmVyXCIsIFwiXCIpO1xyXG4gICAgICAgIGxldCB2ZXJzaW9uID0gQ29uZmlnLmdldChcImdhbWVTZXR0aW5nLnZlcnNpb25cIiwgXCJcIik7XHJcbiAgICAgICAgbGV0IGRlc3QgPSBVdGlscy5Qcm9qZWN0UGF0aCArIFwiL2hvdHVwZGF0ZS9cIiArIHZlcnNpb247XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZ2VuTWFuaWZlc3QoZGVzdCkpIHsvL+eUn+aIkOa4heWNleWQjiDmi7fotJ3otYTmupBcclxuICAgICAgICAgICAgICAgIGZzLmNvcHlTeW5jKHNyYyArICcvc3JjJywgZGVzdCArIFwiL3NyY1wiKTtcclxuICAgICAgICAgICAgICAgIGZzLmNvcHlTeW5jKHNyYyArICcvYXNzZXRzJywgZGVzdCArIFwiL2Fzc2V0c1wiKTtcclxuICAgICAgICAgICAgICAgIGZzLmNvcHlTeW5jKHNyYyArICcvanNiLWFkYXB0ZXInLCBkZXN0ICsgXCIvanNiLWFkYXB0ZXJcIik7XHJcbiAgICAgICAgICAgICAgICBmcy5jb3B5U3luYyhkZXN0ICsgJy9wcm9qZWN0Lm1hbmlmZXN0JywgVXRpbHMuUHJvamVjdFBhdGggKyBcIi9hc3NldHMvcmVzb3VyY2VzL3Byb2plY3QubWFuaWZlc3RcIik7XHJcbiAgICAgICAgICAgICAgICBVdGlscy5yZWZyZXNoQXNzZXQoVXRpbHMuUHJvamVjdFBhdGggKyBcIi9hc3NldHMvcmVzb3VyY2VzL3Byb2plY3QubWFuaWZlc3RcIik7XHJcbiAgICAgICAgICAgICAgICBMb2dnZXIuaW5mbyhg55Sf5oiQ54Ot5pu06LWE5rqQ5a6M5oiQICR7ZGVzdH1gKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIExvZ2dlci5lcnJvcihg55Sf5oiQ54Ot5pu06LWE5rqQ5aSx6LSlYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIExvZ2dlci5lcnJvcihg55Sf5oiQ54Ot5pu06LWE5rqQ5aSx6LSlICR7ZX1gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKiDnlJ/miJDotYTmupDmuIXljZXmlofku7YgKi9cclxuICAgIHByaXZhdGUgc3RhdGljIGdlbk1hbmlmZXN0KGRlc3Q6IHN0cmluZywgcHJpbnRDb25maWcgPSB0cnVlKSB7XHJcbiAgICAgICAgbGV0IHNyYyA9IENvbmZpZy5nZXQoXCJob3R1cGRhdGUuc3JjXCIsIFwiXCIpO1xyXG4gICAgICAgIGxldCB1cmwgPSBDb25maWcuZ2V0KFwiZ2FtZVNldHRpbmcuaG90dXBkYXRlU2VydmVyXCIsIFwiXCIpO1xyXG4gICAgICAgIGxldCB2ZXJzaW9uID0gQ29uZmlnLmdldChcImdhbWVTZXR0aW5nLnZlcnNpb25cIiwgXCJcIik7XHJcbiAgICAgICAgaWYgKCF1cmwgfHwgIXZlcnNpb24pIHtcclxuICAgICAgICAgICAgTG9nZ2VyLndhcm4oYOeDreabtOmFjee9ruS4jeato+ehrizoi6XpnIDopoHkvb/nlKjng63mm7Qs6K+35YWI5qOA5p+l54Ot5pu06YWN572uYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc3JjKSB7XHJcbiAgICAgICAgICAgIExvZ2dlci5pbmZvKGDor7flhYjmnoTlu7rkuIDmrKFOYXRpdmXlt6XnqIsg5YaN55Sf5oiQ54Ot5pu06LWE5rqQYCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IG5ld1NyYyA9IHBhdGguam9pbihzcmMsICdkYXRhJyk7XHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKG5ld1NyYykpIHtcclxuICAgICAgICAgICAgbmV3U3JjID0gcGF0aC5qb2luKHNyYywgJ2Fzc2V0cycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzcmMgPSBVdGlscy50b1VuaVNlcGFyYXRvcihuZXdTcmMpO1xyXG4gICAgICAgIGlmIChwcmludENvbmZpZykge1xyXG4gICAgICAgICAgICBMb2dnZXIuaW5mbyhgdXJsPSR7dXJsfWApXHJcbiAgICAgICAgICAgIExvZ2dlci5pbmZvKGB2ZXJzaW9uPSR7dmVyc2lvbn1gKVxyXG4gICAgICAgICAgICBMb2dnZXIuaW5mbyhgc3JjPSR7c3JjfWApXHJcbiAgICAgICAgICAgIExvZ2dlci5pbmZvKGBkZXN0PSR7ZGVzdH1gKVxyXG4gICAgICAgIH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBWZXJzaW9uR2VuZXJhdG9yLmdlbih1cmwsIHZlcnNpb24sIHNyYywgZGVzdCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBMb2dnZXIuZXJyb3IoZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG5cclxufSJdfQ==