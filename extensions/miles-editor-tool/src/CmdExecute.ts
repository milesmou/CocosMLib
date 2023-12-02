import fs from "fs-extra";
import path from "path";
import { ExecuteSceneScriptMethodOptions } from "../@types/packages/scene/@types/public";
import { MLogger } from "./tools/MLogger";
import { Utils } from "./tools/Utils";
import { Config } from "./tools/Config";
import { Constant } from "./tools/Constant";

export class CmdExecute {

    /** 格式化目录结构 */
    static formatProject() {
        //创建目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/build-template");//构建后处理资源目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles");//资源包目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/localization");//资源包目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/localization/sc");//资源包目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/localization/tc");//资源包目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/localization/en");//资源包目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/static");//资源包目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/static/anim");//资源包目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/static/font");//资源包目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/static/uiSprite");//资源包目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/dynamic");//资源包目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/dynamic/audio");//资源包目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/dynamic/table");//资源包目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/dynamic/sprite");//资源包目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/dynamic/prefab");//资源包目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/dynamic/uiPrefab");//资源包目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/scripts");//脚本目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/scripts/base");//脚本目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/scripts/gen");//脚本目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/scripts/ui");//脚本目录
        fs.ensureDirSync(Utils.ProjectPath + "/assets/scenes");//场景目录
        Utils.refreshAsset(Utils.ProjectPath + "/assets/build-template");
        Utils.refreshAsset(Utils.ProjectPath + "/assets/bundles");
        Utils.refreshAsset(Utils.ProjectPath + "/assets/scripts");
        Utils.refreshAsset(Utils.ProjectPath + "/assets/scenes");
        //拷贝资源
    }

    /** 导表 */
    static loadExcel() {
        let logger = new MLogger("LoadExcel");
        let workDir = Utils.ProjectPath + "/excel";
        let batPath = "gen_code_json.bat";
        let jsonDir = Utils.ProjectPath + "/assets/bundles/dynamic/table";
        let tsDir = Utils.ProjectPath + "/assets/scripts/gen/table";
        fs.ensureDirSync(jsonDir);
        fs.ensureDirSync(tsDir);
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
        //生成Bundles.json
        {
            let bundlesDir = Utils.ProjectPath + "/assets/bundles";
            let outFile = Utils.ProjectPath + "/assets/resources/Bundles.json";
            let result: string[] = [];

            let list = fs.readdirSync(bundlesDir);

            for (const name of list) {
                let path = bundlesDir + "/" + name;
                if (fs.statSync(path).isDirectory()) {
                    let obj = fs.readJSONSync(path + ".meta");
                    if (obj['userData'] && obj['userData']['isBundle']) {
                        result.push(name);
                    }
                }
            }
            fs.writeJSONSync(outFile, result);
            Utils.refreshAsset(outFile);
            MLogger.print("生成Bundles.json成功");
        }

        //生成UIConstant
        {
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

    }

    static async autoGenProperty() {
        let nodeUuid = "";
        let type = Editor.Selection.getLastSelectedType();
        if (type == "node") {
            nodeUuid = Editor.Selection.getLastSelected(type);
        }

        const options: ExecuteSceneScriptMethodOptions = {
            name: "miles-scene-tool",
            method: 'autoGenProperty',
            args: [nodeUuid],
        };

        MLogger.info("SelectNodeUUID", nodeUuid);
        Editor.Message.request('scene', 'execute-scene-script', options);
    }

    static closeTexCompress() {
        let allFiles = Utils.getAllFiles(Utils.ProjectPath + "/assets", [".jpg", ".png", ".jpeg", ".pac"]);
        for (const file of allFiles) {
            if (path.basename(file).startsWith("__")) continue;
            let metaFile = file + ".meta";
            let obj = fs.readJSONSync(metaFile);
            let compressSettings: { useCompressTexture: boolean, presetId: string } = obj.userData.compressSettings;
            if (compressSettings && compressSettings.useCompressTexture) {
                compressSettings.useCompressTexture = false;
                fs.writeJSONSync(metaFile, obj, { spaces: 2 });
                Utils.refreshAsset(file);
                MLogger.info("关闭纹理压缩", file);
            }
        }
    }

    static setTexCompress() {
        let presetId: string = Editor.Clipboard.read("text");
        if (presetId.length != 22) {
            MLogger.warn("请先拷贝一个纹理压缩配置的22位UUID到剪切板(项目设置-压缩纹理-配置压缩预设集)")
        } else {
            MLogger.info("纹理压缩方案UUID:", presetId);
            let allFiles = Utils.getAllFiles(Utils.ProjectPath + "/assets", [".jpg", ".png", ".jpeg", ".pac"]);
            for (const file of allFiles) {
                if (path.basename(file).startsWith("__")) continue;
                let metaFile = file + ".meta";
                let obj = fs.readJSONSync(metaFile);

                let compressSettings: { useCompressTexture: boolean, presetId: string } = obj.userData.compressSettings;
                if (!compressSettings || !compressSettings.useCompressTexture || compressSettings.presetId != presetId) {
                    let newCompressSettings: { useCompressTexture: boolean, presetId: string } = {
                        useCompressTexture: true,
                        presetId: presetId
                    }
                    obj.userData.compressSettings = newCompressSettings;
                    fs.writeJSONSync(metaFile, obj, { spaces: 2 });
                    Utils.refreshAsset(file);
                    MLogger.info(`纹理压缩设置  ${file}`);
                }
            }
        }
    }

    static openBuildTemplate() {
        Config.set(Constant.BuildTemplateSaveKey, true);
        MLogger.info("自定义构面模板已启用");
    }

    static closeBuildTemplate() {
        Config.set(Constant.BuildTemplateSaveKey, false);
        MLogger.info("自定义构面模板已禁用");
    }

    static saveHotUpdateConfig() {
        let nodeUuid = "";
        let type = Editor.Selection.getLastSelectedType();
        if (type == "node") {
            nodeUuid = Editor.Selection.getLastSelected(type);
        }

        const options: ExecuteSceneScriptMethodOptions = {
            name: "miles-scene-tool",
            method: 'saveHotUpdateConfig',
            args: [nodeUuid],
        };

        MLogger.info("SelectNodeUUID", nodeUuid);
        Editor.Message.request('scene', 'execute-scene-script', options);
    }

    static genHotUpdateRes() {

    }

}