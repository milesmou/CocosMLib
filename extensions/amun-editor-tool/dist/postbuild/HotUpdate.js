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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSG90VXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3Bvc3RidWlsZC9Ib3RVcGRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUEsd0RBQTBCO0FBQzFCLGdEQUF3QjtBQUN4Qiw0Q0FBeUM7QUFDekMsNENBQXlDO0FBQ3pDLDBDQUF1QztBQUN2Qyw2Q0FBMEM7QUFDMUMseURBQXNEO0FBRXRELDJCQUEyQjtBQUMzQixNQUFhLFNBQVM7SUFFbEIsNEJBQTRCO0lBQ3JCLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBeUIsRUFBRSxNQUFvQjtRQUN0RSxJQUFJLFNBQVMsR0FBRyxhQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsRCxlQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUV2QyxJQUFJLE9BQU8sR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLGtCQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3pCLE9BQU8sR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDOUM7UUFDRCxJQUFJLE1BQU0sR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV2QyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7WUFDbEIsSUFBSSxLQUFLLEdBQUcsYUFBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xELEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzdE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QyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUE7WUFDekIsZUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUE7U0FDOUI7UUFDRCxJQUFJO1lBQ0EsbUNBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ2pEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUdKO0FBOUlELDhCQThJQyIsInNvdXJjZXNDb250ZW50IjpbIlxyXG5pbXBvcnQgeyBJQnVpbGRSZXN1bHQsIElCdWlsZFRhc2tPcHRpb24gfSBmcm9tIFwiQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL2J1aWxkZXIvQHR5cGVzL3B1YmxpY1wiO1xyXG5pbXBvcnQgZnMgZnJvbSBcImZzLWV4dHJhXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IENvbmZpZyB9IGZyb20gXCIuLi90b29scy9Db25maWdcIjtcclxuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4uL3Rvb2xzL0xvZ2dlclwiO1xyXG5pbXBvcnQgeyBVdGlscyB9IGZyb20gXCIuLi90b29scy9VdGlsc1wiO1xyXG5pbXBvcnQgeyBNYWluSnNDb2RlIH0gZnJvbSBcIi4vTWFpbkpzQ29kZVwiO1xyXG5pbXBvcnQgeyBWZXJzaW9uR2VuZXJhdG9yIH0gZnJvbSBcIi4vVmVyc2lvbkdlbmVyYXRvclwiO1xyXG5cclxuLyoqIOWOn+eUn+W5s+WPsOajgOafpeaehOW7uumFjee9ruWSjOS/ruaUuW1haW4uanMgKi9cclxuZXhwb3J0IGNsYXNzIEhvdFVwZGF0ZSB7XHJcblxyXG4gICAgLyoqIOS/ruaUuW1haW4uanMg5ZKMIHNyY+ebruW9leS4reeahOiEmuacrCAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBtb2RpZnlKc0ZpbGUob3B0aW9uczogSUJ1aWxkVGFza09wdGlvbiwgcmVzdWx0OiBJQnVpbGRSZXN1bHQpIHtcclxuICAgICAgICBsZXQgYnVpbGRQYXRoID0gVXRpbHMudG9VbmlTZXBhcmF0b3IocmVzdWx0LmRlc3QpO1xyXG4gICAgICAgIENvbmZpZy5zZXQoXCJob3R1cGRhdGUuc3JjXCIsIGJ1aWxkUGF0aCk7XHJcblxyXG4gICAgICAgIGxldCByb290RGlyID0gcGF0aC5qb2luKHJlc3VsdC5kZXN0LCAnZGF0YScpO1xyXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhyb290RGlyKSkge1xyXG4gICAgICAgICAgICByb290RGlyID0gcGF0aC5qb2luKHJlc3VsdC5kZXN0LCAnYXNzZXRzJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzcmNEaXIgPSBwYXRoLmpvaW4ocm9vdERpciwgJ3NyYycpO1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5tZDVDYWNoZSkge1xyXG4gICAgICAgICAgICBsZXQgZmlsZXMgPSBVdGlscy5nZXRBbGxGaWxlcyhzcmNEaXIsIG51bGwsIHRydWUpO1xyXG4gICAgICAgICAgICBmaWxlcyA9IGZpbGVzLmNvbmNhdChVdGlscy5nZXRBbGxGaWxlcyhyb290RGlyLCBudWxsLCB0cnVlKSk7XHJcbiAgICAgICAgICAgIGxldCBuZXdGaWxlczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICAgICAgLy/kv67mlLlzcmPnm67lvZXkuIvmlofku7bnmoTmlofku7blkI0g5Y676ZmkbWQ1XHJcbiAgICAgICAgICAgIGxldCBmaWxlTmFtZU1hcDogTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBNYXAoKTtcclxuICAgICAgICAgICAgZmlsZXMuZm9yRWFjaChmaWxlID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBuZXdGaWxlID0gVXRpbHMucmVzdG9yZUZpbGVQYXRoKGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlKTtcclxuICAgICAgICAgICAgICAgIGxldCBuZXdGaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUobmV3RmlsZSk7XHJcbiAgICAgICAgICAgICAgICBmaWxlTmFtZU1hcC5zZXQoZmlsZU5hbWUsIG5ld0ZpbGVOYW1lKTtcclxuICAgICAgICAgICAgICAgIGZzLnJlbmFtZVN5bmMoZmlsZSwgbmV3RmlsZSk7XHJcbiAgICAgICAgICAgICAgICBMb2dnZXIuaW5mbyhcIuWOu+mZpOaWh+S7tuWQjeeahE1ENVwiLCBmaWxlKVxyXG4gICAgICAgICAgICAgICAgbmV3RmlsZXMucHVzaChuZXdGaWxlKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvL+S/ruaUuXNyY+ebruW9leS4i+aWh+S7tiDkv67mlLnmlofku7bkuK3luKZtZDXnmoTlvJXnlKhcclxuICAgICAgICAgICAgbmV3RmlsZXMuZm9yRWFjaChmaWxlID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZpbGUsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pO1xyXG4gICAgICAgICAgICAgICAgZmlsZU5hbWVNYXAuZm9yRWFjaCgodiwgaykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoaywgXCJnXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UocmVnZXgsIHYpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGUsIGNvbnRlbnQsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBMb2dnZXIuZXJyb3IoXCLlkK/nlKjng63mm7Tml7blupTlvZPlvIDlkK9NRDXnvJPlrZhcIilcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8v5L+u5pS5bWFpbi5qcyDkuK3nmoTmkJzntKLot6/lvoRcclxuICAgICAgICBsZXQgbWFpbmpzID0gcGF0aC5qb2luKHJvb3REaXIsICdtYWluLmpzJyk7XHJcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMobWFpbmpzKSkge1xyXG4gICAgICAgICAgICBsZXQgdmVyc2lvbiA9IENvbmZpZy5nZXQoXCJnYW1lU2V0dGluZy5tYWluVmVyc2lvblwiLCBcIlwiKTtcclxuICAgICAgICAgICAgaWYgKHZlcnNpb24pIHtcclxuICAgICAgICAgICAgICAgIGxldCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKG1haW5qcywgeyBlbmNvZGluZzogXCJ1dGY4XCIgfSk7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gTWFpbkpzQ29kZS5jb2RlLnJlcGxhY2UoXCI8JXZlcnNpb24lPlwiLCB2ZXJzaW9uKSArIFwiXFxuXCIgKyBjb250ZW50O1xyXG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhtYWluanMsIGNvbnRlbnQsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pO1xyXG4gICAgICAgICAgICAgICAgTG9nZ2VyLmluZm8oXCLkv67mlLnng63mm7TmkJzntKLot6/lvoTlrozmiJBcIiwgdmVyc2lvbik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBMb2dnZXIuaW5mbyhcIuiLpeS9v+eUqOeDreabtOivt+WFiOS/neWtmOeDreabtOmFjee9rlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiog6LWE5rqQ5omT5YyF5ZCO5L2/55So5pyA5paw55qE5riF5Y2V5paH5Lu25pu/5o2i5pen55qE5riF5Y2V5paH5Lu2ICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlcGxhY2VNYW5pZmVzdChvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCkge1xyXG4gICAgICAgIGxldCBvbGRNYW5pZmVzdCA9IFV0aWxzLlByb2plY3RQYXRoICsgXCIvYXNzZXRzL3Jlc291cmNlcy9wcm9qZWN0Lm1hbmlmZXN0XCI7XHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKG9sZE1hbmlmZXN0KSkge1xyXG4gICAgICAgICAgICBMb2dnZXIud2FybihcImFzc2V0cy9yZXNvdXJjZXMvcHJvamVjdC5tYW5pZmVzdOaWh+S7tuS4jeWtmOWcqCzor7flr7zlhaXmlofku7blkI7ph43mlrDmiZPljIUs5aaC5LiN6ZyA6KaB54Ot5pu06K+35b+955WlXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBmaWxlVXVpZCA9IGZzLnJlYWRKU09OU3luYyhvbGRNYW5pZmVzdCArIFwiLm1ldGFcIik/LnV1aWQ7XHJcbiAgICAgICAgbGV0IHNyYyA9IENvbmZpZy5nZXQoXCJob3R1cGRhdGUuc3JjXCIsIFwiXCIpO1xyXG4gICAgICAgIGxldCBkZXN0ID0gVXRpbHMuUHJvamVjdFBhdGggKyBcIi90ZW1wL21hbmlmZXN0XCI7XHJcbiAgICAgICAgZnMuZW5zdXJlRGlyU3luYyhkZXN0KTtcclxuICAgICAgICBpZiAodGhpcy5nZW5NYW5pZmVzdChkZXN0LCBmYWxzZSkpIHtcclxuICAgICAgICAgICAgbGV0IG5ld01hbmlmZXN0ID0gZGVzdCArICcvcHJvamVjdC5tYW5pZmVzdCc7XHJcbiAgICAgICAgICAgIGxldCBkaXIgPSBzcmMgKyAnL2RhdGEvYXNzZXRzL3Jlc291cmNlcyc7XHJcbiAgICAgICAgICAgIGxldCBvbGRNYW5pZmVzdCA9IFV0aWxzLmdldEFsbEZpbGVzKGRpciwgZmlsZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJhc2VuYW1lLnN0YXJ0c1dpdGgoZmlsZVV1aWQpICYmIGJhc2VuYW1lLmVuZHNXaXRoKFwiLm1hbmlmZXN0XCIpO1xyXG4gICAgICAgICAgICB9KVswXTtcclxuICAgICAgICAgICAgaWYgKG9sZE1hbmlmZXN0KSB7XHJcbiAgICAgICAgICAgICAgICBmcy5jb3B5RmlsZVN5bmMobmV3TWFuaWZlc3QsIG9sZE1hbmlmZXN0KTtcclxuICAgICAgICAgICAgICAgIExvZ2dlci5pbmZvKGDmm7/mjaLng63mm7TotYTmupDmuIXljZXmlofku7bmiJDlip9gLCBwYXRoLmJhc2VuYW1lKG9sZE1hbmlmZXN0KSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBMb2dnZXIuZXJyb3IoYOabv+aNoueDreabtOi1hOa6kOa4heWNleaWh+S7tuWksei0pSDmnKrlnKjmnoTlu7rnmoTlt6XnqIvkuK3mib7liLDmuIXljZXmlofku7ZgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIExvZ2dlci5lcnJvcihg5pu/5o2i54Ot5pu06LWE5rqQ5riF5Y2V5paH5Lu25aSx6LSlYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiDnlJ/miJDng63mm7TotYTmupAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2VuSG90VXBkYXRlUmVzKCkge1xyXG4gICAgICAgIGxldCBzcmMgPSBDb25maWcuZ2V0KFwiaG90dXBkYXRlLnNyY1wiLCBcIlwiKTtcclxuICAgICAgICBsZXQgdXJsID0gQ29uZmlnLmdldChcImdhbWVTZXR0aW5nLmhvdHVwZGF0ZVNlcnZlclwiLCBcIlwiKTtcclxuICAgICAgICBsZXQgdmVyc2lvbiA9IENvbmZpZy5nZXQoXCJnYW1lU2V0dGluZy52ZXJzaW9uXCIsIFwiXCIpO1xyXG4gICAgICAgIGxldCBkZXN0ID0gVXRpbHMuUHJvamVjdFBhdGggKyBcIi9ob3R1cGRhdGUvXCIgKyB2ZXJzaW9uO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdlbk1hbmlmZXN0KGRlc3QpKSB7Ly/nlJ/miJDmuIXljZXlkI4g5ou36LSd6LWE5rqQXHJcbiAgICAgICAgICAgICAgICBmcy5jb3B5U3luYyhzcmMgKyAnL3NyYycsIGRlc3QgKyBcIi9zcmNcIik7XHJcbiAgICAgICAgICAgICAgICBmcy5jb3B5U3luYyhzcmMgKyAnL2Fzc2V0cycsIGRlc3QgKyBcIi9hc3NldHNcIik7XHJcbiAgICAgICAgICAgICAgICBmcy5jb3B5U3luYyhzcmMgKyAnL2pzYi1hZGFwdGVyJywgZGVzdCArIFwiL2pzYi1hZGFwdGVyXCIpO1xyXG4gICAgICAgICAgICAgICAgZnMuY29weVN5bmMoZGVzdCArICcvcHJvamVjdC5tYW5pZmVzdCcsIFV0aWxzLlByb2plY3RQYXRoICsgXCIvYXNzZXRzL3Jlc291cmNlcy9wcm9qZWN0Lm1hbmlmZXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgVXRpbHMucmVmcmVzaEFzc2V0KFV0aWxzLlByb2plY3RQYXRoICsgXCIvYXNzZXRzL3Jlc291cmNlcy9wcm9qZWN0Lm1hbmlmZXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgTG9nZ2VyLmluZm8oYOeUn+aIkOeDreabtOi1hOa6kOWujOaIkCAke2Rlc3R9YCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBMb2dnZXIuZXJyb3IoYOeUn+aIkOeDreabtOi1hOa6kOWksei0pWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBMb2dnZXIuZXJyb3IoYOeUn+aIkOeDreabtOi1hOa6kOWksei0pSAke2V9YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKiog55Sf5oiQ6LWE5rqQ5riF5Y2V5paH5Lu2ICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyBnZW5NYW5pZmVzdChkZXN0OiBzdHJpbmcsIHByaW50Q29uZmlnID0gdHJ1ZSkge1xyXG4gICAgICAgIGxldCBzcmMgPSBDb25maWcuZ2V0KFwiaG90dXBkYXRlLnNyY1wiLCBcIlwiKTtcclxuICAgICAgICBsZXQgdXJsID0gQ29uZmlnLmdldChcImdhbWVTZXR0aW5nLmhvdHVwZGF0ZVNlcnZlclwiLCBcIlwiKTtcclxuICAgICAgICBsZXQgdmVyc2lvbiA9IENvbmZpZy5nZXQoXCJnYW1lU2V0dGluZy52ZXJzaW9uXCIsIFwiXCIpO1xyXG4gICAgICAgIGlmICghdXJsIHx8ICF2ZXJzaW9uKSB7XHJcbiAgICAgICAgICAgIExvZ2dlci53YXJuKGDng63mm7TphY3nva7kuI3mraPnoa4s6Iul6ZyA6KaB5L2/55So54Ot5pu0LOivt+WFiOajgOafpeeDreabtOmFjee9rmApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNyYykge1xyXG4gICAgICAgICAgICBMb2dnZXIuaW5mbyhg6K+35YWI5p6E5bu65LiA5qyhTmF0aXZl5bel56iLIOWGjeeUn+aIkOeDreabtOi1hOa6kGApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBuZXdTcmMgPSBwYXRoLmpvaW4oc3JjLCAnZGF0YScpO1xyXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhuZXdTcmMpKSB7XHJcbiAgICAgICAgICAgIG5ld1NyYyA9IHBhdGguam9pbihzcmMsICdhc3NldHMnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3JjID0gVXRpbHMudG9VbmlTZXBhcmF0b3IobmV3U3JjKTtcclxuICAgICAgICBpZiAocHJpbnRDb25maWcpIHtcclxuICAgICAgICAgICAgTG9nZ2VyLmluZm8oYHVybD0ke3VybH1gKVxyXG4gICAgICAgICAgICBMb2dnZXIuaW5mbyhgdmVyc2lvbj0ke3ZlcnNpb259YClcclxuICAgICAgICAgICAgTG9nZ2VyLmluZm8oYHNyYz0ke3NyY31gKVxyXG4gICAgICAgICAgICBMb2dnZXIuaW5mbyhgZGVzdD0ke2Rlc3R9YClcclxuICAgICAgICB9XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgVmVyc2lvbkdlbmVyYXRvci5nZW4odXJsLCB2ZXJzaW9uLCBzcmMsIGRlc3QpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgTG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuXHJcbn0iXX0=