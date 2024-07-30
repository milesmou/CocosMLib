"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildTemplate = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Constant_1 = require("../tools/Constant");
const Logger_1 = require("../tools/Logger");
const Utils_1 = require("../tools/Utils");
/** 拷贝自定义构建模板资源 */
class BuildTemplate {
    static copy(options, result) {
        let templatePath = Utils_1.Utils.ProjectPath + "/" + Constant_1.Constant.BuildTemplateDirName + "/" + options.taskName;
        fs_extra_1.default.ensureDirSync(templatePath);
        Logger_1.Logger.info(JSON.stringify(options));
        //拷贝模板目录资源
        let insertPrefix = "insert_"; //以这个前缀开头的文件 会将构建模版中的内容插入到构建后的文件指定行
        let buildPath = Utils_1.Utils.toUniSeparator(result.dest);
        let files = Utils_1.Utils.getAllFiles(templatePath);
        let buildDest = this.resolveBuildDest(buildPath, options.platform);
        for (const file of files) {
            let f = file.replace(templatePath, "").replace("/", "");
            if (f.startsWith(insertPrefix)) {
                f = f.replace(insertPrefix, "");
                let lineNum = 0;
                if (f.includes("_")) {
                    let str = f.substring(0, f.indexOf("_"));
                    let num = parseInt(str);
                    if (!isNaN(num)) {
                        lineNum = num;
                        f = f.replace(str + "_", "");
                    }
                }
                let newFile = Utils_1.Utils.resolveFilePath(buildDest + "/" + f);
                Logger_1.Logger.info("insert code ", f);
                this.insertCode(file, newFile, lineNum);
            }
            else {
                let newFile = Utils_1.Utils.resolveFilePath(buildDest + "/" + f);
                Logger_1.Logger.info("copy file", f);
                fs_extra_1.default.ensureDirSync(path_1.default.dirname(newFile));
                fs_extra_1.default.copyFileSync(file, newFile);
            }
        }
    }
    /** 如果构建模板中有特殊脚本 插入内容到构建出的文件内容开头 */
    static insertCode(src, dest, lineNum) {
        let code = fs_extra_1.default.readFileSync(src, { encoding: "utf8" });
        let codeArr = code.split("\r\n");
        if (codeArr.length < 2) {
            codeArr = code.split("\n");
        }
        let destContent = fs_extra_1.default.readFileSync(dest, { encoding: "utf8" });
        let destArr = destContent.split("\r\n");
        if (destArr.length < 2) {
            destArr = destContent.split("\n");
        }
        destArr.splice(lineNum - 1, 0, ...codeArr);
        fs_extra_1.default.writeFileSync(dest, destArr.join("\n"));
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
exports.BuildTemplate = BuildTemplate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGRUZW1wbGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS9wb3N0YnVpbGQvQnVpbGRUZW1wbGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSx3REFBMEI7QUFDMUIsZ0RBQXdCO0FBQ3hCLGdEQUE2QztBQUM3Qyw0Q0FBeUM7QUFDekMsMENBQXVDO0FBRXZDLGtCQUFrQjtBQUNsQixNQUFhLGFBQWE7SUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQXlCLEVBQUUsTUFBb0I7UUFDOUQsSUFBSSxZQUFZLEdBQUcsYUFBSyxDQUFDLFdBQVcsR0FBRyxHQUFHLEdBQUcsbUJBQVEsQ0FBQyxvQkFBb0IsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNwRyxrQkFBRSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMvQixlQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtRQUNwQyxVQUFVO1FBQ1YsSUFBSSxZQUFZLEdBQUcsU0FBUyxDQUFDLENBQUEsbUNBQW1DO1FBQ2hFLElBQUksU0FBUyxHQUFHLGFBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xELElBQUksS0FBSyxHQUFHLGFBQUssQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDNUMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkUsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7WUFDdEIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsQ0FBQyxVQUFV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QS9ERCxzQ0ErREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJQnVpbGRSZXN1bHQsIElCdWlsZFRhc2tPcHRpb24gfSBmcm9tIFwiQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL2J1aWxkZXIvQHR5cGVzL3B1YmxpY1wiO1xyXG5pbXBvcnQgZnMgZnJvbSBcImZzLWV4dHJhXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IENvbnN0YW50IH0gZnJvbSBcIi4uL3Rvb2xzL0NvbnN0YW50XCI7XHJcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuLi90b29scy9Mb2dnZXJcIjtcclxuaW1wb3J0IHsgVXRpbHMgfSBmcm9tIFwiLi4vdG9vbHMvVXRpbHNcIjtcclxuXHJcbi8qKiDmi7fotJ3oh6rlrprkuYnmnoTlu7rmqKHmnb/otYTmupAgKi9cclxuZXhwb3J0IGNsYXNzIEJ1aWxkVGVtcGxhdGUge1xyXG4gICAgcHVibGljIHN0YXRpYyBjb3B5KG9wdGlvbnM6IElCdWlsZFRhc2tPcHRpb24sIHJlc3VsdDogSUJ1aWxkUmVzdWx0KSB7XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlUGF0aCA9IFV0aWxzLlByb2plY3RQYXRoICsgXCIvXCIgKyBDb25zdGFudC5CdWlsZFRlbXBsYXRlRGlyTmFtZSArIFwiL1wiICsgb3B0aW9ucy50YXNrTmFtZTtcclxuICAgICAgICBmcy5lbnN1cmVEaXJTeW5jKHRlbXBsYXRlUGF0aCk7XHJcbiAgICAgICAgTG9nZ2VyLmluZm8oSlNPTi5zdHJpbmdpZnkob3B0aW9ucykpXHJcbiAgICAgICAgLy/mi7fotJ3mqKHmnb/nm67lvZXotYTmupBcclxuICAgICAgICBsZXQgaW5zZXJ0UHJlZml4ID0gXCJpbnNlcnRfXCI7Ly/ku6Xov5nkuKrliY3nvIDlvIDlpLTnmoTmlofku7Yg5Lya5bCG5p6E5bu65qih54mI5Lit55qE5YaF5a655o+S5YWl5Yiw5p6E5bu65ZCO55qE5paH5Lu25oyH5a6a6KGMXHJcbiAgICAgICAgbGV0IGJ1aWxkUGF0aCA9IFV0aWxzLnRvVW5pU2VwYXJhdG9yKHJlc3VsdC5kZXN0KTtcclxuICAgICAgICBsZXQgZmlsZXMgPSBVdGlscy5nZXRBbGxGaWxlcyh0ZW1wbGF0ZVBhdGgpO1xyXG4gICAgICAgIGxldCBidWlsZERlc3QgPSB0aGlzLnJlc29sdmVCdWlsZERlc3QoYnVpbGRQYXRoLCBvcHRpb25zLnBsYXRmb3JtKTtcclxuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcclxuICAgICAgICAgICAgbGV0IGYgPSBmaWxlLnJlcGxhY2UodGVtcGxhdGVQYXRoLCBcIlwiKS5yZXBsYWNlKFwiL1wiLCBcIlwiKTtcclxuICAgICAgICAgICAgaWYgKGYuc3RhcnRzV2l0aChpbnNlcnRQcmVmaXgpKSB7XHJcbiAgICAgICAgICAgICAgICBmID0gZi5yZXBsYWNlKGluc2VydFByZWZpeCwgXCJcIik7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGluZU51bSA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoZi5pbmNsdWRlcyhcIl9cIikpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3RyID0gZi5zdWJzdHJpbmcoMCwgZi5pbmRleE9mKFwiX1wiKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG51bSA9IHBhcnNlSW50KHN0cik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc05hTihudW0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVOdW0gPSBudW07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGYgPSBmLnJlcGxhY2Uoc3RyICsgXCJfXCIsIFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxldCBuZXdGaWxlID0gVXRpbHMucmVzb2x2ZUZpbGVQYXRoKGJ1aWxkRGVzdCArIFwiL1wiICsgZik7XHJcbiAgICAgICAgICAgICAgICBMb2dnZXIuaW5mbyhcImluc2VydCBjb2RlIFwiLCBmKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0Q29kZShmaWxlLCBuZXdGaWxlLCBsaW5lTnVtKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBuZXdGaWxlID0gVXRpbHMucmVzb2x2ZUZpbGVQYXRoKGJ1aWxkRGVzdCArIFwiL1wiICsgZik7XHJcbiAgICAgICAgICAgICAgICBMb2dnZXIuaW5mbyhcImNvcHkgZmlsZVwiLCBmKTtcclxuICAgICAgICAgICAgICAgIGZzLmVuc3VyZURpclN5bmMocGF0aC5kaXJuYW1lKG5ld0ZpbGUpKTtcclxuICAgICAgICAgICAgICAgIGZzLmNvcHlGaWxlU3luYyhmaWxlLCBuZXdGaWxlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiog5aaC5p6c5p6E5bu65qih5p2/5Lit5pyJ54m55q6K6ISa5pysIOaPkuWFpeWGheWuueWIsOaehOW7uuWHuueahOaWh+S7tuWGheWuueW8gOWktCAqL1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5zZXJ0Q29kZShzcmM6IHN0cmluZywgZGVzdDogc3RyaW5nLCBsaW5lTnVtOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgY29kZSA9IGZzLnJlYWRGaWxlU3luYyhzcmMsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pO1xyXG4gICAgICAgIGxldCBjb2RlQXJyID0gY29kZS5zcGxpdChcIlxcclxcblwiKTtcclxuICAgICAgICBpZiAoY29kZUFyci5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgICAgIGNvZGVBcnIgPSBjb2RlLnNwbGl0KFwiXFxuXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZGVzdENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZGVzdCwgeyBlbmNvZGluZzogXCJ1dGY4XCIgfSk7XHJcbiAgICAgICAgbGV0IGRlc3RBcnIgPSBkZXN0Q29udGVudC5zcGxpdChcIlxcclxcblwiKTtcclxuICAgICAgICBpZiAoZGVzdEFyci5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgICAgIGRlc3RBcnIgPSBkZXN0Q29udGVudC5zcGxpdChcIlxcblwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGVzdEFyci5zcGxpY2UobGluZU51bSAtIDEsIDAsIC4uLmNvZGVBcnIpO1xyXG5cclxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGRlc3QsIGRlc3RBcnIuam9pbihcIlxcblwiKSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlc29sdmVCdWlsZERlc3QoYnVpbGREZXN0LCBwbGF0Zm9ybSkge1xyXG4gICAgICAgIC8vIGlmIChwbGF0Zm9ybSA9PSBcImFuZHJvaWRcIikge1xyXG4gICAgICAgIC8vICAgICByZXR1cm4gYnVpbGREZXN0ICsgXCIvZnJhbWV3b3Jrcy9ydW50aW1lLXNyYy9wcm9qLmFuZHJvaWQtc3R1ZGlvXCI7XHJcbiAgICAgICAgLy8gfSBlbHNlIGlmIChwbGF0Zm9ybSA9PSBcImlvc1wiKSB7XHJcbiAgICAgICAgLy8gICAgIHJldHVybiBidWlsZERlc3QgKyBcIi9mcmFtZXdvcmtzL3J1bnRpbWUtc3JjL3Byb2ouaW9zX21hY1wiO1xyXG4gICAgICAgIC8vIH0gZWxzZSBpZiAocGxhdGZvcm0gPT0gXCJ3aW4zMlwiKSB7XHJcbiAgICAgICAgLy8gICAgIHJldHVybiBidWlsZERlc3QgKyBcIi9mcmFtZXdvcmtzL3J1bnRpbWUtc3JjL3Byb2oud2luMzJcIjtcclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgcmV0dXJuIGJ1aWxkRGVzdDtcclxuICAgIH1cclxufSJdfQ==