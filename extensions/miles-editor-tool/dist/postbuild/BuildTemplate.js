"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildTemplate = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Config_1 = require("../tools/Config");
const Constant_1 = require("../tools/Constant");
const LogToFile_1 = require("../tools/LogToFile");
const MLogger_1 = require("../tools/MLogger");
const Utils_1 = require("../tools/Utils");
/** 拷贝自定义构建模板资源 */
class BuildTemplate {
    static copy(options, result) {
        if (!Config_1.Config.get(Constant_1.Constant.BuildTemplateSaveKey, true)) {
            LogToFile_1.LogToFile.log("未启用构建模板");
            MLogger_1.MLogger.info("未启用构建模板");
            return; //未启用构建模板
        }
        let templatePath = Utils_1.Utils.ProjectPath + "/" + Constant_1.Constant.BuildTemplateDirName + "/" + options.outputName;
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
                let newFile = buildDest + "/" + f;
                LogToFile_1.LogToFile.log("insert code ", f);
                this.insertCode(file, newFile, lineNum);
            }
            else {
                let newFile = buildDest + "/" + f;
                LogToFile_1.LogToFile.log("copy file", f);
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
        destArr.splice(lineNum, 0, ...codeArr);
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
