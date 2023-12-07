import { _decorator, Button, EventHandler, EventTouch, Intersection2D, macro, PolygonCollider2D, UITransform, Vec2, Vec3 } from 'cc';
import { App } from '../../../App';
import { MEvent } from '../../event/MEvent';
import { MLogger } from '../../logger/MLogger';

const { ccclass, property } = _decorator;

@ccclass('MButton')
export class MButton extends Button {

    public static DefaultClickAudio = "audio/test/click";
    @property({
        displayName: "默认音效"
    })
    private m_DefaultAudio = true;
    @property({
        displayName: "自定义音效",
        visible() { return !this.m_DefaultAudio; }
    })
    private m_CustomAudio = "";
    @property({
        displayName: "冷却时间",
        range: [0, 10],
    })
    private m_Cooldown = 0.2;

    @property({
        displayName: "异形按钮",
        tooltip: "按钮是否是异形按钮,节点上必须有PolygonCollider2D组件"
    })
    private m_PolygonButton = false;
    @property({
        displayName: "长按按钮"
    })
    private m_LongPressButton = false;

    @property({
        type: EventHandler,
        visible() { return this.m_LongPressButton; }
    })
    longPressEvents: EventHandler[] = [];
    @property({
        displayName: "长按忽略点击事件",
        tooltip: "True:只会触发长按事件 False:触发长按事件或点击事件",
        visible() { return this.m_LongPressButton; }
    })
    private m_LongPressIgnoreClick = true;

    @property({
        displayName: "长按触发时长(秒)",
        range: [0.1, 5],
        visible() { return this.m_LongPressButton; }
    })
    private m_LongPressDuration = 1;
    @property({
        displayName: "长按连续触发事件",
        visible() { return this.m_LongPressButton; }
    })
    private m_LongPressRepeatInvoke = true;
    @property({
        displayName: "长按连续触发间隔(秒)",
        range: [0.05, 5],
        visible() { return this.m_LongPressButton && this.m_LongPressRepeatInvoke; }
    })
    private m_LongPressRepeatInterval = 0.15;

    private _onClick = new MEvent();
    public get onClick() { return this._onClick; }

    private _onLongPress = new MEvent();
    public get onLongPress() { return this._onLongPress; }

    /** 是否冷却中 */
    private _isCoolingDown = false;
    /** 多边形组件 */
    private _polygon: PolygonCollider2D;
    /** 本次点击是否在多边形外 */
    private _isOutOfPolygon = false;
    /** 按钮按下的时间戳 */
    private _pressBeganTimeMS = 0;
    /** 长按事件触发次数 */
    private _longPressEvtCount = 0;

    private get clickAudio() {
        if (!this.m_DefaultAudio)
            return this.m_CustomAudio;
        return MButton.DefaultClickAudio;
    }

    protected onLoad(): void {
        if (this.m_PolygonButton) {
            this._polygon = this.getComponent(PolygonCollider2D);
            if (!this._polygon) {
                MLogger.error(`节点${this.node.name}上没有PolygonCollider2D组件`);
                return;
            }
        }
    }

    protected _onTouchBegan(event?: EventTouch): void {
        if (this._isCoolingDown) return;
        if (this.m_PolygonButton) {//异形按钮
            let screenPos = event.getUILocation();
            let pos = this.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(screenPos.x, screenPos.y));
            this._isOutOfPolygon = !Intersection2D.pointInPolygon(new Vec2(pos.x, pos.y), this._polygon.points);

            if (this._isOutOfPolygon) {//继续向下冒泡事件
                event.preventSwallow = true;
                if (event) event.propagationStopped = false;
                return;
            }

        }

        super._onTouchBegan(event);
        if (this.m_LongPressButton) {
            this._pressBeganTimeMS = Date.now();
            this._longPressEvtCount = 0;
            this.schedule(this.updateLongPress, 0, macro.REPEAT_FOREVER);
        }
    }


    protected _onTouchEnded(event?: EventTouch): void {
        if (this._isCoolingDown) return;
        if (!this['_pressed']) return;
        if (this.m_PolygonButton) {//异形按钮
            if (!this._isOutOfPolygon) {
                let screenPos = event.getUILocation();
                let pos = this.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(screenPos.x, screenPos.y));
                this._isOutOfPolygon = !Intersection2D.pointInPolygon(new Vec2(pos.x, pos.y), this._polygon.points);
            }
            if (this._isOutOfPolygon) {//继续向下冒泡事件
                event.preventSwallow = true;
                if (event) event.propagationStopped = false;
                return;
            }
        }


        if (this.m_LongPressButton) this.unschedule(this.updateLongPress);
        if (this.m_LongPressButton && this.m_LongPressIgnoreClick) {
            //直接忽略点击事件
        }
        else {
            if (this.m_LongPressButton && this._longPressEvtCount > 0) {
                //已触发长按事件 忽略点击事件
            }
            else {
                this.onClick.dispatch();
                super._onTouchEnded(event);
                if (this.clickAudio) App.audio.playEffect(this.clickAudio);
            }
        }

        if (this.m_Cooldown > 0) {
            this._isCoolingDown = true;
            this.scheduleOnce(() => {
                this._isCoolingDown = false;
            }, this.m_Cooldown)
        }
    }

    private dispatchLongPress(first: boolean) {
        if (first && this.clickAudio) App.audio.playEffect(this.clickAudio);
        this._longPressEvtCount++;
        this.onLongPress.dispatch();
        EventHandler.emitEvents(this.longPressEvents);
        if (!this.m_LongPressRepeatInvoke) this.unschedule(this.updateLongPress);
    }

    private updateLongPress(dt: number) {
        var now = Date.now();
        if (this._longPressEvtCount == 0) {
            if (now >= this._pressBeganTimeMS + Math.round(this.m_LongPressDuration * 1000)) {
                this.dispatchLongPress(true);
            }
        }
        else {
            var duration = this.m_LongPressDuration + (this._longPressEvtCount - 1) * this.m_LongPressRepeatInterval;
            if (now >= this._pressBeganTimeMS + Math.round(duration * 1000)) {
                this.dispatchLongPress(false);
            }
        }
    }

}