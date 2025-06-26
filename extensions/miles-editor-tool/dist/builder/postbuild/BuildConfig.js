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
            let codeArr;
            if (typeof d.content === "string") {
                codeArr = d.content.split("\n");
            }
            else {
                codeArr = d.content;
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGRDb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvYnVpbGRlci9wb3N0YnVpbGQvQnVpbGRDb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsd0RBQTBCO0FBQzFCLGdEQUF3QjtBQUV4QixtREFBZ0Q7QUFDaEQsNkNBQTBDO0FBQzFDLGdEQUE2QztBQXFCN0MsZ0JBQWdCO0FBQ2hCLE1BQWEsV0FBVztJQUViLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBeUIsRUFBRSxNQUFvQjtRQUNqRSxJQUFJLGNBQWMsR0FBRyxHQUFHLGFBQUssQ0FBQyxXQUFXLElBQUksbUJBQVEsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzNFLGtCQUFFLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2pDLElBQUksV0FBVyxHQUFHLEdBQUcsYUFBSyxDQUFDLFdBQVcsSUFBSSxtQkFBUSxDQUFDLGtCQUFrQixJQUFJLE9BQU8sQ0FBQyxRQUFRLE9BQU8sQ0FBQztRQUNqRyxJQUFJLENBQUMsa0JBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JFLElBQUksTUFBTSxHQUFHLGtCQUFFLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBVyxDQUFDO1FBQzFFLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU8sTUFBTSxDQUFDLGlCQUFpQixDQUFDLElB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QUNqRDtpQkFBTTtnQkFDSCx5QkFBVyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNoRDtTQUVKO0lBQ0wsQ0FBQztJQUdPLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsUUFBUTtRQUMvQywrQkFBK0I7UUFDL0Isd0VBQXdFO1FBQ3hFLGtDQUFrQztRQUNsQyxpRUFBaUU7UUFDakUsb0NBQW9DO1FBQ3BDLCtEQUErRDtRQUMvRCxJQUFJO1FBQ0osT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztDQUNKO0FBbkhELGtDQW1IQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBJQnVpbGRSZXN1bHQsIElCdWlsZFRhc2tPcHRpb24gfSBmcm9tIFwiLi4vLi4vLi4vQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL2J1aWxkZXIvQHR5cGVzXCI7XG5pbXBvcnQgeyBDb25zdGFudCB9IGZyb20gXCIuLi8uLi90b29scy9Db25zdGFudFwiO1xuaW1wb3J0IHsgVXRpbHMgfSBmcm9tIFwiLi4vLi4vdG9vbHMvVXRpbHNcIjtcbmltcG9ydCB7IEJ1aWxkTG9nZ2VyIH0gZnJvbSBcIi4uL0J1aWxkTG9nZ2VyXCI7XG5cblxuaW50ZXJmYWNlIEluc2VydENvZGUge1xuICAgIGZpbGU6IHN0cmluZztcbiAgICBsaW5lOiBudW1iZXI7XG4gICAgY29udGVudDogc3RyaW5nIHwgc3RyaW5nW107XG59XG5cbmludGVyZmFjZSBSZXBsYWNlVmFsdWUge1xuICAgIGZpbGU6IHN0cmluZztcbiAgICBsYWJlbDogc3RyaW5nO1xuICAgIHNjcmlwdE5hbWU6IHN0cmluZztcbiAgICBzY3JpcHRGaWVsZDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgQ29uZmlnIHtcbiAgICBpbnNlcnQ6IEluc2VydENvZGVbXTtcbiAgICByZXBsYWNlOiBSZXBsYWNlVmFsdWVbXTtcbn1cblxuLyoqIOiHquWumuS5ieaehOW7uumFjee9ruWkhOeQhiAqL1xuZXhwb3J0IGNsYXNzIEJ1aWxkQ29uZmlnIHtcblxuICAgIHB1YmxpYyBzdGF0aWMgZXhlY3V0ZShvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCkge1xuICAgICAgICBsZXQgYnVpbGRDb25maWdEaXIgPSBgJHtVdGlscy5Qcm9qZWN0UGF0aH0vJHtDb25zdGFudC5CdWlsZENvbmZpZ0Rpck5hbWV9YDtcbiAgICAgICAgZnMuZW5zdXJlRGlyU3luYyhidWlsZENvbmZpZ0Rpcik7XG4gICAgICAgIGxldCBidWlsZENvbmZpZyA9IGAke1V0aWxzLlByb2plY3RQYXRofS8ke0NvbnN0YW50LkJ1aWxkQ29uZmlnRGlyTmFtZX0vJHtvcHRpb25zLnRhc2tOYW1lfS5qc29uYDtcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGJ1aWxkQ29uZmlnKSkgdGhpcy5jcmVhdGVCdWlsZENvbmZpZyhidWlsZENvbmZpZyk7XG4gICAgICAgIGxldCBjb25maWcgPSBmcy5yZWFkSnNvblN5bmMoYnVpbGRDb25maWcsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pIGFzIENvbmZpZztcbiAgICAgICAgdGhpcy5jb3B5VGVtcGxhdGUob3B0aW9ucywgcmVzdWx0KTtcbiAgICAgICAgdGhpcy5pbnNlcnQob3B0aW9ucywgcmVzdWx0LCBjb25maWcuaW5zZXJ0KTtcbiAgICAgICAgdGhpcy5yZXBsYWNlKG9wdGlvbnMsIHJlc3VsdCwgY29uZmlnLnJlcGxhY2UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGNyZWF0ZUJ1aWxkQ29uZmlnKHBhdGg6IHN0cmluZykge1xuICAgICAgICBsZXQgb2JqID0ge1xuICAgICAgICAgICAgXCLms6jph4pcIjoge1xuICAgICAgICAgICAgICAgIFwiIeazqOaEjyFcIjogXCLkuIvpnaLnmoRmaWxl5a2X5q615Z2H5Li65LiO5p6E5bu655uu5b2V55qE55u45a+56Lev5b6EXCIsXG4gICAgICAgICAgICAgICAgXCJpbnNlcnRcIjogXCLlnKjmjIflrprmlofku7bnmoTmjIflrprooYzmj5LlhaXpnIDopoHnmoTku6PnoIEg5a2X5q616Kej6YeKe2ZpbGU65paH5Lu25ZCNIGxpbmU656ys5Yeg6KGMIGNvbnRlbnQ65o+S5YWl5YaF5a65fVwiLFxuICAgICAgICAgICAgICAgIFwicmVwbGFjZVwiOiBcIuabv+aNouaMh+WumuaWh+S7tuS4reeahOWtl+espuS4suS4uumcgOimgeeahOWAvCDlrZfmrrXop6Pph4p7ZmlsZTrmlofku7blkI0gbGFiZWw65paH5Lu25Lit6KKr5pu/5Luj55qE5paH5pysIHNjcmlwdE5hbWU65LuOR2FtZVNldHRpbmfkuIrlk6rkuKrohJrmnKzojrflj5blsZ7mgKflgLwgc2NyaXB0RmllbGQ66ISa5pys5Lit55qE5a2X5q615ZCN5a2XfVwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJpbnNlcnRcIjogW10sXG4gICAgICAgICAgICBcInJlcGxhY2VcIjogW11cbiAgICAgICAgfVxuICAgICAgICBmcy5jcmVhdGVGaWxlU3luYyhwYXRoKTtcbiAgICAgICAgZnMud3JpdGVKc29uU3luYyhwYXRoLCBvYmosIHsgc3BhY2VzOiA0IH0pO1xuICAgIH1cblxuICAgIC8qKiAg5ou36LSd5qih5p2/55uu5b2V6LWE5rqQICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgY29weVRlbXBsYXRlKG9wdGlvbnM6IElCdWlsZFRhc2tPcHRpb24sIHJlc3VsdDogSUJ1aWxkUmVzdWx0KSB7XG4gICAgICAgIGxldCB0YWcgPSBcIltUZW1wbGF0ZV1cIjtcbiAgICAgICAgbGV0IHRlbXBsYXRlUGF0aCA9IGAke1V0aWxzLlByb2plY3RQYXRofS8ke0NvbnN0YW50LkJ1aWxkQ29uZmlnRGlyTmFtZX0vJHtDb25zdGFudC5CdWlsZFRlbXBsYXRlRGlyTmFtZX0vJHtvcHRpb25zLnRhc2tOYW1lfWA7XG4gICAgICAgIGZzLmVuc3VyZURpclN5bmModGVtcGxhdGVQYXRoKTtcbiAgICAgICAgbGV0IGJ1aWxkUGF0aCA9IFV0aWxzLnRvVW5pU2VwYXJhdG9yKHJlc3VsdC5kZXN0KTtcbiAgICAgICAgbGV0IGZpbGVzID0gVXRpbHMuZ2V0QWxsRmlsZXModGVtcGxhdGVQYXRoKTtcbiAgICAgICAgbGV0IGJ1aWxkRGVzdCA9IHRoaXMucmVzb2x2ZUJ1aWxkRGVzdChidWlsZFBhdGgsIG9wdGlvbnMucGxhdGZvcm0pO1xuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgICAgIGxldCBmID0gZmlsZS5yZXBsYWNlKHRlbXBsYXRlUGF0aCwgXCJcIikucmVwbGFjZShcIi9cIiwgXCJcIik7XG4gICAgICAgICAgICBsZXQgbmV3RmlsZSA9IFV0aWxzLnJlc29sdmVGaWxlUGF0aChidWlsZERlc3QgKyBcIi9cIiArIGYpO1xuICAgICAgICAgICAgZnMuZW5zdXJlRGlyU3luYyhwYXRoLmRpcm5hbWUobmV3RmlsZSkpO1xuICAgICAgICAgICAgZnMuY29weUZpbGVTeW5jKGZpbGUsIG5ld0ZpbGUpO1xuICAgICAgICAgICAgQnVpbGRMb2dnZXIuaW5mbyh0YWcsIFwiY29weSBmaWxlXCIsIGYpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIOWcqOaWh+S7tuaMh+WumuS9jee9ruaPkuWFpeS7o+eggSAqL1xuICAgIHByaXZhdGUgc3RhdGljIGluc2VydChvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCwgZGF0YTogSW5zZXJ0Q29kZVtdKSB7XG4gICAgICAgIGxldCB0YWcgPSBcIltJbnNlcnRDb2RlXVwiO1xuICAgICAgICBsZXQgYnVpbGREZXN0ID0gdGhpcy5yZXNvbHZlQnVpbGREZXN0KFV0aWxzLnRvVW5pU2VwYXJhdG9yKHJlc3VsdC5kZXN0KSwgb3B0aW9ucy5wbGF0Zm9ybSk7XG4gICAgICAgIGZvciAoY29uc3QgZCBvZiBkYXRhKSB7XG4gICAgICAgICAgICBsZXQgZGVzdEZpbGUgPSBVdGlscy5yZXNvbHZlRmlsZVBhdGgoYnVpbGREZXN0ICsgXCIvXCIgKyBkLmZpbGUpO1xuICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGRlc3RGaWxlKSkge1xuICAgICAgICAgICAgICAgIEJ1aWxkTG9nZ2VyLndhcm4odGFnLCBcIuaWh+S7tuS4jeWtmOWcqFwiLCBkLmZpbGUpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgY29kZUFycjogc3RyaW5nW107XG4gICAgICAgICAgICBpZiAodHlwZW9mIGQuY29udGVudCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGNvZGVBcnIgPSBkLmNvbnRlbnQuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvZGVBcnIgPSBkLmNvbnRlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZGVzdENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZGVzdEZpbGUsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pO1xuICAgICAgICAgICAgbGV0IGRlc3RBcnIgPSBkZXN0Q29udGVudC5zcGxpdChcIlxcclxcblwiKTtcbiAgICAgICAgICAgIGlmIChkZXN0QXJyLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgICAgICBkZXN0QXJyID0gZGVzdENvbnRlbnQuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZXN0QXJyLnNwbGljZShkLmxpbmUgLSAxLCAwLCAuLi5jb2RlQXJyKTtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGVzdEZpbGUsIGRlc3RBcnIuam9pbihcIlxcblwiKSk7XG4gICAgICAgICAgICBCdWlsZExvZ2dlci5pbmZvKHRhZywgZC5maWxlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiDmm7/mjaLmjIflrprmlofku7bkuK3nmoTlrZfnrKbkuLLkuLrpnIDopoHnmoTlgLwgKi9cbiAgICBwcml2YXRlIHN0YXRpYyByZXBsYWNlKG9wdGlvbnM6IElCdWlsZFRhc2tPcHRpb24sIHJlc3VsdDogSUJ1aWxkUmVzdWx0LCBkYXRhOiBSZXBsYWNlVmFsdWVbXSkge1xuICAgICAgICBsZXQgdGFnID0gXCJbUmVwbGFjZVZhbHVlXVwiO1xuICAgICAgICBsZXQgYnVpbGREZXN0ID0gdGhpcy5yZXNvbHZlQnVpbGREZXN0KFV0aWxzLnRvVW5pU2VwYXJhdG9yKHJlc3VsdC5kZXN0KSwgb3B0aW9ucy5wbGF0Zm9ybSk7XG4gICAgICAgIGxldCBtYWluU2NlbmUgPSBVdGlscy5maW5kRmlsZShVdGlscy5Qcm9qZWN0UGF0aCArIFwiL2Fzc2V0c1wiLCB2ID0+IHYuZW5kc1dpdGgoXCJtYWluLnNjZW5lXCIpKTtcblxuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMobWFpblNjZW5lKSkge1xuICAgICAgICAgICAgQnVpbGRMb2dnZXIud2Fybih0YWcsIFwibWFpbi5zY2VuZeaWh+S7tuS4jeWtmOWcqFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgb2JqczogYW55W10gPSBmcy5yZWFkSnNvblN5bmMobWFpblNjZW5lLCB7IGVuY29kaW5nOiBcInV0Zi04XCIgfSk7XG5cbiAgICAgICAgZm9yIChjb25zdCBkIG9mIGRhdGEpIHtcbiAgICAgICAgICAgIGxldCBkZXN0RmlsZSA9IFV0aWxzLnJlc29sdmVGaWxlUGF0aChidWlsZERlc3QgKyBcIi9cIiArIGQuZmlsZSk7XG4gICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGVzdEZpbGUpKSB7XG4gICAgICAgICAgICAgICAgQnVpbGRMb2dnZXIud2Fybih0YWcsIFwi5paH5Lu25LiN5a2Y5ZyoXCIsIGQuZmlsZSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgb2JqID0gb2Jqcy5maW5kKHYgPT4gdlsnX3NjcmlwdE5hbWUnXSA9PSBkLnNjcmlwdE5hbWUpO1xuICAgICAgICAgICAgaWYgKG9iaikge1xuICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IG9ialtkLnNjcmlwdEZpZWxkXTtcbiAgICAgICAgICAgICAgICBsZXQgZGVzdENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZGVzdEZpbGUsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pO1xuICAgICAgICAgICAgICAgIGRlc3RDb250ZW50ID0gZGVzdENvbnRlbnQucmVwbGFjZShkLmxhYmVsLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhkZXN0RmlsZSwgZGVzdENvbnRlbnQpO1xuICAgICAgICAgICAgICAgIEJ1aWxkTG9nZ2VyLmluZm8odGFnLCBkLmZpbGUsIGQubGFiZWwsIHZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgQnVpbGRMb2dnZXIud2Fybih0YWcsIFwi5a+56LGh5pyq5om+5YiwXCIsIGQuc2NyaXB0TmFtZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVzb2x2ZUJ1aWxkRGVzdChidWlsZERlc3QsIHBsYXRmb3JtKSB7XG4gICAgICAgIC8vIGlmIChwbGF0Zm9ybSA9PSBcImFuZHJvaWRcIikge1xuICAgICAgICAvLyAgICAgcmV0dXJuIGJ1aWxkRGVzdCArIFwiL2ZyYW1ld29ya3MvcnVudGltZS1zcmMvcHJvai5hbmRyb2lkLXN0dWRpb1wiO1xuICAgICAgICAvLyB9IGVsc2UgaWYgKHBsYXRmb3JtID09IFwiaW9zXCIpIHtcbiAgICAgICAgLy8gICAgIHJldHVybiBidWlsZERlc3QgKyBcIi9mcmFtZXdvcmtzL3J1bnRpbWUtc3JjL3Byb2ouaW9zX21hY1wiO1xuICAgICAgICAvLyB9IGVsc2UgaWYgKHBsYXRmb3JtID09IFwid2luMzJcIikge1xuICAgICAgICAvLyAgICAgcmV0dXJuIGJ1aWxkRGVzdCArIFwiL2ZyYW1ld29ya3MvcnVudGltZS1zcmMvcHJvai53aW4zMlwiO1xuICAgICAgICAvLyB9XG4gICAgICAgIHJldHVybiBidWlsZERlc3Q7XG4gICAgfVxufSJdfQ==