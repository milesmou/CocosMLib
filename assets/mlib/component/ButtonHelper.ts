import { Button, Component, EventHandler, EventTouch, Intersection2D, PolygonCollider2D, UITransform, Vec2, Vec3, _decorator } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

import { macro } from 'cc';
import { App } from "../App";

@ccclass('ButtonHelper')
@requireComponent(Button)
export class ButtonHelper extends Component {
    @property({
        displayName: "禁用默认音效",
        tooltip: "选中时，点击按钮不会播放默认音效"
    })
    disableDefault = false;
    @property({
        displayName: "音效地址",
        tooltip: "当音效不为空时，点击按钮播放指定的音效",
        visible: function () { return (this as ButtonHelper).disableDefault; }
    })
    audioLocation = "";
    @property({
        displayName: "冷却时间",
        range: [0, 5],
        slide: true,
        tooltip: "点击按钮后，等待多长时间重新启用按钮，单位秒",
    })
    cooldown = 0.2;
    @property({
        displayName: "多边形按钮",
        tooltip: "按钮是否是多边形按钮,节点上必须有PolygonCollider2D组件",
        visible: function () { return (this as ButtonHelper).getComponent(PolygonCollider2D) != null }
    })
    polygonButton = false;

    @property({
        displayName: "长按按钮",
        tooltip: "按钮可以长按触发事件",
    })
    longPressButton = false;
    @property({
        displayName: "长按时长",
        tooltip: "长按多久触发长按事件(单位秒)",
        range: [0.25, 10],
        slide: true,
        visible: function () { return (this as ButtonHelper).longPressButton }
    })
    longPressDuration = 1;
    @property({
        displayName: "重复触发长按事件",
        tooltip: "长按后可以按一定频率重复触发长按事件",
        visible: function () { return (this as ButtonHelper).longPressButton }
    })
    repeatLongPressEvt = false;
    @property({
        displayName: "重复长按事件间隔",
        tooltip: "重复长按事件间隔(单位秒)",
        range: [0.05, 10],
        slide: true,
        visible: function () { return (this as ButtonHelper).repeatLongPressEvt }
    })
    repeatDuration = 0.1;
    @property({
        displayName: "忽略点击事件",
        tooltip: "忽略普通的点击事件,只会触发长按事件",
        visible: function () { return (this as ButtonHelper).longPressButton }
    })
    ignoreClickEvt = true;
    @property({
        type: [EventHandler],
        displayName: "长按事件",
        tooltip: "长按触发的事件",
        visible: function () { return (this as ButtonHelper).longPressButton }
    })
    longPressEvt: EventHandler[] = [];


    button: Button;
    isPress = false;
    eParam: ButtonExtendParam = new ButtonExtendParam();

    onLoad() {
        this.button = this.getComponent(Button);
        if (!this.button) {
            console.error(`节点${this.node.name}上没有Button组件`);
            return;
        }

        if (this.polygonButton) {
            let polygon = this.getComponent(PolygonCollider2D);
            if (!polygon) {
                console.error(`节点${this.node.name}上没有PolygonCollider2D组件`);
                return;
            }
            this.eParam.polygon = polygon;
        }

        if (this.longPressButton) {
            this.schedule(this.updateLongPress, 0.02, macro.REPEAT_FOREVER);
        }

        this.eParam.audioLocation = this.disableDefault ? this.audioLocation : ButtonHelper.defaultAuidoLocation;
        this.eParam.cooldown = this.cooldown;
        this.eParam.isPolygonButton = this.polygonButton;
        this.eParam.isLongPressButton = this.longPressButton;
        this.eParam.ignoreClickEvt = this.ignoreClickEvt;
        this.button["_eParam"] = this.eParam;
        this.extendButtonTouchBegan();
    }

    extendButtonTouchBegan() {
        this.button["_onTouchBegan"] = function (event?: EventTouch) {
            if (!this._interactable || !this.enabledInHierarchy) { return; }
            let eParam: ButtonExtendParam = this["_eParam"] || new ButtonExtendParam(ButtonHelper.defaultAuidoLocation);
            this["_eParam"] = eParam;
            eParam.touchBeganTimeMS = Date.now();
            eParam.longPressTimeMS = 0;
            eParam.longPressEvtCount = 0;
            if (eParam.isPolygonButton) {
                let uiWorldPos = event.getUILocation();
                let pos = (this as Button).getComponent(UITransform).convertToNodeSpaceAR(new Vec3(uiWorldPos.x, uiWorldPos.y));
                eParam.isOutOfPolygon = !Intersection2D.pointInPolygon(new Vec2(pos.x, pos.y), eParam.polygon.points);
                if (eParam.isOutOfPolygon) {
                    if (event) {
                        event.propagationStopped = false;
                    }
                } else {
                    this._pressed = true;
                    this._updateState();
                    if (event) {
                        event.propagationStopped = true;
                    }
                }
            } else {
                this._pressed = true;
                this._updateState();
                if (event) {
                    event.propagationStopped = true;
                }
            }
        }
    }

    onLongPress(first = false) {
        if (first) {//第一次触发时,播放按钮音效
            if (this.eParam.audioLocation) App.audio.playEffect(this.eParam.audioLocation);
        }
        EventHandler.emitEvents(this.longPressEvt, null);
        this.node.emit("longPress", this);
        this.eParam.longPressEvtCount++;
    }

    updateLongPress(dt: number) {
        if (!this.longPressButton) return;
        if (!this.button["_pressed"]) return;
        this.eParam.longPressTimeMS += dt;
        let now = Date.now();
        if (this.eParam.longPressEvtCount == 0) {
            if (now >= this.eParam.touchBeganTimeMS + this.longPressDuration * 1000) {
                this.onLongPress(true);
                this.eParam.touchBeganTimeMS = now;
            }
        } else {
            if (!this.repeatLongPressEvt) return;
            if (now >= this.eParam.touchBeganTimeMS + this.repeatDuration * 1000) {
                this.onLongPress();
                this.eParam.touchBeganTimeMS = now;
            }
        }
    }

    /** 默认音效路径 */
    static defaultAuidoLocation: string = "";

    /**
     * 修改原型，针对所有按钮，扩展按钮功能
     */
    static extendButtonTouchEnded() {
        Button.prototype["_onTouchEnded"] = function (event?: EventTouch) {
            if (!this._interactable || !this.enabledInHierarchy) {
                return;
            }
            let eParam: ButtonExtendParam = this["_eParam"] || new ButtonExtendParam(ButtonHelper.defaultAuidoLocation);
            this["_eParam"] = eParam;
            if (this._pressed) {
                if (!eParam.isCooldown && !(eParam.isLongPressButton && eParam.ignoreClickEvt)) {
                    if (eParam.audioLocation) App.audio.playEffect(eParam.audioLocation);
                    EventHandler.emitEvents(this.clickEvents, event);
                    this.node.emit(Button.EventType.CLICK, this);
                    if (eParam.cooldown > 0) {
                        eParam.isCooldown = true;
                        (this as Button).scheduleOnce(() => {
                            eParam.isCooldown = false;
                        }, eParam.cooldown);
                    }
                }
            }

            this._pressed = false;
            this._updateState();

            if (eParam.isPolygonButton && eParam.isOutOfPolygon) {
                if (event) {
                    event.propagationStopped = false;
                }
            } else {

                if (event) {
                    event.propagationStopped = true;
                }
            }
        }
    }
}

class ButtonExtendParam {
    constructor(audioLocation = "", cooldown = 0.2) {
        this.audioLocation = audioLocation;
        this.cooldown = cooldown;
    }

    /** 音效地址 */
    audioLocation = "";

    /** 按钮冷却时间 */
    cooldown = 0;
    /** 按钮是在冷却中 */
    isCooldown = false;

    /** 是否是异形按钮 */
    isPolygonButton = false;
    /** 异形按钮碰撞器 */
    polygon: PolygonCollider2D = null;
    /** 本次触摸不在多边形范围内 */
    isOutOfPolygon = false;

    /** 是否是长按触发按钮 */
    isLongPressButton = false;
    /** 忽略点击事件 */
    ignoreClickEvt = false;
    /** 按钮按下的时间戳 */
    touchBeganTimeMS = 0;
    /** 长按计时 */
    longPressTimeMS = 0;
    /** 长按事件触发次数 */
    longPressEvtCount = 0;

}

ButtonHelper.extendButtonTouchEnded();
