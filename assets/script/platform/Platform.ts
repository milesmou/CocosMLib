import { PlatformBase } from "./PlatformBase";
import { PlatformWX } from "./PlatformWX";

class PlatformDebug extends PlatformBase {
    constructor() {
        super();
        console.log("运行环境：debug");
    }
    adUnitIdCfg = {};
    login(obj?) { return "mouhong"; }
    getPlatform() { return "debug"; }
}
/** 根据对运行环境的检测，创建对应平台类的实例 */
const platform: PlatformBase = (() => {
    switch (cc.sys.platform) {
        case cc.sys.WECHAT_GAME:
            return new PlatformWX();
    }
    return new PlatformDebug();
})();
export { platform }