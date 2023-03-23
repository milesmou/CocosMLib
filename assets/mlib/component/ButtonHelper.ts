import { _decorator, Component, AudioClip, PolygonCollider2D, Button, EventTouch, Intersection2D, EventHandler } from 'cc';
const { ccclass, property } = _decorator;

import { app } from "../App";

@ccclass('ButtonHelper')
export class ButtonHelper extends Component {
    @property({
        displayName: "禁用默认音效",
        tooltip: "选中时，点击按钮不会播放默认音效"
    })
    disableDefault = false;
    @property({
        type: AudioClip,
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

    button!: Button;

    onLoad() {
        this.button = this.getComponent(Button)!;
        let polygon = this.getComponent(PolygonCollider2D);
        if (this.button) {
            (this.button as any)["disableDefault"] = this.disableDefault;
            this.node.on("click", this.onClick, this);
        } else {
            console.warn(`节点${this.node.name}上没有Button组件`);
        }
        if (this.button && this.polygonButton && polygon) {
            (this.button as any)["_onTouchBegan"] = function (event: EventTouch) {
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
        if (this.disableDefault && this.audioLocation) {
            app.audio.playEffect(this.audioLocation);
        }
        if (this.cooldown > 0 && !(this as any).isCooldown)
            (this as any).isCooldown = true;
        this.scheduleOnce(() => {
            (this as any).isCooldown = false;
        }, this.cooldown);
    }

    /**
     * 修改原型，针对所有按钮，不需要将该组件挂在Button节点上同样有效
     * 为按钮增加播放点击音效，button["disableDefault"]=true时不会播放默认音效
     */
    static enableDefaultEffect() {
        Button.prototype["_onTouchEnded"] = function (event: EventTouch) {
            if (!this.interactable || !this.enabledInHierarchy) return;
            if ((this as any)._pressed) {
                if (!(this as any).disableDefault) {//默认音效是否被禁用
                    app.audio.playEffect("audioLocation");
                }
                if (!(this as any).isCooldown) {
                    EventHandler.emitEvents(this.clickEvents, event);
                    this.node.emit('click', this);
                }
            }
            (this as any)._pressed = false;
            (this as any)._updateState();
            if (!(this as any).outOfPolygon) {//触摸点不在多边形内继续冒泡触摸事件
                event.propagationStopped = false;
            }
        }
    }
}

// ButtonHelper.enableDefaultEffect();
