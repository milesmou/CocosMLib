import { IBuildResult, IBuildTaskOption } from "@cocos/creator-types/editor/packages/builder/@types/public";
import fs from "fs-extra";
import path from "path";
import { Config } from "../../tools/Config";
import { Logger } from "../../tools/Logger";
import { Utils } from "../../tools/Utils";


export class Minigame {
    /** 修改小游戏的服务器地址 */
    public static modifyServer(options: IBuildTaskOption, result: IBuildResult) {
        if (Utils.isMinigame(options.platform)) {//小游戏修改服务器地址
            let server = Config.get("gameSetting.minigameServer", "");
            let files = Utils.getAllFiles(result.dest + "/src", null, true);
            let file = files.find(v => path.basename(v).startsWith("settings."));
            if (file) {
                let settings = fs.readJsonSync(file, { encoding: "utf8" });
                settings.assets.server = server;
                fs.writeJSONSync(file, settings);
                Logger.info("修改小游戏服务器地址为:" + server);
            }
        }
    }
}