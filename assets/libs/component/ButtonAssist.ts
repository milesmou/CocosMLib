import { AudioMgr, EAudio } from "../utils/AudioMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonAssist extends cc.Component {
    @property({
        displayName: "禁用默认音效",
        tooltip: "选中时，点击按钮不会播放默认音效"
    })
    disableDefault = false;
    @property({
        type: cc.AudioClip,
        displayName: "音效",
        tooltip: "当音效不为null时，点击按钮播放指定的音效",
        visible: function () { return this.disableDefault; }
    })
    audioClip: cc.AudioClip = null;
    @property({
        displayName: "冷却时间",
        tooltip: "点击按钮后，等待多长时间重新启用按钮，单位秒",
        min: 0
    })
    cooldown = 0;
    @property({
        displayName: "多边形按钮",//多边形按钮不能与其它按钮在同一条路径上
        tooltip: "按钮是否是多边形按钮，当前节点上必须有PolygonCollider组件，且多边形应在节点矩形范围内",
        visible: function () { return this.getComponent(cc.PolygonCollider) }
    })
    polygonButton = false;
    button: cc.Button = null;

    onLoad() {
        this.button = this.getComponent(cc.Button);
        let polygon = this.getComponent(cc.PolygonCollider);
        if (this.button) {
            this.button["disableDefault"] = this.disableDefault;
            this.node.on("click", this.onClick, this);
        } else {
            console.warn(`节点${this.node.name}上没有Button组件`);
        }
        if (this.button && this.polygonButton && polygon) {
            this.button["_onTouchBegan"] = function (event) {
                let pos = this.node.convertToNodeSpaceAR(event.getLocation());
                if (!this.interactable || !this.enabledInHierarchy) return;
                if (cc.Intersection.pointInPolygon(pos, polygon.points)) {
                    this._pressed = true;
                    this._updateState();
                    event.stopPropagation();
                    this.outOfPolygon = false;
                } else {
                    this.outOfPolygon = true;
                }
            }
        }
    }

    start() {
        //多边形按钮关闭触摸吞噬 当触摸点不在多边形内继续冒泡触摸事件
        if (this.polygonButton) {
            this.node['_touchListener'].swallowTouches = false;
        }
    }

    onClick() {
        if (this.disableDefault && this.audioClip) {
            AudioMgr.Inst.playEffect(this.audioClip);
        }
        this.button.interactable = false;
        this.scheduleOnce(() => {
            this.button.interactable = true;
        }, this.cooldown);
    }

    /**
     * 修改原型，针对所有按钮，不需要将该组件挂在Button节点上同样有效
     * 为按钮增加播放点击音效，button["disableDefault"]=true时不会播放默认音效
     */
    public static enableDefaultEffect() {
        cc.Button.prototype["_onTouchEnded"] = function (event) {
            if (!this.interactable || !this.enabledInHierarchy) return;
            if (this._pressed) {
                if (!this.disableDefault) {//默认音效是否被禁用
                    AudioMgr.Inst.playEffect(EAudio.E_CLICK);
                }
                cc.Component.EventHandler.emitEvents(this.clickEvents, event);
                this.node.emit('click', this);
            }
            this._pressed = false;
            this._updateState();
            if (!this.outOfPolygon) {//触摸点不在多边形内继续冒泡触摸事件
                event.stopPropagation();
            }
        }
    }
}
ButtonAssist.enableDefaultEffect();//引擎加载后立即执行
