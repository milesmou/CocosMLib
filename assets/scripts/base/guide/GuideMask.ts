import { Button, Component, EventTouch, Node, Rect, Sprite, Toggle, UITransform, _decorator, v2, v3 } from "cc";
import { MEvent } from "../../../mlib/module/event/MEvent";
import { MLogger } from "../../../mlib/module/logger/MLogger";
import { HollowOut } from "./HollowOut";
import { MButton } from "../../../mlib/module/ui/extend/MButton";
import { MToggle } from "../../../mlib/module/ui/extend/MToggle";


const { ccclass, property, requireComponent } = _decorator;

export enum EMaskHollowType {
    Rect = 1,
    Circle = 2
}

@ccclass
@requireComponent(Sprite)
export class GuideMask extends Component {
    @property(HollowOut)
    private hollowOut: HollowOut = null;

    /** 挖孔的目标节点Rect */
    private _hollowTargetRect: Rect = null;
    /** 触发事件的目标节点 */
    private _eventTarget: Node = null;

    private _canClick = false;//是否可以点击挖孔区域
    private _isTweenHollow = false;//挖孔是否在动画过程中

    /** 当事件节点已销毁 */
    public onEventTargetInvalid: MEvent = new MEvent();

    protected onLoad(): void {
        this.hollowOut = this.getComponent(HollowOut);
        this.reset();
    }

    /** 是否接收触摸事件(接收事件后将不会再向下传递触摸事件) */
    public setTouchEnable(enable: boolean) {
        if (enable) {
            if (this.node.hasEventListener(Node.EventType.TOUCH_START)) return;
            this.node.on(Node.EventType.TOUCH_START, this.stopTouchEvent, this);
            this.node.on(Node.EventType.TOUCH_MOVE, this.stopTouchEvent, this);
            this.node.on(Node.EventType.TOUCH_CANCEL, this.stopTouchEvent, this);
            this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        } else {
            this.node.off(Node.EventType.TOUCH_START);
            this.node.off(Node.EventType.TOUCH_MOVE);
            this.node.off(Node.EventType.TOUCH_CANCEL);
            this.node.off(Node.EventType.TOUCH_END);
        }
    }

    public reset() {
        this.hollowOut.reset();
    }

    /** 挖孔并在点击挖孔区域时触发事件 */
    public hollow(type: EMaskHollowType, hollowTarget: Node, eventTarget: Node, scale: number, duration = 0.25) {
        this._canClick = true;
        this._isTweenHollow = true;
        this._eventTarget = eventTarget || hollowTarget;
        this.hollow2(type, hollowTarget, scale, duration);
    }

    /** 仅挖孔 不可点击挖孔区域 */
    public hollow2(type: EMaskHollowType, hollowTarget: Node, scale: number, duration = 0.25) {
        this._hollowTargetRect = hollowTarget.getComponent(UITransform).getBoundingBoxToWorld();

        let center = this._hollowTargetRect.center;
        let posV3 = this.getComponent(UITransform).convertToNodeSpaceAR(v3(center.x, center.y));
        let pos = v2(posV3.x, posV3.y);
        scale = scale || 1;

        if (type == EMaskHollowType.Rect) {
            let width = this._hollowTargetRect.width * scale;
            let height = this._hollowTargetRect.height * scale;
            if (duration > 0) {
                this.hollowOut.rectTo(duration, pos, width, height, 1, 0.5);
            } else {
                this.hollowOut.rect(pos, width, height, 1, 0.5);
            }
        } else {
            let radius = Math.sqrt((this._hollowTargetRect.width / 2) ** 2 + (this._hollowTargetRect.height / 2) ** 2) * scale;
            if (duration > 0) {
                this.hollowOut.circleTo(duration, pos, radius, 0.5);
            } else {
                this.hollowOut.circle(pos, radius, 0.5);
            }
        }

        this.scheduleOnce(() => {
            this._isTweenHollow = false;
        }, 0.05);
    }

    private stopTouchEvent(evt: EventTouch) {
        evt.propagationStopped = true;
    }

    private onTouchEnd(evt: EventTouch) {

        if (this._isTweenHollow) return;

        if (!this._canClick) return;


        let pos = evt.getUILocation();
        if (
            pos.x > this._hollowTargetRect.xMin && pos.x < this._hollowTargetRect.xMax &&
            pos.y > this._hollowTargetRect.yMin && pos.y < this._hollowTargetRect.yMax
        ) {

            this._canClick = false;

            if (!this._eventTarget.isValid) {//事件节点已销毁
                this.onEventTargetInvalid.dispatch();
                return;
            }

            let btn = this._eventTarget.getComponent(Button);
            if (btn) {
                Component.EventHandler.emitEvents(btn.clickEvents, evt);
                btn.node.emit("click", btn);
                if (btn instanceof MButton) btn.onClick.dispatch();
                return;
            }
            let tog = this._eventTarget.getComponent(Toggle);
            if (tog) {
                Component.EventHandler.emitEvents(tog.clickEvents, evt);
                tog.node.emit("click", tog);
                return;
            }
            MLogger.warn("节点上没有Button或Toggle", this._eventTarget);
        }

    }

}
