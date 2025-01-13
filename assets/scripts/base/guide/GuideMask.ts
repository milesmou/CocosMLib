import { Component, EventTouch, Node, Rect, Size, Sprite, Vec2, Vec3, _decorator, v2, view } from "cc";
import { MEvent } from "../../../mlib/module/event/MEvent";
import { HollowOut } from "./HollowOut";


const { ccclass, property, requireComponent } = _decorator;

export enum EMaskHollowType {
    Rect = 1,
    Circle = 2
}

export enum EClickType {
    /** 不允许点击 */
    None,
    /** 手指松开完成点击 */
    PointerUp = 1,
    /** 手指按下即完成点击 */
    PointerDown = 10,
}

@ccclass("GuideMask")
@requireComponent(Sprite)
export class GuideMask extends Component {
    @property(HollowOut)
    private hollowOut: HollowOut = null;

    private _logger = mLogger.new("GuideMask", mLogger.ELogLevel.Warn);

    /** 触摸区域调试节点 */
    private _touchAreaDebug: Node;

    /** 触摸响应区域(世界坐标系) */
    private _touchRect: Rect = new Rect();

    private _isTweenHollow = false;//挖孔是否在动画过程中
    private _isClickInTouchArea = false;//是否在触摸区域内点击
    private _clickType = EClickType.None;//点击类型
    private _canClick = false;//是否可以点击挖孔区域

    private _touchStartEvt: EventTouch;//在touchstart触发事件后 记录事件并向下传递touchend事件

    /** 点击挖孔成功 */
    public onClickSucc: MEvent = new MEvent();
    /** 点击挖孔失败(已经点击成功了,但是还未跳到下一步,引导卡住) */
    public onClickFail: MEvent = new MEvent();

    protected onLoad(): void {
        this._touchAreaDebug = this.node.getChildByName("TouchArea");
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
    public hollow(type: EMaskHollowType, hollowPos: Vec3, hollowSize: Size, scale: number, duration: number, clickType: EClickType) {
        this._clickType = clickType;
        this._canClick = clickType != EClickType.None;

        this._logger.debug("clickType", clickType, Date.now());
        this._logger.debug("canClick", this._canClick, Date.now());

        let pos = v2(hollowPos.x, hollowPos.y);
        scale = scale || 1;

        let viewSize = view.getVisibleSize();
        //缩小点击范围避免点到目标区域范围外
        let touchWidth = hollowSize.width * 0.85;
        let touchHeight = hollowSize.height * 0.85;
        this._touchRect.x = hollowPos.x - touchWidth / 2 + viewSize.width / 2;
        this._touchRect.y = hollowPos.y - touchHeight / 2 + viewSize.height / 2;
        this._touchRect.width = touchWidth;
        this._touchRect.height = touchHeight;

        this.updateTouchAreaDebugNode(hollowPos, touchWidth, touchHeight);

        this._isTweenHollow = true;
        let width = hollowSize.width * scale;
        let height = hollowSize.height * scale;
        if (type == EMaskHollowType.Rect) {
            if (duration > 0) {
                this.hollowOut.rectTo(duration, pos, width, height, 20, 2);
            } else {
                this.hollowOut.rect(pos, width, height, 20, 2);
            }
        } else {
            let radius = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2) * scale;
            if (duration > 0) {
                this.hollowOut.circleTo(duration, pos, radius, 2);
            } else {
                this.hollowOut.circle(pos, radius, 2);
            }
        }

        this.scheduleOnce(() => {
            this._isTweenHollow = false;
        }, duration + 0.25);
    }

    private updateTouchAreaDebugNode(pos: Vec3, width: number, height: number) {
        if (this._touchAreaDebug?.active) {
            this._touchAreaDebug.setPosition(pos.x, pos.y, 0);
            this._touchAreaDebug.transform.width = width;
            this._touchAreaDebug.transform.height = height;
        }
    }

    private stopTouchEvent(evt: EventTouch) {
        evt.preventSwallow = false;
        evt.propagationStopped = true;
    }

    private isInTouchArea(worldPos: Vec2) {
        return worldPos.x > this._touchRect.xMin && worldPos.x < this._touchRect.xMax &&
            worldPos.y > this._touchRect.yMin && worldPos.y < this._touchRect.yMax;
    }

    private onTouchStart(evt: EventTouch) {
        if (this._isTweenHollow) return;//挖孔正在进行中

        if (!this._canClick) return;//已触发过点击事件

        this._isClickInTouchArea = false;

        let pos = evt.getUILocation();
        if (this.isInTouchArea(pos)) {
            this._logger.debug("TouchStart In", Date.now());
            this._isClickInTouchArea = true;
            evt.preventSwallow = true;
            evt.propagationStopped = false;
            if (this._clickType == EClickType.PointerDown) {//手指按下触发点击事件
                this._canClick = false;
                this.onClickSucc.dispatch();
                this._touchStartEvt = evt;
                this._logger.debug("TouchStart Succ", Date.now());
            }
        } else {
            evt.preventSwallow = false;
            evt.propagationStopped = true;
        }
    }

    private onTouchEnd(evt: EventTouch) {

        if (this._touchStartEvt && evt.getID() == this._touchStartEvt.getID()) {//在触摸开始时已完成点击事情 在此处冒泡触摸结束事件
            evt.setLocation(this._touchStartEvt.getLocationX(), this._touchStartEvt.getLocationY());
            evt.preventSwallow = true;
            evt.propagationStopped = false;
            this._touchStartEvt = null;
            this._logger.debug("Emit TouchEnd Evt", Date.now());
            return;
        }

        if (this._isTweenHollow) return;//挖孔正在进行中

        if (!this._canClick) return;//已触发过点击事件

        if (this._clickType != EClickType.PointerUp) return;//不是手指抬起触发点击事件

        let pos = evt.getUILocation();
        if (this._isClickInTouchArea && this.isInTouchArea(pos)) {
            evt.preventSwallow = true;
            evt.propagationStopped = false;
            this._canClick = false;
            this.onClickSucc.dispatch();
            this._logger.debug("TouchEnd Succ", Date.now());
        } else {
            evt.preventSwallow = false;
            evt.propagationStopped = true;
        }

        this._isClickInTouchArea = false;
    }

}
