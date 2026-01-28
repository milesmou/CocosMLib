import fs from "fs-extra";
import path from "path";
import { IBuildResult, IBuildTaskOption } from "../../../@cocos/creator-types/editor/packages/builder/@types";
import { AliOSS } from "../../thirdpart/alioss/AliOSS";
import { Config } from "../../tools/Config";
import { Utils } from "../../tools/Utils";
import { BuildLogger } from "../BuildLogger";


export class GameTool {

    /** 修改远程资源的服务器地址 */
    public static async modifyRemoteResServer(options: IBuildTaskOption, result: IBuildResult) {
        let server = Config.get("gameSetting.remoteResServer", "");
        let file = Utils.resolveFilePath(result.dest + "/src/settings.json");
        if (Utils.isNative(options.platform)) file = Utils.resolveFilePath(result.dest + "/data/src/settings.json");
        if (file) {
            let settings = fs.readJsonSync(file, { encoding: "utf8" });
            settings.assets.server = server;
            fs.writeJSONSync(file, settings);
            BuildLogger.info("修改远程资源服务器地址为:" + server);
        }
    }

    /** 上传小游戏资源到阿里云OSS */
    public static async uploadRemoteResToAliOss(options: IBuildTaskOption, result: IBuildResult) {
        let localDir = path.join(result.dest, "remote");
        if (Utils.isNative(options.platform)) localDir = path.join(result.dest, "data", "remote");
        if (!fs.existsSync(localDir)) return;
        let ossDir = Config.get("gameSetting.remoteResOSSUploadDir", "");
        let files: string[] = Utils.getAllFiles(localDir);

        let upload = false;
        if (options['remote-auto-upload']) {//命令行构建时 自动上传
            upload = true;
        } else {//手动选择是否上传
            let value = await Editor.Dialog.info(`是否上传文件到OSS?`, {
                title: "上传远程资源",
                detail: ossDir,
                default: 1,
                buttons: ['取消', '确认']
            })
            upload = value.response != 0;
        }
        if (upload) {
            let alioss = new AliOSS(localDir, ossDir);
            await alioss.upload(options.taskName, files);
            fs.removeSync(localDir);
        }
    }

    /** 小游戏平台删除resources目录下的project.manifest文件 */
    public static minigameDeleteManifest(options: IBuildTaskOption, result: IBuildResult) {
        let oldManifest = Utils.ProjectPath + "/assets/resources/project.manifest";
        if (!fs.existsSync(oldManifest)) return;
        let fileUuid = fs.readJSONSync(oldManifest + ".meta")?.uuid;
        let dir = options.buildPath + '/assets/resources';
        oldManifest = Utils.getAllFiles(dir, file => {
            let basename = path.basename(file);
            return basename.startsWith(fileUuid) && basename.endsWith(".manifest");
        })[0];
        if (oldManifest) {
            fs.removeSync(oldManifest);
            BuildLogger.info(`删除原生平台热更资源清单文件`, path.basename(oldManifest));
        }
    }
}