import { Component, EventTouch, Node, Rect, Size, Sprite, Vec2, Vec3, _decorator, v2, view } from "cc";
import { MEvent } from "../../../mlib/module/event/MEvent";
import { HollowOut } from "./HollowOut";


const { ccclass, property, requireComponent } = _decorator;

export enum EMaskHollowType {
    Rect = 1,
    Circle = 2
}

@ccclass("GuideMask")
@requireComponent(Sprite)
export class GuideMask extends Component {
    @property(HollowOut)
    private hollowOut: HollowOut = null;

    /** 触摸响应区域(世界坐标系) */
    private _touchRect: Rect = new Rect();

    private _isClickInTouchArea = false;//是否在触摸区域内点击
    private _canClick = false;//是否可以点击挖孔区域
    private _isTweenHollow = false;//挖孔是否在动画过程中

    /** 点击挖孔成功 */
    public onClickSucc: MEvent = new MEvent();

    protected onLoad(): void {
        this.hollowOut = this.getComponent(HollowOut);
        this.reset();
    }

    /** 是否接收触摸事件(接收事件后将不会再向下传递触摸事件) */
    public setTouchEnable(enable: boolean) {
        if (enable) {
            if (this.node.hasEventListener(Node.EventType.TOUCH_START)) return;
            this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
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

    /** 
     * 挖孔
     * @param hollowPos 屏幕中心为原点的坐标
     */
    public hollow(type: EMaskHollowType, hollowPos: Vec3, hollowSize: Size, scale: number, duration: number, canClick = true) {
        this._canClick = canClick;

        let pos = v2(hollowPos.x, hollowPos.y);
        scale = scale || 1;

        let viewSize = view.getVisibleSize();
        this._touchRect.x = hollowPos.x - hollowSize.width / 2 + viewSize.width / 2;
        this._touchRect.y = hollowPos.y - hollowSize.height / 2 + viewSize.height / 2;
        this._touchRect.width = hollowSize.width;
        this._touchRect.height = hollowSize.height;

        this._isTweenHollow = true;
        let width = hollowSize.width * scale;
        let height = hollowSize.height * scale;
        if (type == EMaskHollowType.Rect) {
            if (duration > 0) {
                this.hollowOut.rectTo(duration, pos, width, height, 1, 0.5);
            } else {
                this.hollowOut.rect(pos, width, height, 1, 0.5);
            }
        } else {
            let radius = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2) * scale;
            if (duration > 0) {
                this.hollowOut.circleTo(duration, pos, radius, 0.5);
            } else {
                this.hollowOut.circle(pos, radius, 0.5);
            }
        }

        this.scheduleOnce(() => {
            this._isTweenHollow = false;
        }, duration + 0.05);
    }

    private stopTouchEvent(evt: EventTouch) {
        evt.propagationStopped = true;
    }

    private isInTouchArea(worldPos: Vec2) {
        return worldPos.x > this._touchRect.xMin && worldPos.x < this._touchRect.xMax &&
            worldPos.y > this._touchRect.yMin && worldPos.y < this._touchRect.yMax;
    }

    private onTouchStart(evt: EventTouch) {
        if (this._isTweenHollow) return;//挖孔正在进行中

        if (!this._canClick) return;//已触发过点击事件

        let pos = evt.getUILocation();
        if (this.isInTouchArea(pos)) {
            this._isClickInTouchArea = true;
            evt.preventSwallow = true;
            evt.propagationStopped = false;
        } else {
            this._isClickInTouchArea = false;
            evt.preventSwallow = false;
            evt.propagationStopped = true;
        }
    }

    private onTouchEnd(evt: EventTouch) {

        if (this._isTweenHollow) return;//挖孔正在进行中

        if (!this._canClick) return;//已触发过点击事件

        let pos = evt.getUILocation();
        if (this._isClickInTouchArea && this.isInTouchArea(pos)) {
            this._canClick = false;
            this._isClickInTouchArea = true;
            evt.preventSwallow = true;
            evt.propagationStopped = false;
            this.onClickSucc.dispatch();
        } else {
            evt.preventSwallow = false;
            evt.propagationStopped = true;
        }

    }

}
