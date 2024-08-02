
import { IBuildResult, IBuildTaskOption } from "@cocos/creator-types/editor/packages/builder/@types/public";
import fs from "fs-extra";
import path from "path";
import { Config } from "../../tools/Config";
import { Logger } from "../../tools/Logger";
import { Utils } from "../../tools/Utils";
import { MainJsCode } from "./MainJsCode";
import { VersionGenerator } from "./VersionGenerator";

/** 原生平台检查构建配置和修改main.js */
export class HotUpdate {

    /** 修改main.js 和 src目录中的脚本 */
    public static modifyJsFile(options: IBuildTaskOption, result: IBuildResult) {
        let buildPath = Utils.toUniSeparator(result.dest);
        Config.set("hotupdate.buildPath", buildPath);

        let dataDir = path.join(result.dest, 'data');

        let srcDir = path.join(dataDir, 'src');

        if (options.md5Cache) {
            let files = Utils.getAllFiles(srcDir, null, true);
            files = files.concat(Utils.getAllFiles(dataDir, null, true));
            let newFiles: string[] = [];
            //修改src目录下文件的文件名 去除md5
            let fileNameMap: Map<string, string> = new Map();
            files.forEach(file => {
                let newFile = Utils.restoreFilePath(file);
                let fileName = path.basename(file);
                let newFileName = path.basename(newFile);
                fileNameMap.set(fileName, newFileName);
                fs.renameSync(file, newFile);
                Logger.info("去除文件名的MD5", file)
                newFiles.push(newFile);
            });

            //修改src目录下文件 修改文件中带md5的引用
            newFiles.forEach(file => {
                let content = fs.readFileSync(file, { encoding: "utf8" });
                fileNameMap.forEach((v, k) => {
                    let regex = new RegExp(k, "g");
                    content = content.replace(regex, v);
                });
                fs.writeFileSync(file, content, { encoding: "utf8" });
            });
        } else {
            Logger.error("启用热更时应当开启MD5缓存")
        }

        //修改main.js 中的搜索路径
        let mainjs = path.join(dataDir, 'main.js');
        if (fs.existsSync(mainjs)) {
            let version = Config.get("gameSetting.mainVersion", "");
            if (version) {
                let content = fs.readFileSync(mainjs, { encoding: "utf8" });
                content = MainJsCode.code.replace("<%version%>", version) + "\n" + content;
                fs.writeFileSync(mainjs, content, { encoding: "utf8" });
                Logger.info("修改热更搜索路径完成", version);
            } else {
                Logger.info("若使用热更请先保存热更配置");
            }
        }
    }

    /** 资源打包后使用最新的清单文件替换旧的清单文件 */
    public static replaceManifest(options: IBuildTaskOption, result: IBuildResult) {
        let oldManifest = Utils.ProjectPath + "/assets/resources/project.manifest";
        if (!fs.existsSync(oldManifest)) {
            Logger.warn("assets/resources/project.manifest文件不存在,请导入文件后重新打包,如不需要热更请忽略");
            return;
        }
        let fileUuid = fs.readJSONSync(oldManifest + ".meta")?.uuid;
        let buildPath = Config.get("hotupdate.buildPath", "");
        let dest = Utils.ProjectPath + "/temp/manifest";
        fs.ensureDirSync(dest);
        if (this.genManifest(dest, true)) {
            let newManifest = dest + '/project.manifest';
            let dir = buildPath + '/data/assets/resources';
            let oldManifest = Utils.getAllFiles(dir, file => {
                let basename = path.basename(file);
                return basename.startsWith(fileUuid) && basename.endsWith(".manifest");
            })[0];
            if (oldManifest) {
                fs.copyFileSync(newManifest, oldManifest);
                Logger.info(`替换热更资源清单文件成功`, path.basename(oldManifest));
            } else {
                Logger.error(`替换热更资源清单文件失败 未在构建的工程中找到清单文件`);
            }
        } else {
            Logger.error(`替换热更资源清单文件失败`);
        }
    }

    /** 生成热更资源 */
    public static genHotUpdateRes() {
        let buildPath = Config.get("hotupdate.buildPath", "");
        let url = Config.get("gameSetting.hotupdateServer", "");
        let version = Config.get("gameSetting.version", "");
        let dest = Utils.ProjectPath + "/hotupdate/" + version;
        let data = Utils.toUniSeparator(path.join(buildPath, 'data'));
        try {
            if (this.genManifest(dest, false)) {//生成清单后 拷贝资源
                fs.copySync(data + '/src', dest + "/src");
                fs.copySync(data + '/assets', dest + "/assets");
                fs.copySync(data + '/jsb-adapter', dest + "/jsb-adapter");
                fs.copySync(dest + '/project.manifest', Utils.ProjectPath + "/assets/resources/project.manifest");
                Utils.refreshAsset(Utils.ProjectPath + "/assets/resources/project.manifest");
                Logger.info(`生成热更资源完成 ${dest}`);
            } else {
                Logger.error(`生成热更资源失败`);
            }
        } catch (e) {
            Logger.error(`生成热更资源失败 ${e}`);
        }

    }

    /** 
     * 生成资源清单文件
     * @param normalBuild 是否是正常构建工程,而不是生成热更资源
     */
    private static genManifest(dest: string, normalBuild: boolean) {
        let buildPath = Config.get("hotupdate.buildPath", "");
        let url = Config.get("gameSetting.hotupdateServer", "");
        let version = Config.get("gameSetting.version", "");
        if (!url || !version) {
            Logger.warn(`热更配置不正确,若需要使用热更,请先检查热更配置`);
        }
        if (!buildPath) {
            Logger.info(`请先构建一次Native工程 再生成热更资源`);
            return false;
        }
        let data = Utils.toUniSeparator(path.join(buildPath, 'data'));
        if (!normalBuild) {
            Logger.info(`url=${url}`)
            Logger.info(`version=${version}`)
            Logger.info(`data=${data}`)
            Logger.info(`dest=${dest}`)
        }
        try {
            VersionGenerator.gen(url, version, data, dest, normalBuild);
        } catch (e) {
            Logger.error(e);
            return false;
        }
        return true;
    }


}