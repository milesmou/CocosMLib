"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmdExecute = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const MLogger_1 = require("./tools/MLogger");
const Utils_1 = require("./tools/Utils");
const Config_1 = require("./tools/Config");
const Constant_1 = require("./tools/Constant");
class CmdExecute {
    /** 格式化目录结构 */
    static formatProject() {
        //创建目录
        // fs.ensureDirSync(Utils.ProjectPath + "/assets/build-template");//构建后处理资源目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/bundles"); //资源包目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/bundles/localization"); //资源包目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/bundles/localization/sc"); //资源包目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/bundles/localization/tc"); //资源包目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/bundles/localization/en"); //资源包目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/bundles/static"); //资源包目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/bundles/static/anim"); //资源包目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/bundles/static/font"); //资源包目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/bundles/static/uiSprite"); //资源包目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/bundles/dynamic"); //资源包目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/bundles/dynamic/audio"); //资源包目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/bundles/dynamic/table"); //资源包目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/bundles/dynamic/sprite"); //资源包目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/bundles/dynamic/prefab"); //资源包目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/bundles/dynamic/uiPrefab"); //资源包目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/scripts"); //脚本目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/scripts/base"); //脚本目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/scripts/gen"); //脚本目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/scripts/ui"); //脚本目录
        fs_extra_1.default.ensureDirSync(Utils_1.Utils.ProjectPath + "/assets/scenes"); //场景目录
        Utils_1.Utils.refreshAsset(Utils_1.Utils.ProjectPath + "/assets/build-template");
        Utils_1.Utils.refreshAsset(Utils_1.Utils.ProjectPath + "/assets/bundles");
        Utils_1.Utils.refreshAsset(Utils_1.Utils.ProjectPath + "/assets/scripts");
        Utils_1.Utils.refreshAsset(Utils_1.Utils.ProjectPath + "/assets/scenes");
        //拷贝资源
    }
    /** 导表 */
    static loadExcel() {
        let logger = new MLogger_1.MLogger("LoadExcel");
        let workDir = Utils_1.Utils.ProjectPath + "/excel";
        let batPath = "gen_code_json.bat";
        let jsonDir = Utils_1.Utils.ProjectPath + "/assets/bundles/dynamic/table";
        let tsDir = Utils_1.Utils.ProjectPath + "/assets/scripts/gen/table";
        fs_extra_1.default.ensureDirSync(jsonDir);
        fs_extra_1.default.ensureDirSync(tsDir);
        logger.debug(workDir);
        Utils_1.Utils.exeCMD(workDir, batPath, msg => {
            logger.debug(msg);
        }).then(code => {
            if (!code) {
                let files = Utils_1.Utils.getAllFiles(jsonDir, [".json"]);
                files.forEach(v => {
                    Utils_1.Utils.refreshAsset(v);
                });
                let tsFiles = Utils_1.Utils.getAllFiles(tsDir, [".ts"]);
                tsFiles.forEach(v => {
                    Utils_1.Utils.refreshAsset(v);
                });
            }
            else {
                logger.error("导表失败");
            }
        });
    }
    /** 生成一些常量 */
    static genConst() {
        //生成Bundles.json
        {
            let bundlesDir = Utils_1.Utils.ProjectPath + "/assets/bundles";
            let outFile = Utils_1.Utils.ProjectPath + "/assets/resources/Bundles.json";
            let result = [];
            let list = fs_extra_1.default.readdirSync(bundlesDir);
            for (const name of list) {
                let path = bundlesDir + "/" + name;
                if (fs_extra_1.default.statSync(path).isDirectory()) {
                    let obj = fs_extra_1.default.readJSONSync(path + ".meta");
                    if (obj['userData'] && obj['userData']['isBundle']) {
                        result.push(name);
                    }
                }
            }
            fs_extra_1.default.writeJSONSync(outFile, result);
            Utils_1.Utils.refreshAsset(outFile);
            MLogger_1.MLogger.print("生成Bundles.json成功");
        }
        //生成UIConstant
        {
            let map = {};
            let outFile = Utils_1.Utils.ProjectPath + "/assets/scripts/gen/UIConstant.ts";
            let ext = ".prefab";
            let path1 = Utils_1.Utils.ProjectPath + "/assets/bundles";
            let path2 = Utils_1.Utils.ProjectPath + "/assets/resources";
            let files = Utils_1.Utils.getAllFiles(path1, [ext]).concat(Utils_1.Utils.getAllFiles(path2, [ext]));
            files.forEach(v => {
                let basename = path_1.default.basename(v);
                if (v.indexOf("/uiPrefab/") > 0) {
                    let name = basename.replace(ext, "");
                    let location = "";
                    if (v.startsWith(path1)) {
                        location = v.replace(path1 + "/", "");
                        location = location.substring(location.indexOf("/") + 1);
                    }
                    else if (v.startsWith(path2)) {
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
            fs_extra_1.default.ensureDirSync(path_1.default.dirname(outFile));
            fs_extra_1.default.writeFileSync(outFile, content);
            Utils_1.Utils.refreshAsset(outFile);
            MLogger_1.MLogger.print("生成UIConstant成功");
        }
    }
    static async autoGenProperty() {
        let nodeUuid = "";
        let type = Editor.Selection.getLastSelectedType();
        if (type == "node") {
            nodeUuid = Editor.Selection.getLastSelected(type);
        }
        const options = {
            name: "miles-scene-tool",
            method: 'autoGenProperty',
            args: [nodeUuid],
        };
        MLogger_1.MLogger.info("SelectNodeUUID", nodeUuid);
        Editor.Message.request('scene', 'execute-scene-script', options);
    }
    static async replaceComponent() {
        const options = {
            name: "miles-scene-tool",
            method: 'replaceComponent',
            args: [],
        };
        Editor.Message.request('scene', 'execute-scene-script', options);
    }
    static closeTexCompress() {
        let allFiles = Utils_1.Utils.getAllFiles(Utils_1.Utils.ProjectPath + "/assets", [".jpg", ".png", ".jpeg", ".pac"]);
        for (const file of allFiles) {
            if (path_1.default.basename(file).startsWith("__"))
                continue;
            let metaFile = file + ".meta";
            let obj = fs_extra_1.default.readJSONSync(metaFile);
            let compressSettings = obj.userData.compressSettings;
            if (compressSettings && compressSettings.useCompressTexture) {
                compressSettings.useCompressTexture = false;
                fs_extra_1.default.writeJSONSync(metaFile, obj, { spaces: 2 });
                Utils_1.Utils.refreshAsset(file);
                MLogger_1.MLogger.info("关闭纹理压缩", file);
            }
        }
    }
    static setTexCompress() {
        let presetId = Editor.Clipboard.read("text");
        if (presetId.length != 22) {
            MLogger_1.MLogger.warn("请先拷贝一个纹理压缩配置的22位UUID到剪切板(项目设置-压缩纹理-配置压缩预设集)");
        }
        else {
            MLogger_1.MLogger.info("纹理压缩方案UUID:", presetId);
            let allFiles = Utils_1.Utils.getAllFiles(Utils_1.Utils.ProjectPath + "/assets", [".jpg", ".png", ".jpeg", ".pac"]);
            for (const file of allFiles) {
                if (path_1.default.basename(file).startsWith("__"))
                    continue;
                let metaFile = file + ".meta";
                let obj = fs_extra_1.default.readJSONSync(metaFile);
                let compressSettings = obj.userData.compressSettings;
                if (!compressSettings || !compressSettings.useCompressTexture || compressSettings.presetId != presetId) {
                    let newCompressSettings = {
                        useCompressTexture: true,
                        presetId: presetId
                    };
                    obj.userData.compressSettings = newCompressSettings;
                    fs_extra_1.default.writeJSONSync(metaFile, obj, { spaces: 2 });
                    Utils_1.Utils.refreshAsset(file);
                    MLogger_1.MLogger.info(`纹理压缩设置  ${file}`);
                }
            }
        }
    }
    static openBuildTemplate() {
        Config_1.Config.set(Constant_1.Constant.BuildTemplateSaveKey, true);
        MLogger_1.MLogger.info("自定义构面模板已启用");
    }
    static closeBuildTemplate() {
        Config_1.Config.set(Constant_1.Constant.BuildTemplateSaveKey, false);
        MLogger_1.MLogger.info("自定义构面模板已禁用");
    }
    static saveHotUpdateConfig() {
        let nodeUuid = "";
        let type = Editor.Selection.getLastSelectedType();
        if (type == "node") {
            nodeUuid = Editor.Selection.getLastSelected(type);
        }
        const options = {
            name: "miles-scene-tool",
            method: 'saveHotUpdateConfig',
            args: [nodeUuid],
        };
        MLogger_1.MLogger.info("SelectNodeUUID", nodeUuid);
        Editor.Message.request('scene', 'execute-scene-script', options);
    }
}
exports.CmdExecute = CmdExecute;
