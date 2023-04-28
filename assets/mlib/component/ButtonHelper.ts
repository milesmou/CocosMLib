import { Button, Component, EventHandler, EventTouch, Intersection2D, PolygonCollider2D, _decorator } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

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
        visible: function () { return (this as any).disableDefault; }
    })
    audioLocation = "";
    @property({
        displayName: "冷却时间",
        tooltip: "点击按钮后，等待多长时间重新启用按钮，单位秒",
        min: 0
    })
    cooldown = 0;
    @property({
        displayName: "多边形按钮",//多边形按钮不能与其它按钮在同一条路径上
        tooltip: "按钮是否是多边形按钮，当前节点上必须有PolygonCollider组件，且多边形应在节点矩形范围内",
        visible: function () { return (this as any).getComponent(PolygonCollider2D) }
    })
    polygonButton = false;

    button: Button;

    /** 按钮是在冷却中 */
    isCooldown = false;
    /** 触摸点不在多边形范围内 */
    isOutOfPolygon = false;

    onLoad() {
        this.button = this.getComponent(Button);
        if (!this.button) {
            console.warn(`节点${this.node.name}上没有Button组件`);
            return;
        }
        this.button["_helper"] = this;
        let polygon = this.getComponent(PolygonCollider2D);
        this.node.on(Button.EventType.CLICK, this.onClick, this);
        if (this.polygonButton && polygon) {
            this.button["_onTouchBegan"] = function (event: EventTouch) {
                let pos = this.node.convertToNodeSpaceAR(event.getLocation());
                if (!this.interactable || !this.enabledInHierarchy) return;
                if (Intersection2D.pointInPolygon(pos, polygon!.points)) {
                    this._pressed = true;
                    this._updateState();
                    event.propagationStopped = true;
                    this.outOfPolygon = false;
                } else {
                    this.outOfPolygon = true;
                }
            }
        }
    }

    onEnable() {
        //多边形按钮关闭触摸吞噬 当触摸点不在多边形内继续冒泡触摸事件
        if (this.polygonButton) {
            //  this.node['_touchListener'].swallowTouches = false;//每次激活都要设置一次
        }
    }

    onClick() {
        if (this.disableDefault) {
            if (this.audioLocation) App.audio.playEffect(this.audioLocation);
        }
        if (this.cooldown > 0 && this.isCooldown)
            this.isCooldown = true;
        this.scheduleOnce(() => {
            this.isCooldown = false;
        }, this.cooldown);
    }

    /** 默认音效路径 */
    static defaultAuidoLocation: string = "";

    /**
     * 修改原型，针对所有按钮，扩展按钮功能
     */
    static extendButton() {
        let self: Button;
        let helper: ButtonHelper;
        Button.prototype["_onTouchEnded"] = function (event?: EventTouch) {
            self = this;
            helper = this["_helper"];
            if (!self.interactable || !self.enabledInHierarchy) return;
            if (this["_pressed"]) {
                if (!helper?.isCooldown) {
                    if (!helper?.disableDefault && ButtonHelper.defaultAuidoLocation) {//默认音效是否被禁用
                        App.audio.playEffect(ButtonHelper.defaultAuidoLocation);
                    }
                    EventHandler.emitEvents(self.clickEvents, event);
                    this.node.emit('click', this);
                }
            }

            this["_pressed"] = false;
            this["_updateState"]();

            if (event) {
                if (helper?.polygonButton && !helper?.isOutOfPolygon) {//触摸点不在多边形内继续冒泡触摸事件
                    event.propagationStopped = false;
                } else {
                    event.propagationStopped = true;
                }
            }

        }
    }
}

ButtonHelper.extendButton();
