"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuExecute = void 0;
const path_1 = __importDefault(require("path"));
const Logger_1 = require("../tools/Logger");
const Utils_1 = require("../tools/Utils");
class MenuExecute {
    static copyLoadLocation(assetInfo) {
        let filePath = Utils_1.Utils.toUniSeparator(assetInfo.file);
        let bundlePath = Utils_1.Utils.getBundlePath(filePath);
        let location = "";
        if (bundlePath) {
            location = filePath.replace(bundlePath + "/", "");
            location = location.replace(path_1.default.extname(location), "");
        }
        Editor.Clipboard.write("text", location);
        Logger_1.Logger.info("加载路径", location);
    }
}
exports.MenuExecute = MenuExecute;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWVudUV4ZWN1dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvYXNzZXRtZW51L01lbnVFeGVjdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGdEQUF3QjtBQUV4Qiw0Q0FBeUM7QUFDekMsMENBQXVDO0FBRXZDLE1BQWEsV0FBVztJQUNiLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFvQjtRQUMvQyxJQUFJLFFBQVEsR0FBRyxhQUFLLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwRCxJQUFJLFVBQVUsR0FBRyxhQUFLLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLFVBQVUsRUFBRTtZQUNaLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbEQsUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUMzRDtRQUNELE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN6QyxlQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNsQyxDQUFDO0NBQ0o7QUFaRCxrQ0FZQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBBc3NldEluZm8gfSBmcm9tIFwiLi4vLi4vQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL2Fzc2V0LWRiL0B0eXBlcy9wdWJsaWNcIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuLi90b29scy9Mb2dnZXJcIjtcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSBcIi4uL3Rvb2xzL1V0aWxzXCI7XG5cbmV4cG9ydCBjbGFzcyBNZW51RXhlY3V0ZSB7XG4gICAgcHVibGljIHN0YXRpYyBjb3B5TG9hZExvY2F0aW9uKGFzc2V0SW5mbzogQXNzZXRJbmZvKSB7XG4gICAgICAgIGxldCBmaWxlUGF0aCA9IFV0aWxzLnRvVW5pU2VwYXJhdG9yKGFzc2V0SW5mby5maWxlKTtcbiAgICAgICAgbGV0IGJ1bmRsZVBhdGggPSBVdGlscy5nZXRCdW5kbGVQYXRoKGZpbGVQYXRoKTtcbiAgICAgICAgbGV0IGxvY2F0aW9uID0gXCJcIjtcbiAgICAgICAgaWYgKGJ1bmRsZVBhdGgpIHtcbiAgICAgICAgICAgIGxvY2F0aW9uID0gZmlsZVBhdGgucmVwbGFjZShidW5kbGVQYXRoICsgXCIvXCIsIFwiXCIpO1xuICAgICAgICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbi5yZXBsYWNlKHBhdGguZXh0bmFtZShsb2NhdGlvbiksIFwiXCIpO1xuICAgICAgICB9XG4gICAgICAgIEVkaXRvci5DbGlwYm9hcmQud3JpdGUoXCJ0ZXh0XCIsIGxvY2F0aW9uKTtcbiAgICAgICAgTG9nZ2VyLmluZm8oXCLliqDovb3ot6/lvoRcIiwgbG9jYXRpb24pO1xuICAgIH1cbn0iXX0=