"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Minigame = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Config_1 = require("../tools/Config");
const LogToFile_1 = require("../tools/LogToFile");
const Utils_1 = require("../tools/Utils");
class Minigame {
    /** 修改小游戏的服务器地址 */
    static modifyServer(options, result) {
        if (Utils_1.Utils.isMinigame(options.platform)) { //小游戏修改服务器地址
            let server = Config_1.Config.get("gameSetting.minigameServer", "");
            let files = Utils_1.Utils.getAllFiles(result.dest + "/src", null, true);
            let file = files.find(v => path_1.default.basename(v).startsWith("settings."));
            if (file) {
                let settings = fs_extra_1.default.readJsonSync(file, { encoding: "utf8" });
                settings.assets.server = server;
                fs_extra_1.default.writeJSONSync(file, settings);
                LogToFile_1.LogToFile.log("修改小游戏服务器地址为:" + server);
            }
        }
    }
}
exports.Minigame = Minigame;
