import { Animation, BlockInputEvents, Button, Color, Enum, Layers, Node, Sprite, UIOpacity, UITransform, _decorator, js, tween, view } from "cc";
const { property, ccclass, requireComponent } = _decorator;

import { EventKey } from "../../../../scripts/base/GameEnum";
import { App } from "../../../App";
import { AssetHandler } from "../../../component/AssetHandler";
import { CCUtils } from "../../../utils/CCUtil";
import { MEvent } from "../../event/MEvent";
import { MLogger } from '../../logger/MLogger';
import { GenProperty } from "../property/GenProperty";
import { PropertyBase } from "../property/PropertyBase";

const EUIAnim = Enum({
    NONE: 0,
    OPEN: 1,
    CLOSE: 2,
    BOTH: 3
})

export enum EPassiveType {
    ShowBegin,
    Show,
    HideBegin,
    Hide,
}

@ccclass("UIBase")
@requireComponent(UIOpacity)
export  class UIBase extends GenProperty {
    @property({
        displayName: "销毁",
        tooltip: "UI关闭时销毁"
    })
    destroyNode = false;
    @property({
        displayName: "遮罩",
        tooltip: "是否在UI下层显示半透明遮罩"
    })
    showShade = false;
    @property({
        displayName: "全屏",
        tooltip: "有时需要根据是弹窗还是全屏UI来判断是否显示或隐藏下层UI"
    })
    fullScreen = false;
    @property({
        displayName: "自动隐藏",
        tooltip: "被全屏UI覆盖时,是否隐藏界面,降低DC"
    })
    autoHide = false;

    @property({
        displayName: "阻塞输入事件",
        tooltip: "是否阻塞所有的输入事件向下层传递"
    })
    blockInputEvent = true;

    @property({
        type: EUIAnim,
        displayName: "动画",
        tooltip: "是否启用UI打开和关闭动画"
    })
    action = EUIAnim.NONE;
    @property({
        type: Button,
        displayName: "关闭按钮",
        tooltip: "自动为按钮绑定UI关闭事件"
    })
    closeBtn: Button = null;

    public uiName: string = null;
    protected animation: Animation;
    private shadeNode: Node;

    private _isAnimEnd = true;
    public get isAnimEnd() { return this._isAnimEnd; }
    public onAnimEnd: MEvent = new MEvent();

    protected visible: boolean;
    protected args: any = null;

    protected assetHandler: AssetHandler;

    protected onLoad(): void {
        this.assetHandler = new AssetHandler(this.node);
    }

    /** 初始化UI，在子类重写该方法时，必须调用super.init() */
    public init(uiName: string) {
        if (this.uiName) return;
        this.uiName = uiName;

        if (this.showShade) this.initShade();
        if (this.autoHide) this.enableAutoHide();
        if (this.blockInputEvent) this.addComponent(BlockInputEvents);

        this.closeBtn && this.closeBtn.node.on("click", this.safeClose, this);
        this.animation = this.getComponent(Animation) || CCUtils.getComponentInChildren(this.node, Animation);

        this.getComponentsInChildren(Button).forEach(v => v.node.on("click", this.onClickButton.bind(this, v.node.name)));
    }

    private initShade() {
        if (this.node.children[0].name == "shade") {
            this.shadeNode = this.node.children[0];
        } else {
            let shade = new Node("shade");
            shade.parent = this.node;
            shade.setSiblingIndex(0);
            let imgNode = new Node("img");
            imgNode.layer = Layers.Enum.UI_2D;
            imgNode.parent = shade;
            imgNode.addComponent(UITransform).setContentSize(view.getVisibleSize());
            imgNode.addComponent(UIOpacity).opacity = 150;
            let sp = imgNode.addComponent(Sprite);
            sp.spriteFrame = App.ui.defaultSprite;
            sp.color = Color.BLACK;
        }
    }


    public setArgs(args: any) {
        this.args = args;
    }

    public setVisible(visible: boolean) {
        this.visible = visible;
        if (visible) {
            this.getComponent(UIOpacity).opacity = 255;
            this.node.active = true;
        } else {
            this.getComponent(UIOpacity).opacity = 0;
        }
    }

    /* 被全屏UI挡住时 隐藏界面 降低dc */
    private enableAutoHide() {
        App.event.on(EventKey.OnUIShow, (ui: UIBase) => {
            if (this?.isValid) {
                if (ui != this && ui.fullScreen && App.ui.isUIBeCover(this) && App.ui.isUIInStack(this)) this.setVisible(false);
            }
            else {
                App.event.offByTag(EventKey.OnUIHideBegin, this.uiName);
            }
        }, null, this.uiName);
        App.event.on(EventKey.OnUIHideBegin, (ui: UIBase) => {
            if (this?.isValid) {
                if (!App.ui.isUIBeCover(this) && App.ui.isUIInStack(this)) this.setVisible(true);
            }
            else {
                App.event.offByTag(EventKey.OnUIHideBegin, this.uiName);
            }
        }, null, this.uiName);
    }

    public playShowAnim() {
        this._isAnimEnd = false;
        let p = new Promise<void>((resovle, reject) => {
            let callback = () => {
                this._isAnimEnd = true;
                this.onAnimEnd.dispatch();
                resovle();
            };
            if (Boolean(this.action & EUIAnim.OPEN)) {
                if (this.animation) {//播放指定动画
                    let clip = this.animation.clips[0];
                    App.ui.blockTime = clip.duration + 0.1;
                    if (clip) {
                        this.animation.stop();
                        this.animation.once(Animation.EventType.FINISHED, callback);
                        this.animation.play(clip.name);
                        if (this.shadeNode) {
                            let uiOpacity = this.shadeNode.getComponent(UIOpacity);
                            uiOpacity.opacity = 0;
                            tween(uiOpacity).to(clip.duration, { opacity: 255 }).start();
                        }
                    } else {
                        MLogger.warn(this.node.name, "无UI打开动画文件");
                        callback();
                    }
                } else {
                    callback();
                }
            } else {
                callback();
            }
        })
        return p;
    }

    public playHideAnim() {
        this._isAnimEnd = false;
        let p = new Promise<boolean>((resovle, reject) => {
            let callback = () => {
                this._isAnimEnd = true;
                this.onAnimEnd.dispatch();
                resovle(true);
            };
            if (Boolean(this.action & EUIAnim.CLOSE)) {
                if (this.animation) {//播放指定动画
                    let clip = this.animation.clips[1];
                    if (clip) {
                        this.animation.stop();
                        this.animation.once(Animation.EventType.FINISHED, callback);
                        this.animation.play(clip.name);
                        if (this.shadeNode) {
                            let uiOpacity = this.shadeNode.getComponent(UIOpacity);
                            tween(uiOpacity).to(clip.duration, { opacity: 0 }).start();
                        }
                    } else {
                        MLogger.warn(this.node.name, "无UI关闭动画文件");
                        callback();
                    }
                } else {
                    callback();
                }
            } else {
                callback();
            }
        });
        return p;
    }

    /** 关闭UI时调用此方法 */
    protected safeClose() {
        App.ui.hide(this.uiName);
    }

    protected onClickButton(btnName: string) {

    }

    /** UI准备打开时触发 (UI打开动画播放前) */
    public onShowBegin() { }

    /** UI准备关闭时触发 (UI关闭动画播放前) */
    public onHideBegin() { }

    /** UI完全打开时触发 (UI打开动画播放完) */
    public onShow() { }

    /** UI完全关闭时触发 (UI关闭动画播放完) */
    public onHide() { }

    /** 因为其它UI，被动的显示和隐藏 */
    public onPassive(passiveType: EPassiveType, ui: UIBase) { }
}