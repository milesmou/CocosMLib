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

        util.mkDirIfNotExists(path.dirname(outFile));
        fs.writeFileSync(outFile, content);
        Editor.Message.send("asset-db", "refresh-asset", util.toAssetDBUrl(outFile));
    }

    static autoBind(scriptName: string, start: string, end: string, strs: string[]) {

        let save = false;
        let filePath = util.getAllFiles(util.ProjectPath, [scriptName + ".ts"])[0];
        let content: string = fs.readFileSync(filePath).toString();
        let lines = content.split(util.returnSymbol);

        let classTag = `class ${scriptName}`;
        let classIndex = -1, genStartIndex = -1, genEndIndex = -1;
        for (let index = 0; index < lines.length; index++) {
            const line = lines[index].trim();
            if (line.indexOf(classTag)>-1) classIndex = index;
            else if (line == start.trim()) genStartIndex = index;
            else if (line == end.trim()) genEndIndex = index;
        }

        // console.log("????? ", classIndex, " - ", genStartIndex, " - ", genEndIndex);

        if (genStartIndex == -1) {//直接生成
            lines.splice(classIndex + 1, 0, start, ...strs, end);
            save = true;
        } else {
            if (genEndIndex - genStartIndex - 1 != strs.length) {
                lines.splice(genStartIndex, genEndIndex - genStartIndex + 1, start, ...strs, end);
                save = true;
            } else {
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
            fs.writeFileSync(filePath, lines.join(util.returnSymbol));
            console.log("自动绑定成功");
        }
    }

    static refreshPrefab(){
        let v = Editor.Selection.getSelected("node")[0];
        console.log(v);
        // Editor.Message.send("asset-db", "refresh-asset", v);
        let res = Editor.Message.send("scene", "query-node");
        console.log(res);
        
        // for (const iterator of paths) {
        //     console.log(iterator.name,"--",iterator.path);
            
        // }
        
    }
}