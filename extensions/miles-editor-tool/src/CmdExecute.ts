import fs from "fs-extra";
import path from "path";
import { MLogger } from "./tools/MLogger";
import { Utils } from "./tools/Utils";

export class CmdExecute {

    /** 格式化目录结构 */
    static formatProject() {
        //创建目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/build-template");//构建后处理资源目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/bundles");//资源包目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/bundles/localization");//资源包目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/bundles/localization/sc");//资源包目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/bundles/localization/tc");//资源包目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/bundles/localization/en");//资源包目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/bundles/static");//资源包目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/bundles/static/anim");//资源包目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/bundles/static/font");//资源包目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/bundles/static/uiSprite");//资源包目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/bundles/dynamic");//资源包目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/bundles/dynamic/audio");//资源包目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/bundles/dynamic/table");//资源包目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/bundles/dynamic/sprite");//资源包目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/bundles/dynamic/prefab");//资源包目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/bundles/dynamic/uiPrefab");//资源包目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/scripts");//脚本目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/scripts/base");//脚本目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/scripts/gen");//脚本目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/scripts/ui");//脚本目录
        fs.emptyDirSync(Utils.ProjectPath + "/assets/scenes");//场景目录
        //拷贝资源
    }

    /** 导表 */
    static loadExcel() {
        let logger = new MLogger("LoadExcel");
        let workDir = Utils.ProjectPath + "/excel";
        let batPath = "gen_code_json.bat";
        let jsonDir = "db://assets/bundles/dynamic/table";
        let tsDir = "db://assets/scripts/gen/table";
        fs.emptyDirSync(jsonDir);
        fs.emptyDirSync(tsDir);
        logger.debug(workDir)
        Utils.exeCMD(workDir, batPath,
            msg => {
                logger.debug(msg);
            }
        ).then(code => {
            if (!code) {
                let files = Utils.getAllFiles(jsonDir, [".json"]);
                files.forEach(v => {
                    Utils.refreshAsset(v);
                });
                let tsFiles = Utils.getAllFiles(tsDir, [".ts"]);
                tsFiles.forEach(v => {
                    Utils.refreshAsset(v);
                });
            } else {
                logger.error("导表失败");
            }
        });
    }

    /** 生成一些常量 */
    static genConst() {
        let map = {};
        let outFile = Utils.ProjectPath + "/assets/scripts/gen/UIConstant.ts";
        let ext = ".prefab";

        let path1 = Utils.ProjectPath + "/assets/bundles";
        let path2 = Utils.ProjectPath + "/assets/resources";
        let files = Utils.getAllFiles(path1, [ext]).concat(Utils.getAllFiles(path2, [ext]));
        files.forEach(v => {
            let basename = path.basename(v);
            if (v.indexOf("/uiPrefab/") > 0) {
                let name = basename.replace(ext, "");
                let location = "";
                if (v.startsWith(path1)) {
                    location = v.replace(path1 + "/", "");
                    location = location.substring(location.indexOf("/") + 1);
                } else if (v.startsWith(path2)) {
                    location = v.replace(path2 + "/", "");
                }
                location = location.replace(ext, "");
                map[name] = location;
            }
        });

        let content = "export const UIConstant = {\n";
        for (const key in map) {
            content += `    "${key}": "${map[key]}",\n`;
        }
        content += "}";

        fs.ensureDirSync(path.dirname(outFile));
        fs.writeFileSync(outFile, content);
        Utils.refreshAsset(outFile);

        MLogger.print("生成UIConstant成功");
    }


    static autoGenProperty() {

        let nodeUuid = "";
        let type = Editor.Selection.getLastSelectedType();
        if (type == "node") {
            nodeUuid = Editor.Selection.getLastSelected(type);
        }
        MLogger.debug("getLastSelected", nodeUuid);
        Editor.Message.send("miles-scene-tool", "autoGenProperty", nodeUuid);
        MLogger.debug("Editor.Message.send", nodeUuid);
    }

}