"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mExec = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("./util");
class mExec {
    /** 格式化目录结构 */
    static formatProject() {
        //创建目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/publish"); //构建后处理资源目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/bundle"); //资源包目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/bundle/localization"); //资源包目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/bundle/localization/sc"); //资源包目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/bundle/localization/tc"); //资源包目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/bundle/localization/en"); //资源包目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/bundle/static"); //资源包目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/bundle/static/anim"); //资源包目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/bundle/static/font"); //资源包目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/bundle/static/uiSprite"); //资源包目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/bundle/dynamic"); //资源包目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/bundle/dynamic/audio"); //资源包目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/bundle/dynamic/table"); //资源包目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/bundle/dynamic/sprite"); //资源包目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/bundle/dynamic/prefab"); //资源包目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/bundle/dynamic/uiPrefab"); //资源包目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/script"); //脚本目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/script/base"); //脚本目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/script/gen"); //脚本目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/script/ui"); //脚本目录
        util_1.util.mkDirIfNotExists(util_1.util.ProjectPath + "/assets/scene"); //场景目录
        //拷贝资源
    }
    /** 导表 */
    static loadExcel() {
        let workDir = util_1.util.ProjectPath + "/excel";
        let batPath = util_1.util.ProjectPath + "/excel/gen_code_json.bat";
        let jsonDir = "db://assets/bundle/dynamic/table";
        util_1.util.exeCMD(workDir, batPath, msg => {
            console.log(msg);
        }, err => {
            console.error(err);
        }, () => {
            let files = util_1.util.getAllFiles(jsonDir, [".json"]);
            files.forEach(v => {
                Editor.Message.send("asset-db", "refresh-asset", util_1.util.toAssetDBUrl(v));
            });
        });
    }
    /** 生成一些常量 */
    static genConst() {
        let map = {};
        let outFile = util_1.util.ProjectPath + "/assets/script/gen/UIConstant.ts";
        let ext = ".prefab";
        let path1 = util_1.util.ProjectPath + "/assets/bundle/dynamic/uiPrefab";
        let files1 = util_1.util.getAllFiles(path1, [ext]);
        files1.forEach(v => {
            let basename = path_1.default.basename(v);
            if (basename.startsWith("UI")) {
                let name = basename.replace(ext, "");
                let location = v.replace(path1 + "/", "").replace(ext, "");
                map[name] = location;
            }
        });
        let content = "export const UIConstant = {\n";
        for (const key in map) {
            content += `    "${key}": "${map[key]}",\n`;
        }
        content += "}";
        util_1.util.mkDirIfNotExists(path_1.default.dirname(outFile));
        fs_1.default.writeFileSync(outFile, content);
        Editor.Message.send("asset-db", "refresh-asset", util_1.util.toAssetDBUrl(outFile));
    }
    static autoBind(scriptName, start, end, strs) {
        let save = false;
        let filePath = util_1.util.getAllFiles(util_1.util.ProjectPath, [scriptName + ".ts"])[0];
        let content = fs_1.default.readFileSync(filePath).toString();
        let lines = content.split(util_1.util.returnSymbol);
        let classTag = `class ${scriptName}`;
        let classIndex = -1, genStartIndex = -1, genEndIndex = -1;
        for (let index = 0; index < lines.length; index++) {
            const line = lines[index].trim();
            if (line.indexOf(classTag) > -1)
                classIndex = index;
            else if (line == start.trim())
                genStartIndex = index;
            else if (line == end.trim())
                genEndIndex = index;
        }
        if (genStartIndex == -1) { //直接生成
            lines.splice(classIndex + 1, 0, start, ...strs, end);
            save = true;
        }
        else {
            if (genEndIndex - genStartIndex - 1 != strs.length) {
                lines.splice(genStartIndex, genEndIndex - genStartIndex + 1, start, ...strs, end);
                save = true;
            }
            else {
                for (let i = genStartIndex + 1, j = 0; i < genEndIndex; i++, j++) {
                    if (lines[i].trim() != strs[j].trim()) {
                        save = true;
                        break;
                    }
                }
                if (save) {
                    lines.splice(genStartIndex, genEndIndex - genStartIndex + 1, start, ...strs, end);
                }
            }
        }
        if (save) {
            fs_1.default.writeFileSync(filePath, lines.join(util_1.util.returnSymbol));
            console.log(`[${scriptName}] 自动绑定成功`);
        }
    }
}
exports.mExec = mExec;
