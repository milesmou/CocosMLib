
import { Config } from "../../tools/Config";

const buildPathKey = "hotupdate.buildPath";
const urlKey = "gameSetting.hotupdateServer";
const versionKey = "gameSetting.version";
const mainVersionKey = "gameSetting.mainVersion";

export class HotUpdateConfig {
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

    public static get version() {
        return Config.get(versionKey, "");
    }

    public static set version(val: string) {
        Config.set(versionKey, val);
    }

    public static get mainVersion() {
        return Config.get(mainVersionKey, "");
    }

    public static set mainVersion(val: string) {
        Config.set(mainVersionKey, val);
    }
}