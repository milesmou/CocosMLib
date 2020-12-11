class PlatformTest implements IPlatform {

    adUintId = {};
    login(obj?) { return "mouhong"; }
    showBanner() { }
    showRewardedVideo(params?) { }
    showInterstitial() { }
    reqInternalPay(skuid: string, params) {}
    reportCustomEvent(event, args) { }
}

if (cc.sys.isBrowser) {
    cc.macro.ENABLE_TRANSPARENT_CANVAS = true;
}

export enum EPlatformName {
    Test = "Test",
    GooglePlay = "GooglePlay",
}

/** 获取对应平台实例 */
let getPlatformInst = () => {
    console.log("Runtime", mm.config.platformName);
    if (cc.sys.platform == cc.sys.ANDROID && mm.config.platformName == EPlatformName.Test) {
        return new PlatformTest();
    }
    return new PlatformTest();
}

/** 获取语言环境 */
let getLanguage = () => {
    // let v = cc.sys.localStorage.getItem("SysLanguage") || cc.sys.languageCode;
    // if (v == "zh-cn") {
    //     v = "zh";
    // } else if (v.includes("zh-")) {
    //     v = "zh_ft";
    // } else if (!["zh", "zh_ft"].includes(v)) {
    //     v = "zh";
    // }
    let v = "zh_ft";
    console.log("Lang:", v, " LanguageCode:", cc.sys.languageCode);
    return v;
}

/** 全局变量赋值 */
window.mm = {} as any;
mm.config = {} as any;
mm.config.platformName = EPlatformName.Test;
mm.config.version = "1.0.0";
mm.config.url = `http://127.0.0.1/${mm.config.platformName}/`;
mm.lang = getLanguage();
mm.platform = getPlatformInst();
