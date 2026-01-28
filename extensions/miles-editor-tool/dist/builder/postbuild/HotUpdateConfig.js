"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotUpdateConfig = void 0;
const Config_1 = require("../../tools/Config");
const buildTaskNameKey = "hotupdate.buildTaskName";
const buildPathKey = "hotupdate.buildPath";
const urlKey = "gameSetting.hotupdateServer";
const appVersionKey = "gameSetting.appVersion";
const patchVersionKey = "gameSetting.patchVersion";
class HotUpdateConfig {
    static get buildTaskName() {
        return Config_1.Config.get(buildTaskNameKey, "");
    }
    static set buildTaskName(val) {
        Config_1.Config.set(buildTaskNameKey, val);
    }
    static get buildPath() {
        return Config_1.Config.get(buildPathKey, "");
    }
    static set buildPath(val) {
        Config_1.Config.set(buildPathKey, val);
    }
    static get url() {
        return Config_1.Config.get(urlKey, "");
    }
    static set url(val) {
        Config_1.Config.set(urlKey, val);
    }
    static get appVersion() {
        return Config_1.Config.get(appVersionKey, "");
    }
    static set appVersion(val) {
        Config_1.Config.set(appVersionKey, val);
    }
    static get patchVersion() {
        return Config_1.Config.get(patchVersionKey, "");
    }
    static set patchVersion(val) {
        Config_1.Config.set(patchVersionKey, val);
    }
}
exports.HotUpdateConfig = HotUpdateConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSG90VXBkYXRlQ29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc291cmNlL2J1aWxkZXIvcG9zdGJ1aWxkL0hvdFVwZGF0ZUNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQ0FBNEM7QUFFNUMsTUFBTSxnQkFBZ0IsR0FBRyx5QkFBeUIsQ0FBQztBQUNuRCxNQUFNLFlBQVksR0FBRyxxQkFBcUIsQ0FBQztBQUMzQyxNQUFNLE1BQU0sR0FBRyw2QkFBNkIsQ0FBQztBQUM3QyxNQUFNLGFBQWEsR0FBRyx3QkFBd0IsQ0FBQztBQUMvQyxNQUFNLGVBQWUsR0FBRywwQkFBMEIsQ0FBQztBQUVuRCxNQUFhLGVBQWU7SUFFakIsTUFBTSxLQUFLLGFBQWE7UUFDM0IsT0FBTyxlQUFNLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFTSxNQUFNLEtBQUssYUFBYSxDQUFDLEdBQVc7UUFDdkMsZUFBTSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRU0sTUFBTSxLQUFLLFNBQVM7UUFDdkIsT0FBTyxlQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRU0sTUFBTSxLQUFLLFNBQVMsQ0FBQyxHQUFXO1FBQ25DLGVBQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFTSxNQUFNLEtBQUssR0FBRztRQUNqQixPQUFPLGVBQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFTSxNQUFNLEtBQUssR0FBRyxDQUFDLEdBQVc7UUFDN0IsZUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVNLE1BQU0sS0FBSyxVQUFVO1FBQ3hCLE9BQU8sZUFBTSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVNLE1BQU0sS0FBSyxVQUFVLENBQUMsR0FBVztRQUNwQyxlQUFNLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRU0sTUFBTSxLQUFLLFlBQVk7UUFDMUIsT0FBTyxlQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU0sTUFBTSxLQUFLLFlBQVksQ0FBQyxHQUFXO1FBQ3RDLGVBQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7Q0FDSjtBQXpDRCwwQ0F5Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCB7IENvbmZpZyB9IGZyb20gXCIuLi8uLi90b29scy9Db25maWdcIjtcblxuY29uc3QgYnVpbGRUYXNrTmFtZUtleSA9IFwiaG90dXBkYXRlLmJ1aWxkVGFza05hbWVcIjtcbmNvbnN0IGJ1aWxkUGF0aEtleSA9IFwiaG90dXBkYXRlLmJ1aWxkUGF0aFwiO1xuY29uc3QgdXJsS2V5ID0gXCJnYW1lU2V0dGluZy5ob3R1cGRhdGVTZXJ2ZXJcIjtcbmNvbnN0IGFwcFZlcnNpb25LZXkgPSBcImdhbWVTZXR0aW5nLmFwcFZlcnNpb25cIjtcbmNvbnN0IHBhdGNoVmVyc2lvbktleSA9IFwiZ2FtZVNldHRpbmcucGF0Y2hWZXJzaW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBIb3RVcGRhdGVDb25maWcge1xuXG4gICAgcHVibGljIHN0YXRpYyBnZXQgYnVpbGRUYXNrTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIENvbmZpZy5nZXQoYnVpbGRUYXNrTmFtZUtleSwgXCJcIik7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzZXQgYnVpbGRUYXNrTmFtZSh2YWw6IHN0cmluZykge1xuICAgICAgICBDb25maWcuc2V0KGJ1aWxkVGFza05hbWVLZXksIHZhbCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXQgYnVpbGRQYXRoKCkge1xuICAgICAgICByZXR1cm4gQ29uZmlnLmdldChidWlsZFBhdGhLZXksIFwiXCIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgc2V0IGJ1aWxkUGF0aCh2YWw6IHN0cmluZykge1xuICAgICAgICBDb25maWcuc2V0KGJ1aWxkUGF0aEtleSwgdmFsKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldCB1cmwoKSB7XG4gICAgICAgIHJldHVybiBDb25maWcuZ2V0KHVybEtleSwgXCJcIik7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzZXQgdXJsKHZhbDogc3RyaW5nKSB7XG4gICAgICAgIENvbmZpZy5zZXQodXJsS2V5LCB2YWwpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IGFwcFZlcnNpb24oKSB7XG4gICAgICAgIHJldHVybiBDb25maWcuZ2V0KGFwcFZlcnNpb25LZXksIFwiXCIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgc2V0IGFwcFZlcnNpb24odmFsOiBzdHJpbmcpIHtcbiAgICAgICAgQ29uZmlnLnNldChhcHBWZXJzaW9uS2V5LCB2YWwpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IHBhdGNoVmVyc2lvbigpIHtcbiAgICAgICAgcmV0dXJuIENvbmZpZy5nZXQocGF0Y2hWZXJzaW9uS2V5LCBcIlwiKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHNldCBwYXRjaFZlcnNpb24odmFsOiBzdHJpbmcpIHtcbiAgICAgICAgQ29uZmlnLnNldChwYXRjaFZlcnNpb25LZXksIHZhbCk7XG4gICAgfVxufSJdfQ==