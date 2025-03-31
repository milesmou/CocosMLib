import fs from "fs-extra";
import path from "path";
import { Config } from "./tools/Config";
import { Logger } from "./tools/Logger";
import { Utils } from "./tools/Utils";

export class CmdExecute {

    /** 功能测试 */
    public static async test(...args: any[]) {
        // console.log("test",args.join(" "));
        let v = await Editor.Dialog.info(`是否上传文件到OSS?`, {
            title: "上传远程资源",
            detail: "[上传远程资源]",
            default: 2,
            buttons: ['取消', '取消1', '确认',]
        })
        console.log(v);
    }


    /** 保存游戏配置到本地 */
    public static saveGameSetting(jsonStr: string) {
        Config.set("gameSetting", JSON.parse(jsonStr));
    }

    /** 导表 */
    public static loadExcel() {
        let workDir = Utils.ProjectPath + "/excel";
        let batPath = "gen_code.bat";
        let tsDir = Utils.ProjectPath + "/assets/scripts/gen/table";
        fs.ensureDirSync(tsDir);
        Logger.info(workDir)
        Utils.exeCMD(workDir, batPath,
            msg => {
                Logger.info(msg);
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
    public static genConst() {
        //生成Bundles.ts
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
                content += `    ${key}: "${map[key]}",\n`;
            }
            content += "} as const;";

            fs.ensureDirSync(path.dirname(outFile));
            fs.writeFileSync(outFile, content);
            Utils.refreshAsset(outFile);
            Logger.info("生成UIConstant成功");
        }

    }

    public static closeTexCompress() {
        Logger.info("关闭纹理压缩开始");
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
        Logger.info("关闭纹理压缩结束");
    }

    public static setTexCompress() {
        let presetId: string = Editor.Clipboard.read("text") as string;
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
            Logger.info("设置纹理压缩结束");
        }
    }

    //切换配置开关
    public static setSwitch(key: string, desc: string) {
        let value = !Config.get(key, false);
        Config.set(key, value)
        console.log(`${desc || key}: ${value ? "开" : "关"}`);
    }


}