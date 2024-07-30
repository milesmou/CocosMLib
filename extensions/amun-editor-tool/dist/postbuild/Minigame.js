"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Minigame = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Config_1 = require("../tools/Config");
const Utils_1 = require("../tools/Utils");
const Logger_1 = require("../tools/Logger");
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
                Logger_1.Logger.info("修改小游戏服务器地址为:" + server);
            }
        }
    }
}
exports.Minigame = Minigame;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWluaWdhbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvcG9zdGJ1aWxkL01pbmlnYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHdEQUEwQjtBQUMxQixnREFBd0I7QUFFeEIsNENBQXlDO0FBQ3pDLDBDQUF1QztBQUN2Qyw0Q0FBeUM7QUFFekMsTUFBYSxRQUFRO0lBQ2pCLGtCQUFrQjtJQUNYLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBeUIsRUFBRSxNQUFvQjtRQUN0RSxJQUFJLGFBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUMsWUFBWTtZQUNqRCxJQUFJLE1BQU0sR0FBRyxlQUFNLENBQUMsR0FBRyxDQUFDLDRCQUE0QixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzFELElBQUksS0FBSyxHQUFHLGFBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2hFLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxjQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLElBQUksSUFBSSxFQUFFO2dCQUNOLElBQUksUUFBUSxHQUFHLGtCQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUMzRCxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Z0JBQ2hDLGtCQUFFLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDakMsZUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLENBQUM7YUFDeEM7U0FDSjtJQUNMLENBQUM7Q0FDSjtBQWZELDRCQWVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gXCJmcy1leHRyYVwiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBJQnVpbGRSZXN1bHQsIElCdWlsZFRhc2tPcHRpb24gfSBmcm9tIFwiQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL2J1aWxkZXIvQHR5cGVzL3B1YmxpY1wiO1xyXG5pbXBvcnQgeyBDb25maWcgfSBmcm9tIFwiLi4vdG9vbHMvQ29uZmlnXCI7XHJcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSBcIi4uL3Rvb2xzL1V0aWxzXCI7XHJcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuLi90b29scy9Mb2dnZXJcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBNaW5pZ2FtZSB7XHJcbiAgICAvKiog5L+u5pS55bCP5ri45oiP55qE5pyN5Yqh5Zmo5Zyw5Z2AICovXHJcbiAgICBwdWJsaWMgc3RhdGljIG1vZGlmeVNlcnZlcihvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCkge1xyXG4gICAgICAgIGlmIChVdGlscy5pc01pbmlnYW1lKG9wdGlvbnMucGxhdGZvcm0pKSB7Ly/lsI/muLjmiI/kv67mlLnmnI3liqHlmajlnLDlnYBcclxuICAgICAgICAgICAgbGV0IHNlcnZlciA9IENvbmZpZy5nZXQoXCJnYW1lU2V0dGluZy5taW5pZ2FtZVNlcnZlclwiLCBcIlwiKTtcclxuICAgICAgICAgICAgbGV0IGZpbGVzID0gVXRpbHMuZ2V0QWxsRmlsZXMocmVzdWx0LmRlc3QgKyBcIi9zcmNcIiwgbnVsbCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIGxldCBmaWxlID0gZmlsZXMuZmluZCh2ID0+IHBhdGguYmFzZW5hbWUodikuc3RhcnRzV2l0aChcInNldHRpbmdzLlwiKSk7XHJcbiAgICAgICAgICAgIGlmIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2V0dGluZ3MgPSBmcy5yZWFkSnNvblN5bmMoZmlsZSwgeyBlbmNvZGluZzogXCJ1dGY4XCIgfSk7XHJcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5hc3NldHMuc2VydmVyID0gc2VydmVyO1xyXG4gICAgICAgICAgICAgICAgZnMud3JpdGVKU09OU3luYyhmaWxlLCBzZXR0aW5ncyk7XHJcbiAgICAgICAgICAgICAgICBMb2dnZXIuaW5mbyhcIuS/ruaUueWwj+a4uOaIj+acjeWKoeWZqOWcsOWdgOS4ujpcIiArIHNlcnZlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=