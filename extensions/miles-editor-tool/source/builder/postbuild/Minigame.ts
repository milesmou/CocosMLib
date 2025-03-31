import fs from "fs-extra";
import path from "path";
import { IBuildResult, IBuildTaskOption } from "../../../@cocos/creator-types/editor/packages/builder/@types";
import { AliOSS } from "../../thirdpart/alioss/AliOSS";
import { Config } from "../../tools/Config";
import { Utils } from "../../tools/Utils";
import { BuildLogger } from "../BuildLogger";


export class Minigame {
    /** 修改小游戏的服务器地址 */
    public static async modifyServer(options: IBuildTaskOption, result: IBuildResult) {
        let server = Config.get("gameSetting.minigameServer", "");
        let files = Utils.getAllFiles(result.dest + "/src", null, true);
        let file = files.find(v => path.basename(v).startsWith("settings."));
        if (file) {
            let settings = fs.readJsonSync(file, { encoding: "utf8" });
            settings.assets.server = server;
            fs.writeJSONSync(file, settings);
            BuildLogger.info("修改小游戏服务器地址为:" + server);
        }
    }

    /** 上传资源到阿里云OSS */
    public static async uploadToAliOss(options: IBuildTaskOption, result: IBuildResult) {
        let localDir = path.join(result.dest, "remote");
        if (!fs.existsSync(localDir)) return;
        let ossDir = Config.get("gameSetting.minigameOSSUploadDir", "");
        let files: string[] = Utils.getAllFiles(localDir);
        let alioss = new AliOSS(localDir, ossDir);
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
            await alioss.upload(options.taskName, files);
        }
    }
}