import { _decorator, Button, EventHandler, EventTouch, Intersection2D, macro, PolygonCollider2D, UITransform, Vec2, Vec3 } from 'cc';
import { MEvent } from '../../event/MEvent';

const { ccclass, property, disallowMultiple } = _decorator;


@ccclass('MButton')
@disallowMultiple
export class MButton extends Button {
    /** 全局默认点击音效 */
    public static DefaultClickAudio = "";

    @property({
        displayName: "默认音效"
    })
    public defaultAudio = true;
    @property({
        displayName: "自定义音效",
        visible() { return !(this as MButton).defaultAudio; }
    })
    public customAudio = "";
    @property({
        displayName: "冷却时间",
        range: [0, 10],
    })
    public cooldown = 0.2;

    @property({
        displayName: "快速响应",
        tooltip: "快速响应模式,在手指按下的瞬间就想要点击事件"
    })
    public quickMode = false;

    @property({
        displayName: "异形按钮",
        tooltip: "按钮是否是异形按钮,节点上必须有PolygonCollider2D组件"
    })
    private m_PolygonButton = false;

    //多次点击按钮相关
    @property private _multiClickButton = false;
    @property({
        displayName: "连击按钮",
    })
    public get multiClickButton() { return this._multiClickButton; }
    private set multiClickButton(val: boolean) {
        this._multiClickButton = val;
        if (val) this.longPressButton = false;
    }
    @property private _multiClickInterval = 0.2;
    @property({
        displayName: "连击每次最大间隔(秒)",
        range: [0.1, 2],
        visible() { return (this as MButton)._multiClickButton; }
    })
    public get multiClickInterval() { return this._multiClickInterval; }
    private set multiClickInterval(val: number) { this._multiClickInterval = val; }

    //长按按钮相关
    @property private _longPressButton = false;
    @property({
        displayName: "长按按钮",
    })
    public get longPressButton() { return this._longPressButton; }
    private set longPressButton(val: boolean) {
        this._longPressButton = val;
        if (val) this.multiClickButton = false;
    }
    @property({
        displayName: "长按忽略点击事件",
        tooltip: "True:只会触发长按事件 False:触发长按事件或点击事件",
        visible() { return (this as MButton)._longPressButton; }
    })
    private m_LongPressIgnoreClick = true;
    @property({
        displayName: "长按触发时长(秒)",
        range: [0.1, 5],
        visible() { return (this as MButton)._longPressButton; }
    })
    private m_LongPressDuration = 1;
    @property({
        displayName: "长按连续触发事件",
        visible() { return (this as MButton)._longPressButton; }
    })
    private m_LongPressRepeatInvoke = false;
    @property({
        displayName: "长按连续触发间隔(秒)",
        range: [0.05, 5],
        visible() { return (this as MButton)._longPressButton && (this as MButton).m_LongPressRepeatInvoke; }
    })
    private m_LongPressRepeatInterval = 0.15;

    private _onClick = new MEvent();
    public get onClick() { return this._onClick; }
    public set onClick(value: MEvent) { this._onClick = value; }

    private _onMultiClick = new MEvent<number>();
    public get onMultiClick() { return this._onMultiClick; }
    public set onMultiClick(value: MEvent<number>) { this._onMultiClick = value; }

    private _onLongPress = new MEvent();
    public get onLongPress() { return this._onLongPress; }
    public set onLongPress(value: MEvent) { this._onLongPress = value; }

    /** 是否冷却中 */
    private _isCoolingDown = false;
    /** 多边形组件 */
    private _polygon: PolygonCollider2D;
    /** 本次点击是否在多边形内 */
    private _isInPolygon = false;

    /** 上一次完成点击的时间 */
    private _lastClickTimeMS = 0;
    /** 多击累计点击次数 */
    private _multiClickCnt = 0;

    /** 按钮按下的时间戳 */
    private _pressBeganTimeMS = 0;
    /** 长按事件触发次数 */
    private _longPressEvtCount = 0;

    private get clickAudio() {
        if (!this.defaultAudio)
            return this.customAudio;
        return MButton.DefaultClickAudio;
    }

    protected onLoad(): void {
        if (this.m_PolygonButton) {
            this._polygon = this.getComponent(PolygonCollider2D);
            if (!this._polygon) {
                mLogger.error(`节点${this.node.name}上没有PolygonCollider2D组件`);
                return;
            }
        }
    }

    protected _onTouchBegan(event?: EventTouch): void {
        if (this._isCoolingDown) return;
        if (!this._interactable || !this.enabledInHierarchy) return;
        if (!this.checkPolygonButton(event)) return;

        super._onTouchBegan(event);
        if (this.quickMode) this.checkTouchEvent(event);
        if (this._longPressButton) {
            this._pressBeganTimeMS = Date.now();
            this._longPressEvtCount = 0;
            this.schedule(this.updateLongPress, 0, macro.REPEAT_FOREVER);
        }
    }

    protected _onTouchMove(event?: EventTouch): void {
        if (this._isCoolingDown) return;
        super._onTouchMove(event);
    }

    protected _onTouchEnded(event?: EventTouch): void {
        if (this._isCoolingDown) return;
        if (!this._interactable || !this.enabledInHierarchy) return;
        if (!this.checkPolygonButton(event)) return;

        if (this['_pressed'] && this.cooldown > 0 && !this._multiClickButton) {//多击按钮不进入冷却
            this._isCoolingDown = true;
            this.scheduleOnce(() => {
                this._isCoolingDown = false;
            }, this.cooldown)
        }

        if (!this.quickMode) this.checkTouchEvent(event);
        if (this._longPressButton) this.unschedule(this.updateLongPress);
        super._onTouchCancel(event);
        if (event) {
            event.propagationStopped = true;
        }
    }

    private checkPolygonButton(event: EventTouch) {
        if (this.m_PolygonButton) {//异形按钮
            //判断点击范围
            let screenPos = event.getUILocation();
            let pos = this.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(screenPos.x, screenPos.y));
            this._isInPolygon = Intersection2D.pointInPolygon(new Vec2(pos.x, pos.y), this._polygon.points);
            if (!this._isInPolygon) {//不在指定点击范围 继续向下冒泡事件
                event.preventSwallow = true;
                if (event) event.propagationStopped = false;
                return false;
            }
        }
        return true;
    }

    private checkTouchEvent(event: EventTouch) {
        if (this._longPressButton && this.m_LongPressIgnoreClick) {
            //长按按钮且忽略点击事件
        } else {
            if (this._longPressButton && this._longPressEvtCount > 0) {
                //已触发长按事件 忽略点击事件
            } else {//正常触发点击事件
                if (this['_pressed'] && this.clickAudio) app.audio.playEffect(this.clickAudio, 1, { deRef: false });
                EventHandler.emitEvents(this.clickEvents, event);
                this.node.emit(Button.EventType.CLICK, this);
                this.onClick.dispatch();
                if (this._multiClickButton) {//多击按钮检测
                    let now = Date.now();
                    if (now - this._lastClickTimeMS < this._multiClickInterval * 1000) {//追加多击次数
                        this._multiClickCnt += 1;
                        this.onMultiClick.dispatch(this._multiClickCnt);
                    } else {
                        this._multiClickCnt = 1;
                    }
                    this._lastClickTimeMS = now;
                }
            }
        }
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

    private dispatchLongPress(first: boolean) {
        if (first && this.clickAudio) app.audio.playEffect(this.clickAudio, 1, { deRef: false });
        this._longPressEvtCount++;
        this.onLongPress.dispatch();
        if (!this.m_LongPressRepeatInvoke) this.unschedule(this.updateLongPress);
    }

}