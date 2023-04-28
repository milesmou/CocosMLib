"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mExec = void 0;
const util_1 = require("./util");
class mExec {
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
}
exports.mExec = mExec;
