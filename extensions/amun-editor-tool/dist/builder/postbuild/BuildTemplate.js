"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildTemplate = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Constant_1 = require("../../tools/Constant");
const Logger_1 = require("../../tools/Logger");
const Utils_1 = require("../../tools/Utils");
/** 拷贝自定义构建模板资源 */
class BuildTemplate {
    static copy(options, result) {
        let templatePath = Utils_1.Utils.ProjectPath + "/" + Constant_1.Constant.BuildTemplateDirName + "/" + options.taskName;
        fs_extra_1.default.ensureDirSync(templatePath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGRUZW1wbGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS9idWlsZGVyL3Bvc3RidWlsZC9CdWlsZFRlbXBsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLHdEQUEwQjtBQUMxQixnREFBd0I7QUFDeEIsbURBQWdEO0FBQ2hELCtDQUE0QztBQUM1Qyw2Q0FBMEM7QUFHMUMsa0JBQWtCO0FBQ2xCLE1BQWEsYUFBYTtJQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBeUIsRUFBRSxNQUFvQjtRQUM5RCxJQUFJLFlBQVksR0FBRyxhQUFLLENBQUMsV0FBVyxHQUFHLEdBQUcsR0FBRyxtQkFBUSxDQUFDLG9CQUFvQixHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQ3BHLGtCQUFFLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQy9CLFVBQVU7UUFDVixJQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsQ0FBQSxtQ0FBbUM7UUFDaEUsSUFBSSxTQUFTLEdBQUcsYUFBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEQsSUFBSSxLQUFLLEdBQUcsYUFBSyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1QyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuRSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtZQUN0QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDNUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENB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SUJ1aWxkVGFza09wdGlvbiB9IGZyb20gXCJAY29jb3MvY3JlYXRvci10eXBlcy9lZGl0b3IvcGFja2FnZXMvYnVpbGRlci9AdHlwZXMvcHVibGljXCI7XG5pbXBvcnQgZnMgZnJvbSBcImZzLWV4dHJhXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgQ29uc3RhbnQgfSBmcm9tIFwiLi4vLi4vdG9vbHMvQ29uc3RhbnRcIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuLi8uLi90b29scy9Mb2dnZXJcIjtcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSBcIi4uLy4uL3Rvb2xzL1V0aWxzXCI7XG5cblxuLyoqIOaLt+i0neiHquWumuS5ieaehOW7uuaooeadv+i1hOa6kCAqL1xuZXhwb3J0IGNsYXNzIEJ1aWxkVGVtcGxhdGUge1xuICAgIHB1YmxpYyBzdGF0aWMgY29weShvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCkge1xuICAgICAgICBsZXQgdGVtcGxhdGVQYXRoID0gVXRpbHMuUHJvamVjdFBhdGggKyBcIi9cIiArIENvbnN0YW50LkJ1aWxkVGVtcGxhdGVEaXJOYW1lICsgXCIvXCIgKyBvcHRpb25zLnRhc2tOYW1lO1xuICAgICAgICBmcy5lbnN1cmVEaXJTeW5jKHRlbXBsYXRlUGF0aCk7XG4gICAgICAgIC8v5ou36LSd5qih5p2/55uu5b2V6LWE5rqQXG4gICAgICAgIGxldCBpbnNlcnRQcmVmaXggPSBcImluc2VydF9cIjsvL+S7pei/meS4quWJjee8gOW8gOWktOeahOaWh+S7tiDkvJrlsIbmnoTlu7rmqKHniYjkuK3nmoTlhoXlrrnmj5LlhaXliLDmnoTlu7rlkI7nmoTmlofku7bmjIflrprooYxcbiAgICAgICAgbGV0IGJ1aWxkUGF0aCA9IFV0aWxzLnRvVW5pU2VwYXJhdG9yKHJlc3VsdC5kZXN0KTtcbiAgICAgICAgbGV0IGZpbGVzID0gVXRpbHMuZ2V0QWxsRmlsZXModGVtcGxhdGVQYXRoKTtcbiAgICAgICAgbGV0IGJ1aWxkRGVzdCA9IHRoaXMucmVzb2x2ZUJ1aWxkRGVzdChidWlsZFBhdGgsIG9wdGlvbnMucGxhdGZvcm0pO1xuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgICAgIGxldCBmID0gZmlsZS5yZXBsYWNlKHRlbXBsYXRlUGF0aCwgXCJcIikucmVwbGFjZShcIi9cIiwgXCJcIik7XG4gICAgICAgICAgICBpZiAoZi5zdGFydHNXaXRoKGluc2VydFByZWZpeCkpIHtcbiAgICAgICAgICAgICAgICBmID0gZi5yZXBsYWNlKGluc2VydFByZWZpeCwgXCJcIik7XG4gICAgICAgICAgICAgICAgbGV0IGxpbmVOdW0gPSAwO1xuICAgICAgICAgICAgICAgIGlmIChmLmluY2x1ZGVzKFwiX1wiKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3RyID0gZi5zdWJzdHJpbmcoMCwgZi5pbmRleE9mKFwiX1wiKSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBudW0gPSBwYXJzZUludChzdHIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzTmFOKG51bSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVOdW0gPSBudW07XG4gICAgICAgICAgICAgICAgICAgICAgICBmID0gZi5yZXBsYWNlKHN0ciArIFwiX1wiLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgbmV3RmlsZSA9IFV0aWxzLnJlc29sdmVGaWxlUGF0aChidWlsZERlc3QgKyBcIi9cIiArIGYpO1xuICAgICAgICAgICAgICAgIExvZ2dlci5pbmZvKFwiaW5zZXJ0IGNvZGUgXCIsIGYpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0Q29kZShmaWxlLCBuZXdGaWxlLCBsaW5lTnVtKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IG5ld0ZpbGUgPSBVdGlscy5yZXNvbHZlRmlsZVBhdGgoYnVpbGREZXN0ICsgXCIvXCIgKyBmKTtcbiAgICAgICAgICAgICAgICBMb2dnZXIuaW5mbyhcImNvcHkgZmlsZVwiLCBmKTtcbiAgICAgICAgICAgICAgICBmcy5lbnN1cmVEaXJTeW5jKHBhdGguZGlybmFtZShuZXdGaWxlKSk7XG4gICAgICAgICAgICAgICAgZnMuY29weUZpbGVTeW5jKGZpbGUsIG5ld0ZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIOWmguaenOaehOW7uuaooeadv+S4reacieeJueauiuiEmuacrCDmj5LlhaXlhoXlrrnliLDmnoTlu7rlh7rnmoTmlofku7blhoXlrrnlvIDlpLQgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBpbnNlcnRDb2RlKHNyYzogc3RyaW5nLCBkZXN0OiBzdHJpbmcsIGxpbmVOdW06IG51bWJlcikge1xuICAgICAgICBsZXQgY29kZSA9IGZzLnJlYWRGaWxlU3luYyhzcmMsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pO1xuICAgICAgICBsZXQgY29kZUFyciA9IGNvZGUuc3BsaXQoXCJcXHJcXG5cIik7XG4gICAgICAgIGlmIChjb2RlQXJyLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgIGNvZGVBcnIgPSBjb2RlLnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkZXN0Q29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhkZXN0LCB7IGVuY29kaW5nOiBcInV0ZjhcIiB9KTtcbiAgICAgICAgbGV0IGRlc3RBcnIgPSBkZXN0Q29udGVudC5zcGxpdChcIlxcclxcblwiKTtcbiAgICAgICAgaWYgKGRlc3RBcnIubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgZGVzdEFyciA9IGRlc3RDb250ZW50LnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3RBcnIuc3BsaWNlKGxpbmVOdW0gLSAxLCAwLCAuLi5jb2RlQXJyKTtcblxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGRlc3QsIGRlc3RBcnIuam9pbihcIlxcblwiKSk7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIHN0YXRpYyByZXNvbHZlQnVpbGREZXN0KGJ1aWxkRGVzdCwgcGxhdGZvcm0pIHtcbiAgICAgICAgLy8gaWYgKHBsYXRmb3JtID09IFwiYW5kcm9pZFwiKSB7XG4gICAgICAgIC8vICAgICByZXR1cm4gYnVpbGREZXN0ICsgXCIvZnJhbWV3b3Jrcy9ydW50aW1lLXNyYy9wcm9qLmFuZHJvaWQtc3R1ZGlvXCI7XG4gICAgICAgIC8vIH0gZWxzZSBpZiAocGxhdGZvcm0gPT0gXCJpb3NcIikge1xuICAgICAgICAvLyAgICAgcmV0dXJuIGJ1aWxkRGVzdCArIFwiL2ZyYW1ld29ya3MvcnVudGltZS1zcmMvcHJvai5pb3NfbWFjXCI7XG4gICAgICAgIC8vIH0gZWxzZSBpZiAocGxhdGZvcm0gPT0gXCJ3aW4zMlwiKSB7XG4gICAgICAgIC8vICAgICByZXR1cm4gYnVpbGREZXN0ICsgXCIvZnJhbWV3b3Jrcy9ydW50aW1lLXNyYy9wcm9qLndpbjMyXCI7XG4gICAgICAgIC8vIH1cbiAgICAgICAgcmV0dXJuIGJ1aWxkRGVzdDtcbiAgICB9XG59Il19