
import { Config } from "../../tools/Config";

const buildTaskNameKey = "hotupdate.buildTaskName";
const buildPathKey = "hotupdate.buildPath";
const urlKey = "gameSetting.hotupdateServer";
const appVersionKey = "gameSetting.appVersion";
const patchVersionKey = "gameSetting.patchVersion";

export class HotUpdateConfig {

    public static get buildTaskName() {
        return Config.get(buildTaskNameKey, "");
    }

    public static set buildTaskName(val: string) {
        Config.set(buildTaskNameKey, val);
    }

    public static get buildPath() {
        return Config.get(buildPathKey, "");
    }

    public static set buildPath(val: string) {
        Config.set(buildPathKey, val);
    }

    public static get url() {
        return Config.get(urlKey, "");
    }

    public static set url(val: string) {
        Config.set(urlKey, val);
    }

    public static get appVersion() {
        return Config.get(appVersionKey, "");
    }

    public static set appVersion(val: string) {
        Config.set(appVersionKey, val);
    }

    public static get patchVersion() {
        return Config.get(patchVersionKey, "");
    }

    public static set patchVersion(val: string) {
        Config.set(patchVersionKey, val);
    }
}