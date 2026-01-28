"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameTool = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const AliOSS_1 = require("../../thirdpart/alioss/AliOSS");
const Config_1 = require("../../tools/Config");
const Utils_1 = require("../../tools/Utils");
const BuildLogger_1 = require("../BuildLogger");
class GameTool {
    /** 修改远程资源的服务器地址 */
    static async modifyRemoteResServer(options, result) {
        let server = Config_1.Config.get("gameSetting.remoteResServer", "");
        let file = Utils_1.Utils.resolveFilePath(result.dest + "/src/settings.json");
        if (Utils_1.Utils.isNative(options.platform))
            file = Utils_1.Utils.resolveFilePath(result.dest + "/data/src/settings.json");
        if (file) {
            let settings = fs_extra_1.default.readJsonSync(file, { encoding: "utf8" });
            settings.assets.server = server;
            fs_extra_1.default.writeJSONSync(file, settings);
            BuildLogger_1.BuildLogger.info("修改远程资源服务器地址为:" + server);
        }
    }
    /** 上传小游戏资源到阿里云OSS */
    static async uploadRemoteResToAliOss(options, result) {
        let localDir = path_1.default.join(result.dest, "remote");
        if (Utils_1.Utils.isNative(options.platform))
            localDir = path_1.default.join(result.dest, "data", "remote");
        if (!fs_extra_1.default.existsSync(localDir))
            return;
        let ossDir = Config_1.Config.get("gameSetting.remoteResOSSUploadDir", "");
        let files = Utils_1.Utils.getAllFiles(localDir);
        let upload = false;
        if (options['remote-auto-upload']) { //命令行构建时 自动上传
            upload = true;
        }
        else { //手动选择是否上传
            let value = await Editor.Dialog.info(`是否上传文件到OSS?`, {
                title: "上传远程资源",
                detail: ossDir,
                default: 1,
                buttons: ['取消', '确认']
            });
            upload = value.response != 0;
        }
        if (upload) {
            let alioss = new AliOSS_1.AliOSS(localDir, ossDir);
            await alioss.upload(options.taskName, files);
            fs_extra_1.default.removeSync(localDir);
        }
    }
    /** 小游戏平台删除resources目录下的project.manifest文件 */
    static minigameDeleteManifest(options, result) {
        var _a;
        let oldManifest = Utils_1.Utils.ProjectPath + "/assets/resources/project.manifest";
        if (!fs_extra_1.default.existsSync(oldManifest))
            return;
        let fileUuid = (_a = fs_extra_1.default.readJSONSync(oldManifest + ".meta")) === null || _a === void 0 ? void 0 : _a.uuid;
        let dir = options.buildPath + '/assets/resources';
        oldManifest = Utils_1.Utils.getAllFiles(dir, file => {
            let basename = path_1.default.basename(file);
            return basename.startsWith(fileUuid) && basename.endsWith(".manifest");
        })[0];
        if (oldManifest) {
            fs_extra_1.default.removeSync(oldManifest);
            BuildLogger_1.BuildLogger.info(`删除原生平台热更资源清单文件`, path_1.default.basename(oldManifest));
        }
    }
}
exports.GameTool = GameTool;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVRvb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvYnVpbGRlci9wb3N0YnVpbGQvR2FtZVRvb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsd0RBQTBCO0FBQzFCLGdEQUF3QjtBQUV4QiwwREFBdUQ7QUFDdkQsK0NBQTRDO0FBQzVDLDZDQUEwQztBQUMxQyxnREFBNkM7QUFHN0MsTUFBYSxRQUFRO0lBRWpCLG1CQUFtQjtJQUNaLE1BQU0sQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsT0FBeUIsRUFBRSxNQUFvQjtRQUNyRixJQUFJLE1BQU0sR0FBRyxlQUFNLENBQUMsR0FBRyxDQUFDLDZCQUE2QixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzNELElBQUksSUFBSSxHQUFHLGFBQUssQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3JFLElBQUksYUFBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1lBQUUsSUFBSSxHQUFHLGFBQUssQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyx5QkFBeUIsQ0FBQyxDQUFDO1FBQzVHLElBQUksSUFBSSxFQUFFO1lBQ04sSUFBSSxRQUFRLEdBQUcsa0JBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDM0QsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ2hDLGtCQUFFLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNqQyx5QkFBVyxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLENBQUM7U0FDOUM7SUFDTCxDQUFDO0lBRUQscUJBQXFCO0lBQ2QsTUFBTSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxPQUF5QixFQUFFLE1BQW9CO1FBQ3ZGLElBQUksUUFBUSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNoRCxJQUFJLGFBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztZQUFFLFFBQVEsR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzFGLElBQUksQ0FBQyxrQkFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7WUFBRSxPQUFPO1FBQ3JDLElBQUksTUFBTSxHQUFHLGVBQU0sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakUsSUFBSSxLQUFLLEdBQWEsYUFBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVsRCxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxPQUFPLENBQUMsb0JBQW9CLENBQUMsRUFBRSxFQUFDLGFBQWE7WUFDN0MsTUFBTSxHQUFHLElBQUksQ0FBQztTQUNqQjthQUFNLEVBQUMsVUFBVTtZQUNkLElBQUksS0FBSyxHQUFHLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUNoRCxLQUFLLEVBQUUsUUFBUTtnQkFDZixNQUFNLEVBQUUsTUFBTTtnQkFDZCxPQUFPLEVBQUUsQ0FBQztnQkFDVixPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO2FBQ3hCLENBQUMsQ0FBQTtZQUNGLE1BQU0sR0FBRyxLQUFLLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQztTQUNoQztRQUNELElBQUksTUFBTSxFQUFFO1lBQ1IsSUFBSSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzdDLGtCQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzNCO0lBQ0wsQ0FBQztJQUVELDZDQUE2QztJQUN0QyxNQUFNLENBQUMsc0JBQXNCLENBQUMsT0FBeUIsRUFBRSxNQUFvQjs7UUFDaEYsSUFBSSxXQUFXLEdBQUcsYUFBSyxDQUFDLFdBQVcsR0FBRyxvQ0FBb0MsQ0FBQztRQUMzRSxJQUFJLENBQUMsa0JBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQUUsT0FBTztRQUN4QyxJQUFJLFFBQVEsR0FBRyxNQUFBLGtCQUFFLENBQUMsWUFBWSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsMENBQUUsSUFBSSxDQUFDO1FBQzVELElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcsbUJBQW1CLENBQUM7UUFDbEQsV0FBVyxHQUFHLGFBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ3hDLElBQUksUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkMsT0FBTyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDM0UsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTixJQUFJLFdBQVcsRUFBRTtZQUNiLGtCQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNCLHlCQUFXLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGNBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztTQUNsRTtJQUNMLENBQUM7Q0FDSjtBQXpERCw0QkF5REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSBcImZzLWV4dHJhXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgSUJ1aWxkUmVzdWx0LCBJQnVpbGRUYXNrT3B0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL0Bjb2Nvcy9jcmVhdG9yLXR5cGVzL2VkaXRvci9wYWNrYWdlcy9idWlsZGVyL0B0eXBlc1wiO1xuaW1wb3J0IHsgQWxpT1NTIH0gZnJvbSBcIi4uLy4uL3RoaXJkcGFydC9hbGlvc3MvQWxpT1NTXCI7XG5pbXBvcnQgeyBDb25maWcgfSBmcm9tIFwiLi4vLi4vdG9vbHMvQ29uZmlnXCI7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gXCIuLi8uLi90b29scy9VdGlsc1wiO1xuaW1wb3J0IHsgQnVpbGRMb2dnZXIgfSBmcm9tIFwiLi4vQnVpbGRMb2dnZXJcIjtcblxuXG5leHBvcnQgY2xhc3MgR2FtZVRvb2wge1xuXG4gICAgLyoqIOS/ruaUuei/nOeoi+i1hOa6kOeahOacjeWKoeWZqOWcsOWdgCAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgbW9kaWZ5UmVtb3RlUmVzU2VydmVyKG9wdGlvbnM6IElCdWlsZFRhc2tPcHRpb24sIHJlc3VsdDogSUJ1aWxkUmVzdWx0KSB7XG4gICAgICAgIGxldCBzZXJ2ZXIgPSBDb25maWcuZ2V0KFwiZ2FtZVNldHRpbmcucmVtb3RlUmVzU2VydmVyXCIsIFwiXCIpO1xuICAgICAgICBsZXQgZmlsZSA9IFV0aWxzLnJlc29sdmVGaWxlUGF0aChyZXN1bHQuZGVzdCArIFwiL3NyYy9zZXR0aW5ncy5qc29uXCIpO1xuICAgICAgICBpZiAoVXRpbHMuaXNOYXRpdmUob3B0aW9ucy5wbGF0Zm9ybSkpIGZpbGUgPSBVdGlscy5yZXNvbHZlRmlsZVBhdGgocmVzdWx0LmRlc3QgKyBcIi9kYXRhL3NyYy9zZXR0aW5ncy5qc29uXCIpO1xuICAgICAgICBpZiAoZmlsZSkge1xuICAgICAgICAgICAgbGV0IHNldHRpbmdzID0gZnMucmVhZEpzb25TeW5jKGZpbGUsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pO1xuICAgICAgICAgICAgc2V0dGluZ3MuYXNzZXRzLnNlcnZlciA9IHNlcnZlcjtcbiAgICAgICAgICAgIGZzLndyaXRlSlNPTlN5bmMoZmlsZSwgc2V0dGluZ3MpO1xuICAgICAgICAgICAgQnVpbGRMb2dnZXIuaW5mbyhcIuS/ruaUuei/nOeoi+i1hOa6kOacjeWKoeWZqOWcsOWdgOS4ujpcIiArIHNlcnZlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiog5LiK5Lyg5bCP5ri45oiP6LWE5rqQ5Yiw6Zi/6YeM5LqRT1NTICovXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyB1cGxvYWRSZW1vdGVSZXNUb0FsaU9zcyhvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCkge1xuICAgICAgICBsZXQgbG9jYWxEaXIgPSBwYXRoLmpvaW4ocmVzdWx0LmRlc3QsIFwicmVtb3RlXCIpO1xuICAgICAgICBpZiAoVXRpbHMuaXNOYXRpdmUob3B0aW9ucy5wbGF0Zm9ybSkpIGxvY2FsRGlyID0gcGF0aC5qb2luKHJlc3VsdC5kZXN0LCBcImRhdGFcIiwgXCJyZW1vdGVcIik7XG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhsb2NhbERpcikpIHJldHVybjtcbiAgICAgICAgbGV0IG9zc0RpciA9IENvbmZpZy5nZXQoXCJnYW1lU2V0dGluZy5yZW1vdGVSZXNPU1NVcGxvYWREaXJcIiwgXCJcIik7XG4gICAgICAgIGxldCBmaWxlczogc3RyaW5nW10gPSBVdGlscy5nZXRBbGxGaWxlcyhsb2NhbERpcik7XG5cbiAgICAgICAgbGV0IHVwbG9hZCA9IGZhbHNlO1xuICAgICAgICBpZiAob3B0aW9uc1sncmVtb3RlLWF1dG8tdXBsb2FkJ10pIHsvL+WRveS7pOihjOaehOW7uuaXtiDoh6rliqjkuIrkvKBcbiAgICAgICAgICAgIHVwbG9hZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7Ly/miYvliqjpgInmi6nmmK/lkKbkuIrkvKBcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IGF3YWl0IEVkaXRvci5EaWFsb2cuaW5mbyhg5piv5ZCm5LiK5Lyg5paH5Lu25YiwT1NTP2AsIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogXCLkuIrkvKDov5znqIvotYTmupBcIixcbiAgICAgICAgICAgICAgICBkZXRhaWw6IG9zc0RpcixcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiAxLFxuICAgICAgICAgICAgICAgIGJ1dHRvbnM6IFsn5Y+W5raIJywgJ+ehruiupCddXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgdXBsb2FkID0gdmFsdWUucmVzcG9uc2UgIT0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXBsb2FkKSB7XG4gICAgICAgICAgICBsZXQgYWxpb3NzID0gbmV3IEFsaU9TUyhsb2NhbERpciwgb3NzRGlyKTtcbiAgICAgICAgICAgIGF3YWl0IGFsaW9zcy51cGxvYWQob3B0aW9ucy50YXNrTmFtZSwgZmlsZXMpO1xuICAgICAgICAgICAgZnMucmVtb3ZlU3luYyhsb2NhbERpcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiog5bCP5ri45oiP5bmz5Y+w5Yig6ZmkcmVzb3VyY2Vz55uu5b2V5LiL55qEcHJvamVjdC5tYW5pZmVzdOaWh+S7tiAqL1xuICAgIHB1YmxpYyBzdGF0aWMgbWluaWdhbWVEZWxldGVNYW5pZmVzdChvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCkge1xuICAgICAgICBsZXQgb2xkTWFuaWZlc3QgPSBVdGlscy5Qcm9qZWN0UGF0aCArIFwiL2Fzc2V0cy9yZXNvdXJjZXMvcHJvamVjdC5tYW5pZmVzdFwiO1xuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMob2xkTWFuaWZlc3QpKSByZXR1cm47XG4gICAgICAgIGxldCBmaWxlVXVpZCA9IGZzLnJlYWRKU09OU3luYyhvbGRNYW5pZmVzdCArIFwiLm1ldGFcIik/LnV1aWQ7XG4gICAgICAgIGxldCBkaXIgPSBvcHRpb25zLmJ1aWxkUGF0aCArICcvYXNzZXRzL3Jlc291cmNlcyc7XG4gICAgICAgIG9sZE1hbmlmZXN0ID0gVXRpbHMuZ2V0QWxsRmlsZXMoZGlyLCBmaWxlID0+IHtcbiAgICAgICAgICAgIGxldCBiYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZSk7XG4gICAgICAgICAgICByZXR1cm4gYmFzZW5hbWUuc3RhcnRzV2l0aChmaWxlVXVpZCkgJiYgYmFzZW5hbWUuZW5kc1dpdGgoXCIubWFuaWZlc3RcIik7XG4gICAgICAgIH0pWzBdO1xuICAgICAgICBpZiAob2xkTWFuaWZlc3QpIHtcbiAgICAgICAgICAgIGZzLnJlbW92ZVN5bmMob2xkTWFuaWZlc3QpO1xuICAgICAgICAgICAgQnVpbGRMb2dnZXIuaW5mbyhg5Yig6Zmk5Y6f55Sf5bmz5Y+w54Ot5pu06LWE5rqQ5riF5Y2V5paH5Lu2YCwgcGF0aC5iYXNlbmFtZShvbGRNYW5pZmVzdCkpO1xuICAgICAgICB9XG4gICAgfVxufSJdfQ==