import { PlatformWX } from "./PlatformWX";

class PlatformDev implements IPlatform {
    constructor() {
        console.log("Runtime：dev");
    }
    adUintId = {};
    login(obj?) { return "mouhong"; }
    getPlatform() { return "dev"; }
}

/** 全局变量赋值 */
window.mm = {} as any;
cc.game.once(cc.game.EVENT_GAME_INITED, () => {
    mm.config = {
        env: 1
    }
    let size = cc.view.getFrameSize();
    mm.orientation = (() => {
        return size.width < size.height ? 1 : 2;
    })();
    mm.screen = (() => {
        return Math.max(size.width, size.height) / Math.min(size.width, size.height) < 1.78 ? 1 : 2;
    })();
    mm.lang = (() => {
        let v = cc.sys.localStorage.getItem("SysLanguage") || cc.sys.languageCode;
        if (v.includes("zh")) {
            v = "zh";
        }
        console.log("Lang:", v, " LanguageCode:", cc.sys.languageCode);
        return v;
    })();
    mm.platform = (() => {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            return new PlatformWX();
        }
        return new PlatformDev();
    })();
})