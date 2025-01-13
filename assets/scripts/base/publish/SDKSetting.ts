import { _decorator, Component, Enum } from "cc";
import { PREVIEW } from "cc/env";

const { ccclass, property } = _decorator;

const TDMode = Enum({
    AUTO: 0,
    NORMAL: 1,
    DEBUG: 2,
    DEBUG_ONLY: 3,
})

const TDModeStr = {
    [TDMode.NORMAL]: "normal",
    [TDMode.DEBUG]: "debug",
    [TDMode.DEBUG_ONLY]: "debugOnly",
}

/** SDK参数配置 */
@ccclass("SDKSetting")
class SDKSetting extends Component {

    @property
    protected _scriptName: string = "SDKSetting";

    @property private _tdId = "";
    @property({ displayName: "数数ID" })
    public get tdId() { return this._tdId; }
    private set tdId(value: string) { this._tdId = value; }

    @property private _tdUrl = "";
    @property({ displayName: "数数Url" })
    public get tdUrl() { return this._tdUrl; }
    private set tdUrl(value: string) { this._tdUrl = value; }

    @property
    private _tdMode = TDMode.AUTO;
    @property({ displayName: "数数模式", type: TDMode, tooltip: "AUTO:编辑器预览DEBUG_ONLY模式,打包后NORMAL模式" })
    public get tdMode() { return this._tdMode; }
    private set tdMode(value: number) { this._tdMode = value; }

    public get tdModeStr() {
        if (this._tdMode == TDMode.AUTO) {
            return PREVIEW ? TDModeStr[TDMode.DEBUG_ONLY] : TDModeStr[TDMode.NORMAL];
        }
        return TDModeStr[this._tdMode];
    }

    @property private _tdLog = false;
    @property({ displayName: "数数日志" })
    public get tdLog() { return this._tdLog; }
    private set tdLog(value: boolean) { this._tdLog = value; }

    protected onLoad(): void {
        //@ts-ignore
        globalThis.mSdkSetting = this;
    }

    public getPrintInfo() {
        return `数数模式:${this.tdModeStr}`;
    }

}

declare global {
    /** SDK的一些配置 */
    const mSdkSetting: SDKSetting;
}