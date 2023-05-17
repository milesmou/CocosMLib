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
    /** 导表 */
    static loadExcel() {
        let workDir = util_1.util.ProjectPath + "/excel";
        let batPath = util_1.util.ProjectPath + "/excel/gen_code_json.bat";
        let jsonDir = "db://assets/resources/data";
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
        let outFile = util_1.util.ProjectPath + "/assets/script/gen/UIConst.ts";
        let ext = ".prefab";
        let path1 = util_1.util.ProjectPath + "/assets/bundles";
        let path2 = util_1.util.ProjectPath + "/assets/resources";
        let files1 = util_1.util.getAllFiles(path1, [ext]);
        let files2 = util_1.util.getAllFiles(path2, [ext]);
        files1.forEach(v => {
            let basename = path_1.default.basename(v);
            if (basename.startsWith("UI")) {
                let name = basename.replace(ext, "");
                let location = v.replace(path2 + "/", "").replace(ext, "");
                let index = location.indexOf("/");
                if (index > -1)
                    location = location.substring(index + 1);
                map[name] = location;
            }
        });
        files2.forEach(v => {
            let basename = path_1.default.basename(v);
            if (basename.startsWith("UI")) {
                let name = basename.replace(ext, "");
                let location = v.replace(path2 + "/", "").replace(ext, "");
                map[name] = location;
            }
        });
        let content = "export const UIConst = {\n";
        for (const key in map) {
            content += `    "${key}": "${map[key]}",\n`;
        }
        content += "}";
        console.log();
        util_1.util.mkDirIfNotExists(path_1.default.dirname(outFile));
        fs_1.default.writeFileSync(outFile, content);
        Editor.Message.send("asset-db", "refresh-asset", util_1.util.toAssetDBUrl(outFile));
    }
}
exports.mExec = mExec;
