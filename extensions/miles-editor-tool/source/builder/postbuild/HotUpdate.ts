
import fs from "fs-extra";
import path from "path";
import { IBuildResult, IBuildTaskOption } from "../../../@cocos/creator-types/editor/packages/builder/@types";
import { AliOSS } from "../../thirdpart/alioss/AliOSS";
import { Config } from "../../tools/Config";
import { Utils } from "../../tools/Utils";
import { BuildLogger } from "../BuildLogger";
import { HotUpdateConfig } from "./HotUpdateConfig";
import { MainJsCode } from "./MainJsCode";
import { VersionGenerator } from "./VersionGenerator";

const tag = "[HotUpdate]";

/** 原生平台检查构建配置和修改main.js */
export class HotUpdate {

    /** 修改main.js脚本 插入添加搜索路径的代码 */
    public static modifyJsFile(options: IBuildTaskOption, result: IBuildResult) {
        let buildPath = Utils.toUniSeparator(result.dest);
        HotUpdateConfig.buildPath = buildPath;
        HotUpdateConfig.buildTaskName = options.taskName;

        let dataDir = path.join(result.dest, 'data');

        if (options.md5Cache) {
            BuildLogger.error(tag, "启用热更时应当关闭MD5缓存");
        }

        //修改main.js 中的搜索路径
        let mainjs = path.join(dataDir, 'main.js');
        if (fs.existsSync(mainjs)) {
            let content = fs.readFileSync(mainjs, { encoding: "utf8" });
            content = MainJsCode.insertCode.replace("%version%", HotUpdateConfig.appVersion) + "\n" + content;
            fs.writeFileSync(mainjs, content, { encoding: "utf8" });
            BuildLogger.info(tag, "修改main.js,追加搜索路径完成 搜索路径Key=" + HotUpdateConfig.appVersion);
        }
    }

    /** 资源打包后使用最新的清单文件替换旧的清单文件 */
    public static replaceManifest(options: IBuildTaskOption, result: IBuildResult) {
        let oldManifest = Utils.ProjectPath + "/assets/resources/project.manifest";
        if (!fs.existsSync(oldManifest)) {
            BuildLogger.error(tag, "assets/resources/project.manifest文件不存在,请导入文件后重新打包,如不需要热更请忽略");
            return;
        }
        let fileUuid = fs.readJSONSync(oldManifest + ".meta")?.uuid;
        let buildPath = HotUpdateConfig.buildPath;
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
                BuildLogger.info(tag, `替换热更资源清单文件成功`, path.basename(oldManifest));
            } else {
                BuildLogger.error(tag, `替换热更资源清单文件失败 未在构建的工程中找到清单文件 dir=${dir}`);
            }
        } else {
            BuildLogger.error(tag, `替换热更资源清单文件失败`);
        }
    }

    /** 生成热更资源 */
    public static genHotUpdateRes() {
        let buildPath = HotUpdateConfig.buildPath;
        let dest = Utils.ProjectPath + "/hotupdate/" + HotUpdateConfig.appVersion + "/" + HotUpdateConfig.patchVersion;
        let data = Utils.toUniSeparator(path.join(buildPath, 'data'));
        try {
            if (this.genManifest(dest, false)) {//生成清单后 拷贝资源
                fs.copySync(data + '/src', dest + "/src");
                fs.copySync(data + '/assets', dest + "/assets");
                fs.copySync(data + '/jsb-adapter', dest + "/jsb-adapter");
                fs.copySync(dest + '/project.manifest', Utils.ProjectPath + "/assets/resources/project.manifest");
                Utils.refreshAsset(Utils.ProjectPath + "/assets/resources/project.manifest");
                BuildLogger.info(`生成热更资源完成 ${dest}`);
            } else {
                BuildLogger.error(`生成热更资源失败`);
            }
        } catch (e) {
            BuildLogger.error(`生成热更资源失败 ${e}`);
        }

    }

    /** 上传热更资源到OSS */
    public static async uploadHotUpdateRes() {
        let dest = Utils.ProjectPath + "/hotupdate/" + HotUpdateConfig.appVersion + "/" + HotUpdateConfig.patchVersion;
        let ossDir = Config.get("gameSetting.hotupdateResOSSUploadDir", "");
        BuildLogger.info(`appVersion=${HotUpdateConfig.appVersion} patchVersion=${HotUpdateConfig.patchVersion}`);
        if (fs.existsSync(dest)) {
            let value = await Editor.Dialog.info(`是否上传文件到OSS?`, {
                title: "上传远程资源",
                detail: ossDir,
                default: 1,
                buttons: ['取消', '确认']
            })
            let upload = value.response != 0;
            if (upload) {
                let alioss = new AliOSS(dest, ossDir);
                let files: string[] = Utils.getAllFiles(dest);
                await alioss.upload(HotUpdateConfig.buildTaskName, files);
            } else {
                BuildLogger.info(`取消上传`);
            }
        } else {
            BuildLogger.error(`热更资源目录不存在 ${dest}`);
        }


    }

    /** 
     * 生成资源清单文件
     * @param normalBuild 是否是正常构建工程,而不是生成热更资源
     */
    private static genManifest(dest: string, normalBuild: boolean) {
        let buildPath = HotUpdateConfig.buildPath;
        let url = HotUpdateConfig.url;
        let patchVersion = HotUpdateConfig.patchVersion;
        if (!url || !patchVersion) {
            BuildLogger.warn(`热更配置不正确,若需要使用热更,请先检查热更配置`);
        }
        if (!buildPath) {
            BuildLogger.info(`请先构建一次Native工程 再生成热更资源`);
            return false;
        }
        let data = Utils.toUniSeparator(path.join(buildPath, 'data'));
        if (!normalBuild) {
            BuildLogger.info(`url=${url}`);
            BuildLogger.info(`appVersion=${HotUpdateConfig.appVersion} patchVersion=${patchVersion}`)
            BuildLogger.info(`data=${data}`);
            BuildLogger.info(`dest=${dest}`);
        }
        try {
            VersionGenerator.gen(url, patchVersion, data, dest);
        } catch (e) {
            BuildLogger.error(e);
            return false;
        }
        return true;
    }


}