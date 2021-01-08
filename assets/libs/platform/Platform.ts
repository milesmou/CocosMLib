import { UIManager } from "../ui/UIManager";

class PlatformTest implements IPlatform {

    adCfg = {};
    login(obj?) { return "mouhong"; }
    showBanner() { }
    showRewardedVideo(params?) {
        UIManager.Inst.tipMseeage.showTips("测试：视频观看完成");
        params?.success && params.success();
        params?.complete && params.complete();
    }
    showInterstitial() { }
    reqInternalPay(skuid: string, params) {
        UIManager.Inst.tipMseeage.showTips("测试：支付成功 \n" + skuid);
        params?.success && params.success();
        params?.complete && params.complete();
    }
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
    if (cc.sys.platform == cc.sys.ANDROID && mm.config.platformName == EPlatformName.GooglePlay) {
        // return new GooglePlay();
    }/*  else if (cc.sys.platform == cc.sys.ANDROID && mm.config.platformName == EPlatformName.Test) {
        return new GooglePlay();
    } */
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
mm.config.version = "1.0.8";
mm.config.url = `https://127.0.0.1/${mm.config.platformName}/`;
mm.lang = getLanguage();
mm.platform = getPlatformInst();
