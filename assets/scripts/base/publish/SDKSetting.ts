import { _decorator, Component } from "cc";

const { ccclass, property } = _decorator;


/** SDK参数配置 */
@ccclass("SDKSetting")
export default class SDKSetting extends Component {

    public static Inst: SDKSetting;

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
        SDKSetting.Inst = this;
    }

    public getPrintInfo() {
        return "SDKSetting";
    }

}
