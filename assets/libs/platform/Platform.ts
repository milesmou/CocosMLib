import { PlatformWX } from "./PlatformWX";

window.Orientation = (() => {
    return cc.winSize.width < cc.winSize.height ? 1 : 2;
})();

window.ScreenType = (() => {
    return Math.max(cc.winSize.width, cc.winSize.height) / Math.min(cc.winSize.width, cc.winSize.height) < 1.78 ? 1 : 2;
})();

class PlatformDev implements IPlatform {
    constructor() {
        console.log(Config.env);
        console.log("运行环境：dev");
    }
    adCfg = {};
    login(obj?) { return "mouhong"; }
    getPlatform() { return "dev"; }
}
/** 根据对运行环境的检测，创建对应平台类的实例 */
window.Platform = (() => {
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        return new PlatformWX();
    }
    return new PlatformDev();
})();