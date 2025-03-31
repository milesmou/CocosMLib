"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Minigame = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const AliOSS_1 = require("../../thirdpart/alioss/AliOSS");
const Config_1 = require("../../tools/Config");
const Utils_1 = require("../../tools/Utils");
const BuildLogger_1 = require("../BuildLogger");
class Minigame {
    /** 修改小游戏的服务器地址 */
    static async modifyServer(options, result) {
        let server = Config_1.Config.get("gameSetting.minigameServer", "");
        let files = Utils_1.Utils.getAllFiles(result.dest + "/src", null, true);
        let file = files.find(v => path_1.default.basename(v).startsWith("settings."));
        if (file) {
            let settings = fs_extra_1.default.readJsonSync(file, { encoding: "utf8" });
            settings.assets.server = server;
            fs_extra_1.default.writeJSONSync(file, settings);
            BuildLogger_1.BuildLogger.info("修改小游戏服务器地址为:" + server);
        }
    }
    /** 上传资源到阿里云OSS */
    static async uploadToAliOss(options, result) {
        let localDir = path_1.default.join(result.dest, "remote");
        if (!fs_extra_1.default.existsSync(localDir))
            return;
        let ossDir = Config_1.Config.get("gameSetting.minigameOSSUploadDir", "");
        let files = Utils_1.Utils.getAllFiles(localDir);
        let alioss = new AliOSS_1.AliOSS(localDir, ossDir);
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
            await alioss.upload(options.taskName, files);
        }
    }
}
exports.Minigame = Minigame;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWluaWdhbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvYnVpbGRlci9wb3N0YnVpbGQvTWluaWdhbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsd0RBQTBCO0FBQzFCLGdEQUF3QjtBQUV4QiwwREFBdUQ7QUFDdkQsK0NBQTRDO0FBQzVDLDZDQUEwQztBQUMxQyxnREFBNkM7QUFHN0MsTUFBYSxRQUFRO0lBQ2pCLGtCQUFrQjtJQUNYLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQXlCLEVBQUUsTUFBb0I7UUFDNUUsSUFBSSxNQUFNLEdBQUcsZUFBTSxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRCxJQUFJLEtBQUssR0FBRyxhQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoRSxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsY0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNyRSxJQUFJLElBQUksRUFBRTtZQUNOLElBQUksUUFBUSxHQUFHLGtCQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzNELFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNoQyxrQkFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDakMseUJBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1NBQzdDO0lBQ0wsQ0FBQztJQUVELGtCQUFrQjtJQUNYLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQXlCLEVBQUUsTUFBb0I7UUFDOUUsSUFBSSxRQUFRLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxrQkFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7WUFBRSxPQUFPO1FBQ3JDLElBQUksTUFBTSxHQUFHLGVBQU0sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDaEUsSUFBSSxLQUFLLEdBQWEsYUFBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRCxJQUFJLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDMUMsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksT0FBTyxDQUFDLG9CQUFvQixDQUFDLEVBQUUsRUFBQyxhQUFhO1lBQzdDLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDakI7YUFBTSxFQUFDLFVBQVU7WUFDZCxJQUFJLEtBQUssR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDaEQsS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQzthQUN4QixDQUFDLENBQUE7WUFDRixNQUFNLEdBQUcsS0FBSyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUM7U0FDaEM7UUFDRCxJQUFJLE1BQU0sRUFBRTtZQUNSLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ2hEO0lBQ0wsQ0FBQztDQUNKO0FBckNELDRCQXFDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBJQnVpbGRSZXN1bHQsIElCdWlsZFRhc2tPcHRpb24gfSBmcm9tIFwiLi4vLi4vLi4vQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL2J1aWxkZXIvQHR5cGVzXCI7XG5pbXBvcnQgeyBBbGlPU1MgfSBmcm9tIFwiLi4vLi4vdGhpcmRwYXJ0L2FsaW9zcy9BbGlPU1NcIjtcbmltcG9ydCB7IENvbmZpZyB9IGZyb20gXCIuLi8uLi90b29scy9Db25maWdcIjtcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSBcIi4uLy4uL3Rvb2xzL1V0aWxzXCI7XG5pbXBvcnQgeyBCdWlsZExvZ2dlciB9IGZyb20gXCIuLi9CdWlsZExvZ2dlclwiO1xuXG5cbmV4cG9ydCBjbGFzcyBNaW5pZ2FtZSB7XG4gICAgLyoqIOS/ruaUueWwj+a4uOaIj+eahOacjeWKoeWZqOWcsOWdgCAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgbW9kaWZ5U2VydmVyKG9wdGlvbnM6IElCdWlsZFRhc2tPcHRpb24sIHJlc3VsdDogSUJ1aWxkUmVzdWx0KSB7XG4gICAgICAgIGxldCBzZXJ2ZXIgPSBDb25maWcuZ2V0KFwiZ2FtZVNldHRpbmcubWluaWdhbWVTZXJ2ZXJcIiwgXCJcIik7XG4gICAgICAgIGxldCBmaWxlcyA9IFV0aWxzLmdldEFsbEZpbGVzKHJlc3VsdC5kZXN0ICsgXCIvc3JjXCIsIG51bGwsIHRydWUpO1xuICAgICAgICBsZXQgZmlsZSA9IGZpbGVzLmZpbmQodiA9PiBwYXRoLmJhc2VuYW1lKHYpLnN0YXJ0c1dpdGgoXCJzZXR0aW5ncy5cIikpO1xuICAgICAgICBpZiAoZmlsZSkge1xuICAgICAgICAgICAgbGV0IHNldHRpbmdzID0gZnMucmVhZEpzb25TeW5jKGZpbGUsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pO1xuICAgICAgICAgICAgc2V0dGluZ3MuYXNzZXRzLnNlcnZlciA9IHNlcnZlcjtcbiAgICAgICAgICAgIGZzLndyaXRlSlNPTlN5bmMoZmlsZSwgc2V0dGluZ3MpO1xuICAgICAgICAgICAgQnVpbGRMb2dnZXIuaW5mbyhcIuS/ruaUueWwj+a4uOaIj+acjeWKoeWZqOWcsOWdgOS4ujpcIiArIHNlcnZlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiog5LiK5Lyg6LWE5rqQ5Yiw6Zi/6YeM5LqRT1NTICovXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyB1cGxvYWRUb0FsaU9zcyhvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCkge1xuICAgICAgICBsZXQgbG9jYWxEaXIgPSBwYXRoLmpvaW4ocmVzdWx0LmRlc3QsIFwicmVtb3RlXCIpO1xuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMobG9jYWxEaXIpKSByZXR1cm47XG4gICAgICAgIGxldCBvc3NEaXIgPSBDb25maWcuZ2V0KFwiZ2FtZVNldHRpbmcubWluaWdhbWVPU1NVcGxvYWREaXJcIiwgXCJcIik7XG4gICAgICAgIGxldCBmaWxlczogc3RyaW5nW10gPSBVdGlscy5nZXRBbGxGaWxlcyhsb2NhbERpcik7XG4gICAgICAgIGxldCBhbGlvc3MgPSBuZXcgQWxpT1NTKGxvY2FsRGlyLCBvc3NEaXIpO1xuICAgICAgICBsZXQgdXBsb2FkID0gZmFsc2U7XG4gICAgICAgIGlmIChvcHRpb25zWydyZW1vdGUtYXV0by11cGxvYWQnXSkgey8v5ZG95Luk6KGM5p6E5bu65pe2IOiHquWKqOS4iuS8oFxuICAgICAgICAgICAgdXBsb2FkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHsvL+aJi+WKqOmAieaLqeaYr+WQpuS4iuS8oFxuICAgICAgICAgICAgbGV0IHZhbHVlID0gYXdhaXQgRWRpdG9yLkRpYWxvZy5pbmZvKGDmmK/lkKbkuIrkvKDmlofku7bliLBPU1M/YCwge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBcIuS4iuS8oOi/nOeoi+i1hOa6kFwiLFxuICAgICAgICAgICAgICAgIGRldGFpbDogb3NzRGlyLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IDEsXG4gICAgICAgICAgICAgICAgYnV0dG9uczogWyflj5bmtognLCAn56Gu6K6kJ11cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB1cGxvYWQgPSB2YWx1ZS5yZXNwb25zZSAhPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cGxvYWQpIHtcbiAgICAgICAgICAgIGF3YWl0IGFsaW9zcy51cGxvYWQob3B0aW9ucy50YXNrTmFtZSwgZmlsZXMpO1xuICAgICAgICB9XG4gICAgfVxufSJdfQ==