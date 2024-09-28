"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotUpdateConfig = void 0;
const Config_1 = require("../../tools/Config");
const buildPathKey = "hotupdate.buildPath";
const urlKey = "gameSetting.hotupdateServer";
const versionKey = "gameSetting.version";
const mainVersionKey = "gameSetting.mainVersion";
class HotUpdateConfig {
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
    static get version() {
        return Config_1.Config.get(versionKey, "");
    }
    static set version(val) {
        Config_1.Config.set(versionKey, val);
    }
    static get mainVersion() {
        return Config_1.Config.get(mainVersionKey, "");
    }
    static set mainVersion(val) {
        Config_1.Config.set(mainVersionKey, val);
    }
}
exports.HotUpdateConfig = HotUpdateConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSG90VXBkYXRlQ29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc291cmNlL2J1aWxkZXIvcG9zdGJ1aWxkL0hvdFVwZGF0ZUNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQ0FBNEM7QUFFNUMsTUFBTSxZQUFZLEdBQUcscUJBQXFCLENBQUM7QUFDM0MsTUFBTSxNQUFNLEdBQUcsNkJBQTZCLENBQUM7QUFDN0MsTUFBTSxVQUFVLEdBQUcscUJBQXFCLENBQUM7QUFDekMsTUFBTSxjQUFjLEdBQUcseUJBQXlCLENBQUM7QUFFakQsTUFBYSxlQUFlO0lBQ2pCLE1BQU0sS0FBSyxTQUFTO1FBQ3ZCLE9BQU8sZUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVNLE1BQU0sS0FBSyxTQUFTLENBQUMsR0FBVztRQUNuQyxlQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRU0sTUFBTSxLQUFLLEdBQUc7UUFDakIsT0FBTyxlQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRU0sTUFBTSxLQUFLLEdBQUcsQ0FBQyxHQUFXO1FBQzdCLGVBQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFTSxNQUFNLEtBQUssT0FBTztRQUNyQixPQUFPLGVBQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFTSxNQUFNLEtBQUssT0FBTyxDQUFDLEdBQVc7UUFDakMsZUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVNLE1BQU0sS0FBSyxXQUFXO1FBQ3pCLE9BQU8sZUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVNLE1BQU0sS0FBSyxXQUFXLENBQUMsR0FBVztRQUNyQyxlQUFNLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDO0NBQ0o7QUFoQ0QsMENBZ0NDIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBDb25maWcgfSBmcm9tIFwiLi4vLi4vdG9vbHMvQ29uZmlnXCI7XG5cbmNvbnN0IGJ1aWxkUGF0aEtleSA9IFwiaG90dXBkYXRlLmJ1aWxkUGF0aFwiO1xuY29uc3QgdXJsS2V5ID0gXCJnYW1lU2V0dGluZy5ob3R1cGRhdGVTZXJ2ZXJcIjtcbmNvbnN0IHZlcnNpb25LZXkgPSBcImdhbWVTZXR0aW5nLnZlcnNpb25cIjtcbmNvbnN0IG1haW5WZXJzaW9uS2V5ID0gXCJnYW1lU2V0dGluZy5tYWluVmVyc2lvblwiO1xuXG5leHBvcnQgY2xhc3MgSG90VXBkYXRlQ29uZmlnIHtcbiAgICBwdWJsaWMgc3RhdGljIGdldCBidWlsZFBhdGgoKSB7XG4gICAgICAgIHJldHVybiBDb25maWcuZ2V0KGJ1aWxkUGF0aEtleSwgXCJcIik7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzZXQgYnVpbGRQYXRoKHZhbDogc3RyaW5nKSB7XG4gICAgICAgIENvbmZpZy5zZXQoYnVpbGRQYXRoS2V5LCB2YWwpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IHVybCgpIHtcbiAgICAgICAgcmV0dXJuIENvbmZpZy5nZXQodXJsS2V5LCBcIlwiKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHNldCB1cmwodmFsOiBzdHJpbmcpIHtcbiAgICAgICAgQ29uZmlnLnNldCh1cmxLZXksIHZhbCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXQgdmVyc2lvbigpIHtcbiAgICAgICAgcmV0dXJuIENvbmZpZy5nZXQodmVyc2lvbktleSwgXCJcIik7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzZXQgdmVyc2lvbih2YWw6IHN0cmluZykge1xuICAgICAgICBDb25maWcuc2V0KHZlcnNpb25LZXksIHZhbCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXQgbWFpblZlcnNpb24oKSB7XG4gICAgICAgIHJldHVybiBDb25maWcuZ2V0KG1haW5WZXJzaW9uS2V5LCBcIlwiKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHNldCBtYWluVmVyc2lvbih2YWw6IHN0cmluZykge1xuICAgICAgICBDb25maWcuc2V0KG1haW5WZXJzaW9uS2V5LCB2YWwpO1xuICAgIH1cbn0iXX0=