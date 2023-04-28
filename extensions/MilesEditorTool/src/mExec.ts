import fs from "fs";
import path from "path";
import { util } from "./util";

export class mExec {
    /** 导表 */
    static loadExcel() {
        let workDir = util.ProjectPath + "/excel";
        let batPath = util.ProjectPath + "/excel/gen_code_json.bat";
        let jsonDir = "db://assets/resources/data";
        util.exeCMD(workDir, batPath,
            msg => {
                console.log(msg);
            }, err => {
                console.error(err);
            },
            () => {
                let files = util.getAllFiles(jsonDir, [".json"]);
                files.forEach(v => {
                    Editor.Message.send("asset-db", "refresh-asset", util.toAssetDBUrl(v));
                });
            }
        );
    }

    /** 生成一些常量 */
    static genConst() {
        let map: { [key: string]: string } = {};
        let outFile = util.ProjectPath + "/assets/script/gen/UIConst.ts";
        let ext = ".prefab";
        let path1 = util.ProjectPath + "/assets/bundles";
        let path2 = util.ProjectPath + "/assets/resources";
        let files1 = util.getAllFiles(path1, [ext]);
        let files2 = util.getAllFiles(path2, [ext]);
        files1.forEach(v => {
            let basename = path.basename(v);
            if (basename.startsWith("UI")) {
                let name = basename.replace(ext, "");
                let location = v.replace(path2 + "/", "").replace(ext, "");
                let index = location.indexOf("/");
                if (index > -1) location = location.substring(index + 1);
                map[name] = location;
            }
        });
        files2.forEach(v => {
            let basename = path.basename(v);
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
        
        util.mkDirIfNotExists(path.dirname(outFile));
        fs.writeFileSync(outFile, content);
        Editor.Message.send("asset-db", "refresh-asset", util.toAssetDBUrl(outFile));
    }
}