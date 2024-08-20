import { _decorator, Component } from "cc";

const { ccclass, property } = _decorator;


/** SDK参数配置 */
@ccclass("SDKSetting")
class SDKSetting extends Component {

    @property private _tdId = "";
    @property({
        displayName: "数数ID"
    })
    public get tdId() { return this._tdId; }
    private set tdId(value: string) { this._tdId = value; }
    @property private _tdDebug = false;
    @property({
        displayName: "数数Debug"
    })
    public get tdDebug() { return this._tdDebug; }
    private set tdDebug(value: boolean) { this._tdDebug = value; }
    @property private _tdLog = false;
    @property({
        displayName: "数数日志"
    })
    public get tdLog() { return this._tdLog; }
    private set tdLog(value: boolean) { this._tdLog = value; }

    protected onLoad(): void {
        //@ts-ignore
        globalThis.mSdkSetting = this;
    }

    public getPrintInfo() {
        return "SDKSetting";
    }

}

declare global {
    /** SDK的一些配置 */
    const mSdkSetting: SDKSetting;
}
