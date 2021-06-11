import { app } from "../App";

const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Button)
export default class ButtonHelper extends cc.Component {
    @property({
        displayName: "默认音效",
        tooltip: "选中时按钮点击播放默认音效"
    })
    defaultEffect = true;
    @property({
        type: cc.AudioClip,
        displayName: "音效",
        tooltip: "当关闭默认音效时，点击按钮播放此音效",
        visible: function () { return !this.defaultEffect }
    })
    audioClip: cc.AudioClip = null;
    @property({
        displayName: "冷却时间",
        tooltip: "点击按钮后，等待多长时间重新启用按钮，单位秒",
        min: 0
    })
    cooldown = 0;
    @property({
        displayName: "多边形按钮",
        tooltip: "按钮是否是多边形按钮，当前节点上必须有PolygonCollider组件，且多边形应在节点矩形范围内",
        visible: function () { return this.getComponent(cc.PolygonCollider) }
    })
    polygonButton = false;
    @property({
        displayName: "长按",
        tooltip: "启用长按监听"
    })
    longPress = false;
    @property({
        displayName: "长按时长",
        tooltip: "按压多长时间判断为长按(单位:秒)",
        range: [0.1, 10],
        slide: true,
        visible: function () { return this.longPress }
    })
    longPressDur = 1;
    @property({
        displayName: "长按事件",
        tooltip: "长按回调事件",
        type: cc.Component.EventHandler,
        visible: function () { return this.longPress }
    })
    longPressEvents: cc.Component.EventHandler[] = [];

    button: cc.Button = null;

    onLoad() {
        this.button = this.getComponent(cc.Button);
        let polygon = this.getComponent(cc.PolygonCollider);

        this.button["defaultEffect"] = this.defaultEffect;
        this.button["polygonButton"] = this.polygonButton;
        this.button["polygon"] = polygon;
        this.button["longPress"] = this.longPress;
        this.button["longPressDur"] = this.longPressDur;
        this.button["longPressEvents"] = this.longPressEvents;

        this.node.on("click", this.onClickOrLongPress, this);
        this.node.on("longPress", this.onClickOrLongPress, this);
    }

    onEnable() {
        //多边形按钮关闭触摸吞噬 当触摸点不在多边形内继续冒泡触摸事件
        if (this.polygonButton) {
            this.node['_touchListener'].swallowTouches = false;//每次激活都要设置一次
        }
    }

    onClickOrLongPress() {
        if (!this.defaultEffect && this.audioClip) {
            app.audio.playEffect(this.audioClip);
        }
        if (this.cooldown > 0 && !this.button["isCooldown"]) {
            this.button["isCooldown"] = true;
            this.scheduleOnce(() => {
                this.button["isCooldown"] = false;
            }, this.cooldown);
        }
    }

    update(dt) {
        if (this.button["longPress"] && this.button["isPressing"]) {
            this.button["pressDur"] += dt;
            if (this.button["pressDur"] > this.button["longPressDur"]) {//长按
                this.button["isPressing"] = false;
                if (this.button["defaultEffect"]) {//默认音效
                    app.audio.playEffect(app.audioKey.E_CLICK);
                }
                cc.Component.EventHandler.emitEvents(this.button["longPressEvents"], this.button["longPressEvt"]);
                this.node.emit('longPress', this);
                this.button["_pressed"] = false;
                this.button["_updateState"]();
            }
        }
    }

    /**
     * 修改原型，针对所有按钮，不需要将该组件挂在Button节点上同样有效
     */
    static modifyButtonPrototype() {
        cc.Button.prototype["_onTouchBegan"] = function (event) {
            if (!this.interactable || !this.enabledInHierarchy) return;
            this.isPressing = true;//press开始
            this.pressDur = 0;//统计press时间
            this.longPressEvt = event;
            if (this.polygonButton && this.polygon) {//多边形按钮
                let pos = this.node.convertToNodeSpaceAR(event.getLocation());
                if (cc.Intersection.pointInPolygon(pos, this.polygon.points)) {
                    this.inPolygonArea = true;
                    this._pressed = true;
                    this._updateState();
                    event.stopPropagation();
                } else {
                    this.inPolygonArea = false;
                }
            } else {
                this._pressed = true;
                this._updateState();
                event.stopPropagation();
            }
        }

        cc.Button.prototype["_onTouchEnded"] = function (event) {
            if (!this.interactable || !this.enabledInHierarchy) return;
            if (this._pressed) {
                if (this.defaultEffect) {//默认音效
                    app.audio.playEffect(app.audioKey.E_CLICK);
                }
                if (!this.isCooldown) {
                    if (!this.polygonButton || (this.polygonButton && this.inPolygonArea)) {
                        if (this.isPressing) {//本次press未结束
                            this.isPressing = false;
                            cc.Component.EventHandler.emitEvents(this.clickEvents, event);
                            this.node.emit('click', this);
                        }
                    }
                }
            }
            this._pressed = false;
            this._updateState();
            if (this.inPolygonArea) {//触摸点在多边形内停止冒泡触摸事件
                event.stopPropagation();
            }
        }
    }
}
ButtonHelper.modifyButtonPrototype();
