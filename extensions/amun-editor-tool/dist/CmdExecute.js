"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmdExecute = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Config_1 = require("./tools/Config");
const Constant_1 = require("./tools/Constant");
const Logger_1 = require("./tools/Logger");
const Utils_1 = require("./tools/Utils");
class CmdExecute {
    /** 功能测试 */
    static test() {
        console.log("测试");
        let dir = path_1.default.dirname(Constant_1.Constant.LogFilePath);
        let basename = path_1.default.basename(Constant_1.Constant.LogFilePath);
        Logger_1.Logger.debug(dir);
        Logger_1.Logger.debug(basename);
        Utils_1.Utils.exeCMD(dir, basename);
    }
    /** 保存游戏配置到本地 */
    static saveGameSetting(jsonStr) {
        Config_1.Config.set("gameSetting", JSON.parse(jsonStr));
    }
    /** 导表 */
    static loadExcel() {
        let workDir = Utils_1.Utils.ProjectPath + "/excel";
        let batPath = "gen_code_json.bat";
        let tsDir = Utils_1.Utils.ProjectPath + "/assets/scripts/gen/table";
        fs_extra_1.default.ensureDirSync(tsDir);
        Logger_1.Logger.debug(workDir);
        Utils_1.Utils.exeCMD(workDir, batPath, msg => {
            Logger_1.Logger.debug(msg);
        }).then(code => {
            if (!code) {
                let bundles = Utils_1.Utils.ProjectPath + "/assets/bundles";
                let dirs = Utils_1.Utils.getAllDirs(bundles, null, true);
                dirs.push(Utils_1.Utils.ProjectPath + "/assets/resources");
                for (const dir of dirs) {
                    let tableDir = dir + "/table";
                    if (fs_extra_1.default.existsSync(tableDir)) {
                        Utils_1.Utils.refreshAsset(tableDir);
                    }
                }
                Utils_1.Utils.refreshAsset(tsDir);
            }
            else {
                Logger_1.Logger.error("导表失败");
            }
        });
    }
    /** 生成一些常量 */
    static genConst() {
        //生成Bundles.json
        {
            let bundlesDir = Utils_1.Utils.ProjectPath + "/assets/bundles";
            let outFile = Utils_1.Utils.ProjectPath + "/assets/scripts/gen/BundleConstant.ts";
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
            let content = `export const BundleConstant = ${JSON.stringify(result)};`;
            fs_extra_1.default.writeFileSync(outFile, content);
            Utils_1.Utils.refreshAsset(outFile);
            Logger_1.Logger.info("生成BundleConstant.ts成功");
        }
        //生成UIConstant
        {
            let map = {};
            let outFile = Utils_1.Utils.ProjectPath + "/assets/scripts/gen/UIConstant.ts";
            let ext = ".prefab";
            let path1 = Utils_1.Utils.ProjectPath + "/assets/bundles";
            let path2 = Utils_1.Utils.ProjectPath + "/assets/resources";
            let filter = (file) => file.endsWith(ext);
            let files = Utils_1.Utils.getAllFiles(path1, filter).concat(Utils_1.Utils.getAllFiles(path2, filter));
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
            Logger_1.Logger.info("生成UIConstant成功");
        }
    }
    static closeTexCompress() {
        let exts = [".jpg", ".png", ".jpeg", ".pac"];
        let filter = (file) => {
            let ext = path_1.default.extname(file);
            return exts.includes(ext);
        };
        let allFiles = Utils_1.Utils.getAllFiles(Utils_1.Utils.ProjectPath + "/assets", filter);
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
                Logger_1.Logger.info("关闭纹理压缩", file);
            }
        }
    }
    static setTexCompress() {
        let presetId = Editor.Clipboard.read("text");
        if (presetId.length != 22) {
            Logger_1.Logger.warn("请先拷贝一个纹理压缩配置的22位UUID到剪切板(项目设置-压缩纹理-配置压缩预设集)");
        }
        else {
            Logger_1.Logger.info("纹理压缩方案UUID:", presetId);
            let exts = [".jpg", ".png", ".jpeg", ".pac"];
            let filter = (file) => {
                let ext = path_1.default.extname(file);
                return exts.includes(ext);
            };
            let allFiles = Utils_1.Utils.getAllFiles(Utils_1.Utils.ProjectPath + "/assets", filter);
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
                    Logger_1.Logger.info(`纹理压缩设置  ${file}`);
                }
            }
        }
    }
    static openLogFile() {
        if (fs_extra_1.default.existsSync(Constant_1.Constant.LogFilePath)) {
            let dir = path_1.default.dirname(Constant_1.Constant.LogFilePath);
            let basename = path_1.default.basename(Constant_1.Constant.LogFilePath);
            Utils_1.Utils.exeCMD(dir, basename);
        }
        else {
            console.log("暂无日志");
        }
    }
}
exports.CmdExecute = CmdExecute;
