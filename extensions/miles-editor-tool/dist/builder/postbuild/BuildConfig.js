"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildConfig = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Constant_1 = require("../../tools/Constant");
const Utils_1 = require("../../tools/Utils");
const BuildLogger_1 = require("../BuildLogger");
/** 自定义构建配置处理 */
class BuildConfig {
    static execute(options, result) {
        let buildConfigDir = `${Utils_1.Utils.ProjectPath}/${Constant_1.Constant.BuildConfigDirName}`;
        fs_extra_1.default.ensureDirSync(buildConfigDir);
        let buildConfig = `${Utils_1.Utils.ProjectPath}/${Constant_1.Constant.BuildConfigDirName}/${options.taskName}.json`;
        if (!fs_extra_1.default.existsSync(buildConfig))
            this.createBuildConfig(buildConfig);
        let config = fs_extra_1.default.readJsonSync(buildConfig, { encoding: "utf8" });
        this.copyTemplate(options, result);
        this.insert(options, result, config.insert);
        this.replace(options, result, config.replace);
    }
    static createBuildConfig(path) {
        let obj = {
            "注释": {
                "!注意!": "下面的file字段均为与构建目录的相对路径",
                "insert": "在指定文件的指定行插入需要的代码 字段解释{file:文件名 line:第几行 content:插入内容}",
                "replace": "替换指定文件中的字符串为需要的值 字段解释{file:文件名 label:文件中被替代的文本 scriptName:从GameSetting上哪个脚本获取属性值 scriptField:脚本中的字段名字}"
            },
            "insert": [],
            "replace": []
        };
        fs_extra_1.default.createFileSync(path);
        fs_extra_1.default.writeJsonSync(path, obj, { spaces: 4 });
    }
    /**  拷贝模板目录资源 */
    static copyTemplate(options, result) {
        let tag = "[Template]";
        let templatePath = `${Utils_1.Utils.ProjectPath}/${Constant_1.Constant.BuildConfigDirName}/${Constant_1.Constant.BuildTemplateDirName}/${options.taskName}`;
        fs_extra_1.default.ensureDirSync(templatePath);
        let buildPath = Utils_1.Utils.toUniSeparator(result.dest);
        let files = Utils_1.Utils.getAllFiles(templatePath);
        let buildDest = this.resolveBuildDest(buildPath, options.platform);
        for (const file of files) {
            let f = file.replace(templatePath, "").replace("/", "");
            let newFile = Utils_1.Utils.resolveFilePath(buildDest + "/" + f);
            fs_extra_1.default.ensureDirSync(path_1.default.dirname(newFile));
            fs_extra_1.default.copyFileSync(file, newFile);
            BuildLogger_1.BuildLogger.info(tag, "copy file", f);
        }
    }
    /** 在文件指定位置插入代码 */
    static insert(options, result, data) {
        let tag = "[InsertCode]";
        let buildDest = this.resolveBuildDest(Utils_1.Utils.toUniSeparator(result.dest), options.platform);
        for (const d of data) {
            let destFile = Utils_1.Utils.resolveFilePath(buildDest + "/" + d.file);
            if (!fs_extra_1.default.existsSync(destFile)) {
                BuildLogger_1.BuildLogger.warn(tag, "文件不存在", d.file);
                continue;
            }
            let codeArr = d.content.split("\n");
            let destContent = fs_extra_1.default.readFileSync(destFile, { encoding: "utf8" });
            let destArr = destContent.split("\r\n");
            if (destArr.length < 2) {
                destArr = destContent.split("\n");
            }
            destArr.splice(d.line - 1, 0, ...codeArr);
            fs_extra_1.default.writeFileSync(destFile, destArr.join("\n"));
            BuildLogger_1.BuildLogger.info(tag, d.file);
        }
    }
    /** 替换指定文件中的字符串为需要的值 */
    static replace(options, result, data) {
        let tag = "[ReplaceValue]";
        let buildDest = this.resolveBuildDest(Utils_1.Utils.toUniSeparator(result.dest), options.platform);
        let mainScene = Utils_1.Utils.findFile(Utils_1.Utils.ProjectPath + "/assets", v => v.endsWith("main.scene"));
        if (!fs_extra_1.default.existsSync(mainScene)) {
            BuildLogger_1.BuildLogger.warn(tag, "main.scene文件不存在");
            return;
        }
        let objs = fs_extra_1.default.readJsonSync(mainScene, { encoding: "utf-8" });
        for (const d of data) {
            let destFile = Utils_1.Utils.resolveFilePath(buildDest + "/" + d.file);
            if (!fs_extra_1.default.existsSync(destFile)) {
                BuildLogger_1.BuildLogger.warn(tag, "文件不存在", d.file);
                continue;
            }
            let obj = objs.find(v => v['_scriptName'] == d.scriptName);
            if (obj) {
                let value = obj[d.scriptField];
                let destContent = fs_extra_1.default.readFileSync(destFile, { encoding: "utf8" });
                destContent = destContent.replace(d.label, value);
                fs_extra_1.default.writeFileSync(destFile, destContent);
                BuildLogger_1.BuildLogger.info(tag, d.file, d.label, value);
            }
            else {
                BuildLogger_1.BuildLogger.warn(tag, "对象未找到", d.scriptName);
            }
        }
    }
    static resolveBuildDest(buildDest, platform) {
        // if (platform == "android") {
        //     return buildDest + "/frameworks/runtime-src/proj.android-studio";
        // } else if (platform == "ios") {
        //     return buildDest + "/frameworks/runtime-src/proj.ios_mac";
        // } else if (platform == "win32") {
        //     return buildDest + "/frameworks/runtime-src/proj.win32";
        // }
        return buildDest;
    }
}
exports.BuildConfig = BuildConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGRDb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvYnVpbGRlci9wb3N0YnVpbGQvQnVpbGRDb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsd0RBQTBCO0FBQzFCLGdEQUF3QjtBQUV4QixtREFBZ0Q7QUFDaEQsNkNBQTBDO0FBQzFDLGdEQUE2QztBQXFCN0MsZ0JBQWdCO0FBQ2hCLE1BQWEsV0FBVztJQUViLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBeUIsRUFBRSxNQUFvQjtRQUNqRSxJQUFJLGNBQWMsR0FBRyxHQUFHLGFBQUssQ0FBQyxXQUFXLElBQUksbUJBQVEsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzNFLGtCQUFFLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2pDLElBQUksV0FBVyxHQUFHLEdBQUcsYUFBSyxDQUFDLFdBQVcsSUFBSSxtQkFBUSxDQUFDLGtCQUFrQixJQUFJLE9BQU8sQ0FBQyxRQUFRLE9BQU8sQ0FBQztRQUNqRyxJQUFJLENBQUMsa0JBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JFLElBQUksTUFBTSxHQUFHLGtCQUFFLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBVyxDQUFDO1FBQzFFLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU8sTUFBTSxDQUFDLGlCQUFpQixDQUFDLElB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QyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsUUFBUTtRQUMvQywrQkFBK0I7UUFDL0Isd0VBQXdFO1FBQ3hFLGtDQUFrQztRQUNsQyxpRUFBaUU7UUFDakUsb0NBQW9DO1FBQ3BDLCtEQUErRDtRQUMvRCxJQUFJO1FBQ0osT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztDQUNKO0FBOUdELGtDQThHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBJQnVpbGRSZXN1bHQsIElCdWlsZFRhc2tPcHRpb24gfSBmcm9tIFwiLi4vLi4vLi4vQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL2J1aWxkZXIvQHR5cGVzXCI7XG5pbXBvcnQgeyBDb25zdGFudCB9IGZyb20gXCIuLi8uLi90b29scy9Db25zdGFudFwiO1xuaW1wb3J0IHsgVXRpbHMgfSBmcm9tIFwiLi4vLi4vdG9vbHMvVXRpbHNcIjtcbmltcG9ydCB7IEJ1aWxkTG9nZ2VyIH0gZnJvbSBcIi4uL0J1aWxkTG9nZ2VyXCI7XG5cblxuaW50ZXJmYWNlIEluc2VydENvZGUge1xuICAgIGZpbGU6IHN0cmluZztcbiAgICBsaW5lOiBudW1iZXI7XG4gICAgY29udGVudDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgUmVwbGFjZVZhbHVlIHtcbiAgICBmaWxlOiBzdHJpbmc7XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICBzY3JpcHROYW1lOiBzdHJpbmc7XG4gICAgc2NyaXB0RmllbGQ6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIENvbmZpZyB7XG4gICAgaW5zZXJ0OiBJbnNlcnRDb2RlW107XG4gICAgcmVwbGFjZTogUmVwbGFjZVZhbHVlW107XG59XG5cbi8qKiDoh6rlrprkuYnmnoTlu7rphY3nva7lpITnkIYgKi9cbmV4cG9ydCBjbGFzcyBCdWlsZENvbmZpZyB7XG5cbiAgICBwdWJsaWMgc3RhdGljIGV4ZWN1dGUob3B0aW9uczogSUJ1aWxkVGFza09wdGlvbiwgcmVzdWx0OiBJQnVpbGRSZXN1bHQpIHtcbiAgICAgICAgbGV0IGJ1aWxkQ29uZmlnRGlyID0gYCR7VXRpbHMuUHJvamVjdFBhdGh9LyR7Q29uc3RhbnQuQnVpbGRDb25maWdEaXJOYW1lfWA7XG4gICAgICAgIGZzLmVuc3VyZURpclN5bmMoYnVpbGRDb25maWdEaXIpO1xuICAgICAgICBsZXQgYnVpbGRDb25maWcgPSBgJHtVdGlscy5Qcm9qZWN0UGF0aH0vJHtDb25zdGFudC5CdWlsZENvbmZpZ0Rpck5hbWV9LyR7b3B0aW9ucy50YXNrTmFtZX0uanNvbmA7XG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhidWlsZENvbmZpZykpIHRoaXMuY3JlYXRlQnVpbGRDb25maWcoYnVpbGRDb25maWcpO1xuICAgICAgICBsZXQgY29uZmlnID0gZnMucmVhZEpzb25TeW5jKGJ1aWxkQ29uZmlnLCB7IGVuY29kaW5nOiBcInV0ZjhcIiB9KSBhcyBDb25maWc7XG4gICAgICAgIHRoaXMuY29weVRlbXBsYXRlKG9wdGlvbnMsIHJlc3VsdCk7XG4gICAgICAgIHRoaXMuaW5zZXJ0KG9wdGlvbnMsIHJlc3VsdCwgY29uZmlnLmluc2VydCk7XG4gICAgICAgIHRoaXMucmVwbGFjZShvcHRpb25zLCByZXN1bHQsIGNvbmZpZy5yZXBsYWNlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBjcmVhdGVCdWlsZENvbmZpZyhwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IG9iaiA9IHtcbiAgICAgICAgICAgIFwi5rOo6YeKXCI6IHtcbiAgICAgICAgICAgICAgICBcIiHms6jmhI8hXCI6IFwi5LiL6Z2i55qEZmlsZeWtl+auteWdh+S4uuS4juaehOW7uuebruW9leeahOebuOWvuei3r+W+hFwiLFxuICAgICAgICAgICAgICAgIFwiaW5zZXJ0XCI6IFwi5Zyo5oyH5a6a5paH5Lu255qE5oyH5a6a6KGM5o+S5YWl6ZyA6KaB55qE5Luj56CBIOWtl+auteino+mHintmaWxlOuaWh+S7tuWQjSBsaW5lOuesrOWHoOihjCBjb250ZW50OuaPkuWFpeWGheWuuX1cIixcbiAgICAgICAgICAgICAgICBcInJlcGxhY2VcIjogXCLmm7/mjaLmjIflrprmlofku7bkuK3nmoTlrZfnrKbkuLLkuLrpnIDopoHnmoTlgLwg5a2X5q616Kej6YeKe2ZpbGU65paH5Lu25ZCNIGxhYmVsOuaWh+S7tuS4reiiq+abv+S7o+eahOaWh+acrCBzY3JpcHROYW1lOuS7jkdhbWVTZXR0aW5n5LiK5ZOq5Liq6ISa5pys6I635Y+W5bGe5oCn5YC8IHNjcmlwdEZpZWxkOuiEmuacrOS4reeahOWtl+auteWQjeWtl31cIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiaW5zZXJ0XCI6IFtdLFxuICAgICAgICAgICAgXCJyZXBsYWNlXCI6IFtdXG4gICAgICAgIH1cbiAgICAgICAgZnMuY3JlYXRlRmlsZVN5bmMocGF0aCk7XG4gICAgICAgIGZzLndyaXRlSnNvblN5bmMocGF0aCwgb2JqLCB7IHNwYWNlczogNCB9KTtcbiAgICB9XG5cbiAgICAvKiogIOaLt+i0neaooeadv+ebruW9lei1hOa6kCAqL1xuICAgIHByaXZhdGUgc3RhdGljIGNvcHlUZW1wbGF0ZShvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCkge1xuICAgICAgICBsZXQgdGFnID0gXCJbVGVtcGxhdGVdXCI7XG4gICAgICAgIGxldCB0ZW1wbGF0ZVBhdGggPSBgJHtVdGlscy5Qcm9qZWN0UGF0aH0vJHtDb25zdGFudC5CdWlsZENvbmZpZ0Rpck5hbWV9LyR7Q29uc3RhbnQuQnVpbGRUZW1wbGF0ZURpck5hbWV9LyR7b3B0aW9ucy50YXNrTmFtZX1gO1xuICAgICAgICBmcy5lbnN1cmVEaXJTeW5jKHRlbXBsYXRlUGF0aCk7XG4gICAgICAgIGxldCBidWlsZFBhdGggPSBVdGlscy50b1VuaVNlcGFyYXRvcihyZXN1bHQuZGVzdCk7XG4gICAgICAgIGxldCBmaWxlcyA9IFV0aWxzLmdldEFsbEZpbGVzKHRlbXBsYXRlUGF0aCk7XG4gICAgICAgIGxldCBidWlsZERlc3QgPSB0aGlzLnJlc29sdmVCdWlsZERlc3QoYnVpbGRQYXRoLCBvcHRpb25zLnBsYXRmb3JtKTtcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgICAgICBsZXQgZiA9IGZpbGUucmVwbGFjZSh0ZW1wbGF0ZVBhdGgsIFwiXCIpLnJlcGxhY2UoXCIvXCIsIFwiXCIpO1xuICAgICAgICAgICAgbGV0IG5ld0ZpbGUgPSBVdGlscy5yZXNvbHZlRmlsZVBhdGgoYnVpbGREZXN0ICsgXCIvXCIgKyBmKTtcbiAgICAgICAgICAgIGZzLmVuc3VyZURpclN5bmMocGF0aC5kaXJuYW1lKG5ld0ZpbGUpKTtcbiAgICAgICAgICAgIGZzLmNvcHlGaWxlU3luYyhmaWxlLCBuZXdGaWxlKTtcbiAgICAgICAgICAgIEJ1aWxkTG9nZ2VyLmluZm8odGFnLCBcImNvcHkgZmlsZVwiLCBmKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiDlnKjmlofku7bmjIflrprkvY3nva7mj5LlhaXku6PnoIEgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBpbnNlcnQob3B0aW9uczogSUJ1aWxkVGFza09wdGlvbiwgcmVzdWx0OiBJQnVpbGRSZXN1bHQsIGRhdGE6IEluc2VydENvZGVbXSkge1xuICAgICAgICBsZXQgdGFnID0gXCJbSW5zZXJ0Q29kZV1cIjtcbiAgICAgICAgbGV0IGJ1aWxkRGVzdCA9IHRoaXMucmVzb2x2ZUJ1aWxkRGVzdChVdGlscy50b1VuaVNlcGFyYXRvcihyZXN1bHQuZGVzdCksIG9wdGlvbnMucGxhdGZvcm0pO1xuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgZGF0YSkge1xuICAgICAgICAgICAgbGV0IGRlc3RGaWxlID0gVXRpbHMucmVzb2x2ZUZpbGVQYXRoKGJ1aWxkRGVzdCArIFwiL1wiICsgZC5maWxlKTtcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhkZXN0RmlsZSkpIHtcbiAgICAgICAgICAgICAgICBCdWlsZExvZ2dlci53YXJuKHRhZywgXCLmlofku7bkuI3lrZjlnKhcIiwgZC5maWxlKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGNvZGVBcnIgPSBkLmNvbnRlbnQuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgICAgICBsZXQgZGVzdENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZGVzdEZpbGUsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pO1xuICAgICAgICAgICAgbGV0IGRlc3RBcnIgPSBkZXN0Q29udGVudC5zcGxpdChcIlxcclxcblwiKTtcbiAgICAgICAgICAgIGlmIChkZXN0QXJyLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgICAgICBkZXN0QXJyID0gZGVzdENvbnRlbnQuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZXN0QXJyLnNwbGljZShkLmxpbmUgLSAxLCAwLCAuLi5jb2RlQXJyKTtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGVzdEZpbGUsIGRlc3RBcnIuam9pbihcIlxcblwiKSk7XG4gICAgICAgICAgICBCdWlsZExvZ2dlci5pbmZvKHRhZywgZC5maWxlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiDmm7/mjaLmjIflrprmlofku7bkuK3nmoTlrZfnrKbkuLLkuLrpnIDopoHnmoTlgLwgKi9cbiAgICBwcml2YXRlIHN0YXRpYyByZXBsYWNlKG9wdGlvbnM6IElCdWlsZFRhc2tPcHRpb24sIHJlc3VsdDogSUJ1aWxkUmVzdWx0LCBkYXRhOiBSZXBsYWNlVmFsdWVbXSkge1xuICAgICAgICBsZXQgdGFnID0gXCJbUmVwbGFjZVZhbHVlXVwiO1xuICAgICAgICBsZXQgYnVpbGREZXN0ID0gdGhpcy5yZXNvbHZlQnVpbGREZXN0KFV0aWxzLnRvVW5pU2VwYXJhdG9yKHJlc3VsdC5kZXN0KSwgb3B0aW9ucy5wbGF0Zm9ybSk7XG4gICAgICAgIGxldCBtYWluU2NlbmUgPSBVdGlscy5maW5kRmlsZShVdGlscy5Qcm9qZWN0UGF0aCArIFwiL2Fzc2V0c1wiLCB2ID0+IHYuZW5kc1dpdGgoXCJtYWluLnNjZW5lXCIpKTtcblxuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMobWFpblNjZW5lKSkge1xuICAgICAgICAgICAgQnVpbGRMb2dnZXIud2Fybih0YWcsIFwibWFpbi5zY2VuZeaWh+S7tuS4jeWtmOWcqFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgb2JqczogYW55W10gPSBmcy5yZWFkSnNvblN5bmMobWFpblNjZW5lLCB7IGVuY29kaW5nOiBcInV0Zi04XCIgfSk7XG5cbiAgICAgICAgZm9yIChjb25zdCBkIG9mIGRhdGEpIHtcbiAgICAgICAgICAgIGxldCBkZXN0RmlsZSA9IFV0aWxzLnJlc29sdmVGaWxlUGF0aChidWlsZERlc3QgKyBcIi9cIiArIGQuZmlsZSk7XG4gICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGVzdEZpbGUpKSB7XG4gICAgICAgICAgICAgICAgQnVpbGRMb2dnZXIud2Fybih0YWcsIFwi5paH5Lu25LiN5a2Y5ZyoXCIsIGQuZmlsZSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgb2JqID0gb2Jqcy5maW5kKHYgPT4gdlsnX3NjcmlwdE5hbWUnXSA9PSBkLnNjcmlwdE5hbWUpO1xuICAgICAgICAgICAgaWYgKG9iaikge1xuICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IG9ialtkLnNjcmlwdEZpZWxkXTtcbiAgICAgICAgICAgICAgICBsZXQgZGVzdENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZGVzdEZpbGUsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pO1xuICAgICAgICAgICAgICAgIGRlc3RDb250ZW50ID0gZGVzdENvbnRlbnQucmVwbGFjZShkLmxhYmVsLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhkZXN0RmlsZSwgZGVzdENvbnRlbnQpO1xuICAgICAgICAgICAgICAgIEJ1aWxkTG9nZ2VyLmluZm8odGFnLCBkLmZpbGUsIGQubGFiZWwsIHZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgQnVpbGRMb2dnZXIud2Fybih0YWcsIFwi5a+56LGh5pyq5om+5YiwXCIsIGQuc2NyaXB0TmFtZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVzb2x2ZUJ1aWxkRGVzdChidWlsZERlc3QsIHBsYXRmb3JtKSB7XG4gICAgICAgIC8vIGlmIChwbGF0Zm9ybSA9PSBcImFuZHJvaWRcIikge1xuICAgICAgICAvLyAgICAgcmV0dXJuIGJ1aWxkRGVzdCArIFwiL2ZyYW1ld29ya3MvcnVudGltZS1zcmMvcHJvai5hbmRyb2lkLXN0dWRpb1wiO1xuICAgICAgICAvLyB9IGVsc2UgaWYgKHBsYXRmb3JtID09IFwiaW9zXCIpIHtcbiAgICAgICAgLy8gICAgIHJldHVybiBidWlsZERlc3QgKyBcIi9mcmFtZXdvcmtzL3J1bnRpbWUtc3JjL3Byb2ouaW9zX21hY1wiO1xuICAgICAgICAvLyB9IGVsc2UgaWYgKHBsYXRmb3JtID09IFwid2luMzJcIikge1xuICAgICAgICAvLyAgICAgcmV0dXJuIGJ1aWxkRGVzdCArIFwiL2ZyYW1ld29ya3MvcnVudGltZS1zcmMvcHJvai53aW4zMlwiO1xuICAgICAgICAvLyB9XG4gICAgICAgIHJldHVybiBidWlsZERlc3Q7XG4gICAgfVxufSJdfQ==