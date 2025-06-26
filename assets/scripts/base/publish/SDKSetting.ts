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

/** SDK参数配置 */
@ccclass("SDKSetting")
class SDKSetting extends Component {

    @property
    protected _scriptName: string = "SDKSetting";

    @property
    private _xtMode = ESDKMode.Auto;
    @property({ type: ESDKMode, displayName: "玄通模式", tooltip: SDKModeTip })
    public get xtMode() { return this._xtMode; }
    private set xtMode(value: number) { this._xtMode = value; }

    public get xtDebugMode() { return IsDebugMode(this._xtMode); }

    protected onLoad(): void {
        //@ts-ignore
        globalThis.mSdkSetting = this;
    }

    public getPrintInfo() {
        return `玄通测试模式:${this.xtDebugMode}`;
    }

}

declare global {
    /** SDK的一些配置 */
    const mSdkSetting: SDKSetting;
}