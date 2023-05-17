import { Component, Label, macro, Node, Vec3, _decorator } from 'cc';
import { RedDotMgr } from '../manager/RedDotMgr';
const { ccclass, property } = _decorator;

@ccclass('RedDot')
export class RedDot extends Component {
    @property({
        displayName: "红点名字"
    })
    redDotName = "";
    @property({
        type: Node,
        displayName: "红点节点"
    })
    redDotNode: Node = null;
    @property({
        type: Label,
        displayName: "红点数字"
    })
    redDotNum: Label = null;

    @property({
        displayName: "定时检查"
    })
    isTimer = false;
    @property({
        displayName: "检查间隔",
        tooltip: "单位秒"
    })
    interval = 1;
    @property({
        displayName: "方法名",
        tooltip: "方法应该是返回int"
    })
    methodName = "";

    private _timerMethod: Function;
    private _methodArgs: any[];

    public static GameRedDotMgr: Object;

    onLoad() {
        this.redDotName = this.redDotName.trim();
        this.methodName = this.methodName.trim();
        if (RedDot.GameRedDotMgr && this.isTimer && this.methodName) {
            this._timerMethod = RedDot.GameRedDotMgr[this.methodName];
            if (!this._timerMethod) {
                console.error(`${RedDot.GameRedDotMgr.constructor.name}中未找到方法 ${this.methodName}`);
            }
            else {
                this.schedule(this.onValueChange, this.interval, macro.REPEAT_FOREVER, 0);
            }
        }
        else if (!this.redDotName) {
            console.error("红点名字不能为空");
        }
    }

    onEnable() {
        if (!this._timerMethod) RedDotMgr.setRedDotListener(this.redDotName, this.onValueChange.bind(this));
        this.refreshRedDot();
    }

    onDisable() {
        if (!this._timerMethod) RedDotMgr.setRedDotListener(this.redDotName, null);
        this.refreshRedDot();
    }

    private refreshRedDot() {
        if (!this._timerMethod)
            this.onValueChange();
        else
            this.updateRedDot();
    }

    private onValueChange() {
        var value = RedDotMgr.getRedDotValue(this.redDotName);
        if (this.redDotNode) this.redDotNode.scale = value > 0 ? new Vec3(1, 1, 1) : new Vec3(0, 0, 0);
        if (this.redDotNum) this.redDotNum.string = value.toString();
    }

    private updateRedDot() {
        if (!this._methodArgs) {
            this.redDotNode.scale = new Vec3(0, 0, 0);
            return;
        }

        let value: number = this._timerMethod.call(RedDot.GameRedDotMgr, ...this._methodArgs);
        if (this.redDotNode) this.redDotNode.scale = value > 0 ? new Vec3(1, 1, 1) : new Vec3(0, 0, 0);
        if (this.redDotNum) this.redDotNum.string = value.toString();
    }


    public setTimerArgs(...args: any[]) {
        this._methodArgs = args;
        this.refreshRedDot();
    }
}
