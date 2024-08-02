"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Minigame = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Config_1 = require("../../tools/Config");
const Logger_1 = require("../../tools/Logger");
const Utils_1 = require("../../tools/Utils");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWluaWdhbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvYnVpbGRlci9wb3N0YnVpbGQvTWluaWdhbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0Esd0RBQTBCO0FBQzFCLGdEQUF3QjtBQUN4QiwrQ0FBNEM7QUFDNUMsK0NBQTRDO0FBQzVDLDZDQUEwQztBQUcxQyxNQUFhLFFBQVE7SUFDakIsa0JBQWtCO0lBQ1gsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUF5QixFQUFFLE1BQW9CO1FBQ3RFLElBQUksYUFBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBQyxZQUFZO1lBQ2pELElBQUksTUFBTSxHQUFHLGVBQU0sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUQsSUFBSSxLQUFLLEdBQUcsYUFBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDaEUsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGNBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDckUsSUFBSSxJQUFJLEVBQUU7Z0JBQ04sSUFBSSxRQUFRLEdBQUcsa0JBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7Z0JBQzNELFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztnQkFDaEMsa0JBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNqQyxlQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUMsQ0FBQzthQUN4QztTQUNKO0lBQ0wsQ0FBQztDQUNKO0FBZkQsNEJBZUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJQnVpbGRSZXN1bHQsIElCdWlsZFRhc2tPcHRpb24gfSBmcm9tIFwiQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL2J1aWxkZXIvQHR5cGVzL3B1YmxpY1wiO1xuaW1wb3J0IGZzIGZyb20gXCJmcy1leHRyYVwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IENvbmZpZyB9IGZyb20gXCIuLi8uLi90b29scy9Db25maWdcIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuLi8uLi90b29scy9Mb2dnZXJcIjtcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSBcIi4uLy4uL3Rvb2xzL1V0aWxzXCI7XG5cblxuZXhwb3J0IGNsYXNzIE1pbmlnYW1lIHtcbiAgICAvKiog5L+u5pS55bCP5ri45oiP55qE5pyN5Yqh5Zmo5Zyw5Z2AICovXG4gICAgcHVibGljIHN0YXRpYyBtb2RpZnlTZXJ2ZXIob3B0aW9uczogSUJ1aWxkVGFza09wdGlvbiwgcmVzdWx0OiBJQnVpbGRSZXN1bHQpIHtcbiAgICAgICAgaWYgKFV0aWxzLmlzTWluaWdhbWUob3B0aW9ucy5wbGF0Zm9ybSkpIHsvL+Wwj+a4uOaIj+S/ruaUueacjeWKoeWZqOWcsOWdgFxuICAgICAgICAgICAgbGV0IHNlcnZlciA9IENvbmZpZy5nZXQoXCJnYW1lU2V0dGluZy5taW5pZ2FtZVNlcnZlclwiLCBcIlwiKTtcbiAgICAgICAgICAgIGxldCBmaWxlcyA9IFV0aWxzLmdldEFsbEZpbGVzKHJlc3VsdC5kZXN0ICsgXCIvc3JjXCIsIG51bGwsIHRydWUpO1xuICAgICAgICAgICAgbGV0IGZpbGUgPSBmaWxlcy5maW5kKHYgPT4gcGF0aC5iYXNlbmFtZSh2KS5zdGFydHNXaXRoKFwic2V0dGluZ3MuXCIpKTtcbiAgICAgICAgICAgIGlmIChmaWxlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHNldHRpbmdzID0gZnMucmVhZEpzb25TeW5jKGZpbGUsIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0pO1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLmFzc2V0cy5zZXJ2ZXIgPSBzZXJ2ZXI7XG4gICAgICAgICAgICAgICAgZnMud3JpdGVKU09OU3luYyhmaWxlLCBzZXR0aW5ncyk7XG4gICAgICAgICAgICAgICAgTG9nZ2VyLmluZm8oXCLkv67mlLnlsI/muLjmiI/mnI3liqHlmajlnLDlnYDkuLo6XCIgKyBzZXJ2ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSJdfQ==