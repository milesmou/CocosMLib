import { _decorator, Component, Enum } from "cc";

const { ccclass, property } = _decorator;

const ESDKMode = Enum({
    Auto: 0,
    Debug: 1,
    Release: 2
})

const IsDebugMode = (mode: number) => {
    if (mode == ESDKMode.Auto) {
        return app.env != "release";
    } else {
        return mode == ESDKMode.Debug;
    }
}

const SDKModeTip = "Auto:只有发布后且app.env='release'为Release模式，其它情况均为Debug模式";
const SDKLogTip = "只有在SDK处于Debug模式，日志才会开启";

/** SDK参数配置 */
@ccclass("SDKSetting")
class SDKSetting extends Component {

    @property
    protected _scriptName: string = "SDKSetting";

    @property({ type: ESDKMode, displayName: "玄通模式", tooltip: SDKModeTip })
    private xtMode = ESDKMode.Auto;
    @property({ displayName: "玄通日志", tooltip: SDKLogTip })
    private xtLog = false;

    public get xtDebugMode() { return IsDebugMode(this.xtMode); }
    public get xtLogEnable() { return this.xtDebugMode && this.xtLog; }

    protected onLoad(): void {
        //@ts-ignore
        globalThis.mSdkSetting = this;
    }

    public getPrintInfo() {
        return `玄通调试模式:${this.xtDebugMode} 玄通日志:${this.xtLogEnable}`;
    }

}

declare global {
    /** SDK的一些配置 */
    const mSdkSetting: SDKSetting;
}