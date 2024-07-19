import fs from "fs-extra";
import path from "path";
import { Config } from "./tools/Config";
import { Constant } from "./tools/Constant";
import { Utils } from "./tools/Utils";
import { Logger } from "./tools/Logger";

export class CmdExecute {

    static test() {
        console.log("测试");

        // let bundles = Utils.ProjectPath + "/assets/bundles";
        // let dirs = Utils.getAllDirs(bundles, null, true);
        // for (const dir of dirs) {
        //     let tableDir = dir + "/table";
        //     if (fs.existsSync(tableDir)) {
        //         Utils.refreshAsset(tableDir);
        //     }

        // }
    }


    /** 保存游戏配置到本地 */
    static saveGameSetting(jsonStr: string) {
        Config.set("gameSetting", JSON.parse(jsonStr));
    }


    /** 格式化目录结构 */
    static formatProject() {
        //创建目录
        // // fs.ensureDirSync(Utils.ProjectPath + "/assets/build-template");//构建后处理资源目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles");//资源包目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/localization");//资源包目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/localization/sc");//资源包目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/localization/tc");//资源包目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/localization/en");//资源包目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/static");//资源包目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/static/anim");//资源包目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/static/font");//资源包目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/static/uiSprite");//资源包目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/dynamic");//资源包目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/dynamic/audio");//资源包目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/dynamic/table");//资源包目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/dynamic/sprite");//资源包目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/dynamic/prefab");//资源包目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/bundles/dynamic/uiPrefab");//资源包目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/scripts");//脚本目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/scripts/base");//脚本目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/scripts/gen");//脚本目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/scripts/ui");//脚本目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/scenes");//场景目录
        // Utils.refreshAsset(Utils.ProjectPath + "/assets/build-template");
        // Utils.refreshAsset(Utils.ProjectPath + "/assets/bundles");
        // Utils.refreshAsset(Utils.ProjectPath + "/assets/scripts");
        // Utils.refreshAsset(Utils.ProjectPath + "/assets/scenes");
        // //拷贝资源
    }

    /** 导表 */
    static loadExcel() {
        let workDir = Utils.ProjectPath + "/excel";
        let batPath = "gen_code_json.bat";
        let tsDir = Utils.ProjectPath + "/assets/scripts/gen/table";
        fs.ensureDirSync(tsDir);
        Logger.debug(workDir)
        Utils.exeCMD(workDir, batPath,
            msg => {
                Logger.debug(msg);
            }
        ).then(code => {
            if (!code) {
                let bundles = Utils.ProjectPath + "/assets/bundles";
                let dirs = Utils.getAllDirs(bundles, null, true);
                dirs.push(Utils.ProjectPath + "/assets/resources");
                for (const dir of dirs) {
                    let tableDir = dir + "/table";
                    if (fs.existsSync(tableDir)) {
                        Utils.refreshAsset(tableDir);
                    }
                }
                Utils.refreshAsset(tsDir);
            } else {
                Logger.error("导表失败");
            }
        });
    }

    /** 生成一些常量 */
    static genConst() {
        //生成Bundles.json
        {
            let bundlesDir = Utils.ProjectPath + "/assets/bundles";
            let outFile = Utils.ProjectPath + "/assets/scripts/gen/BundleConstant.ts";
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

            let content = `export const BundleConstant = ${JSON.stringify(result)};`
            fs.writeFileSync(outFile, content);
            Utils.refreshAsset(outFile);
            Logger.info("生成BundleConstant.ts成功");
        }

        //生成UIConstant
        {
            let map = {};
            let outFile = Utils.ProjectPath + "/assets/scripts/gen/UIConstant.ts";
            let ext = ".prefab";

            let path1 = Utils.ProjectPath + "/assets/bundles";
            let path2 = Utils.ProjectPath + "/assets/resources";
            let filter = (file: string) => file.endsWith(ext);
            let files = Utils.getAllFiles(path1, filter).concat(Utils.getAllFiles(path2, filter));
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
            Logger.info("生成UIConstant成功");
        }

    }



    static closeTexCompress() {
        let exts = [".jpg", ".png", ".jpeg", ".pac"];
        let filter = (file: string) => {
            let ext = path.extname(file);
            return exts.includes(ext);
        }
        let allFiles = Utils.getAllFiles(Utils.ProjectPath + "/assets", filter);
        for (const file of allFiles) {
            if (path.basename(file).startsWith("__")) continue;
            let metaFile = file + ".meta";
            let obj = fs.readJSONSync(metaFile);
            let compressSettings: { useCompressTexture: boolean, presetId: string } = obj.userData.compressSettings;
            if (compressSettings && compressSettings.useCompressTexture) {
                compressSettings.useCompressTexture = false;
                fs.writeJSONSync(metaFile, obj, { spaces: 2 });
                Utils.refreshAsset(file);
                Logger.info("关闭纹理压缩", file);
            }
        }
    }

    static setTexCompress() {
        let presetId: string = Editor.Clipboard.read("text");
        if (presetId.length != 22) {
            Logger.warn("请先拷贝一个纹理压缩配置的22位UUID到剪切板(项目设置-压缩纹理-配置压缩预设集)")
        } else {
            Logger.info("纹理压缩方案UUID:", presetId);
            let exts = [".jpg", ".png", ".jpeg", ".pac"];
            let filter = (file: string) => {
                let ext = path.extname(file);
                return exts.includes(ext);
            }
            let allFiles = Utils.getAllFiles(Utils.ProjectPath + "/assets", filter);
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
                    Logger.info(`纹理压缩设置  ${file}`);
                }
            }
        }
    }

    static openBuildTemplate() {
        Config.set(Constant.BuildTemplateSaveKey, true);
        Logger.info("自定义构面模板已启用");
    }

    static closeBuildTemplate() {
        Config.set(Constant.BuildTemplateSaveKey, false);
        Logger.info("自定义构面模板已禁用");
    }

    static delInvalidProperty() {
        let propertysDir = Utils.ProjectPath + "/assets/scripts/gen/property"
        let scriptsDir = Utils.ProjectPath + "/assets/scripts";
        let ext = ".ts";
        let files = Utils.getAllFiles(propertysDir, file => file.endsWith(ext));
        let allScripts = Utils.getAllFiles(scriptsDir, file => file.endsWith(ext));
        files.forEach(file => {
            let fileName = path.basename(file);
            let comp = fileName.replace("Property", "");
            let sc = allScripts.find(v => v.endsWith(comp));
            if (!sc) {//无效的Property脚本
                Utils.deleteAsset(file);
                Logger.info("删除脚本", fileName);
            }
        });
        Logger.info("删除无效的属性脚本完成");
    }
}