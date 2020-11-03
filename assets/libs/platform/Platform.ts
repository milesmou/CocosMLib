import { PlatformWX } from "./PlatformWX";

cc.game.once(cc.game.EVENT_ENGINE_INITED, () => {
    let size = cc.view.getFrameSize();
    mm.orientation = (() => {
        return size.width < size.height ? 1 : 2;
    })();
    mm.screen = (() => {
        return Math.max(size.width, size.height) / Math.min(size.width, size.height) < 1.78 ? 1 : 2;
    })();
    mm.lang = (() => {
        let v = cc.sys.localStorage.getItem("Language") || cc.sys.languageCode;
        if (cc.sys.languageCode.includes("zh")) {
            v = "zh";
        }
        console.log("Lang:", v, " LanguageCode:", cc.sys.languageCode);
        return v;
    })();
})
class PlatformDev implements IPlatform {
    constructor() {
        console.log("运行环境：dev");
    }
    adCfg = {};
    login(obj?) { return "mouhong"; }
    getPlatform() { return "dev"; }
}
/** 根据对运行环境的检测，创建对应平台类的实例 */
mm.platform = (() => {
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        return new PlatformWX();
    }
    return new PlatformDev();
})();