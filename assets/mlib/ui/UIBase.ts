import { Animation, BlockInputEvents, Button, color, Enum, Layers, Node, Sprite, tween, UIOpacity, UITransform, Widget, _decorator } from 'cc';
const { property, ccclass, requireComponent } = _decorator;

import { app } from "../App";
import { AssetMgr } from '../manager/AssetMgr';
import { CCUtils } from '../utils/CCUtil';
import { Utils } from '../utils/Utils';
import { AssetHandler } from './AssetHandler';
const EUIAnim = Enum({
    NONE: 0,
    OPEN: 1,
    CLOSE: 2,
    BOTH: 3
})

@ccclass('UIBase')
@requireComponent([UIOpacity, Widget])
export class UIBase extends AssetHandler {
    @property({
        displayName: "销毁",
        tooltip: "UI关闭时是否销毁"
    })
    destroyNode = false;
    @property({
        displayName: "遮罩",
        tooltip: "是否在UI下层显示半透明遮罩"
    })
    showShade = false;
    @property({
        displayName: "全屏",
        tooltip: "有时需要根据是弹窗还是全屏UI来判断是否隐藏下层UI,和触发UI的显示隐藏事件"
    })
    fullScreen = false;
    @property({
        displayName: "自动隐藏",
        tooltip: "被全屏UI覆盖时,是否隐藏界面,降低DC"
    })
    autoHide = false;
    @property({
        displayName: "监听显隐",
        tooltip: "监听界面因其它界面的打开关闭造成的显隐情况\n从当前界面打开新的UI界面时,会触发onHideBegin、onHide方法\n关闭它的上层UI界面回到此界面时,会触发onShowBegin、onShow方法"
    })
    listenVisible = false;

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

    public transform: UITransform;
    public uiName: string = null;
    protected animation: Animation;
    private uiOpacity: UIOpacity;
    private shadeOpacity: UIOpacity;

    private _isAnimEnd = false;
    public get isAnimEnd() { return this._isAnimEnd; }
    protected args: any = null;

    onDestroy() {
        super.onDestroy();
        AssetMgr.DecRef(this.uiName);
    }

    /** 初始化UI，在子类重写该方法时，必须调用super.init() */
    init(uiName: string) {
        if (this.uiName) return;
        this.uiName = uiName;
        this.transform = this.getComponent(UITransform);
        this.uiOpacity = this.getComponent(UIOpacity);

        Utils.uiNodeMatchParent(this.node);

        if (this.showShade) this.initShade();
        if (this.autoHide) this.enableAutoHide();
        if (this.listenVisible) this.enableListenVisible();
        if (this.blockInputEvent) this.addComponent(BlockInputEvents);

        this.closeBtn && this.closeBtn.node.on("click", this.safeClose, this);
        this.animation = CCUtils.getComponentInChildren(this.node, Animation);
    }

    private initShade() {
        if (this.node.children[0].name == "shade") {
            this.shadeOpacity = this.node.children[0].getComponent(UIOpacity);
        } else {
            let n = new Node("shade");
            n.addComponent(UITransform);
            Utils.uiNodeMatchParent(n);
            let sp = n.addComponent(Sprite);
            sp.spriteFrame = app.ui.whiteSplash;
            sp.color = color(0, 0, 0, 150);
            this.shadeOpacity = n.addComponent(UIOpacity);
            n.layer = this.node.layer;
            n.parent = this.node;
            n.setSiblingIndex(0);
        }
    }


    setArgs(args: any) {
        this.args = args;
    }

    setVisible(visible: boolean) {
        if (visible) {
            this.uiOpacity.opacity = 255;
            this.node.active = true;
        } else {
            this.uiOpacity.opacity = 0;
        }
    }

    /* 被全屏UI挡住时 隐藏界面 降低dc */
    private enableAutoHide() {
        app.event.on(app.eventKey.OnUIShow, (ui: UIBase) => {
            if (this?.isValid) {
                if (ui != this && ui.fullScreen && app.ui.isUIBeCover(this) && app.ui.isUIInStack(this)) this.setVisible(false);
            }
            else {
                app.event.offByTag(app.eventKey.OnUIHideBegin, this.uiName);
            }
        }, null, this.uiName);
        app.event.on(app.eventKey.OnUIHideBegin, (ui: UIBase) => {
            if (this?.isValid) {
                if (!app.ui.isUIBeCover(this) && app.ui.isUIInStack(this)) this.setVisible(true);
            }
            else {
                app.event.offByTag(app.eventKey.OnUIHideBegin, this.uiName);
            }
        }, null, this.uiName);
    }

    /* 监听因其它界面的打开关闭而影响界面的显隐情况 */
    private enableListenVisible() {
        //监听显示
        app.event.on(app.eventKey.OnUIHideBegin, (ui: UIBase) => {
            if (this) {
                if (app.ui.isTopUI(this.uiName) && ui.fullScreen) {
                    this.onShowBegin();
                    this._isAnimEnd = false;
                }
            }
            else {
                app.event.offByTag(app.eventKey.OnUIHideBegin, this.uiName);
            }
        }, null, this.uiName);
        app.event.on(app.eventKey.OnUIHide, (ui: UIBase) => {
            if (this) {
                if (app.ui.isTopUI(this.uiName) && ui.fullScreen) {
                    this.onShow();
                    this._isAnimEnd = true;
                }
            }
            else {
                app.event.offByTag(app.eventKey.OnUIHide, this.uiName);
            }
        }, null, this.uiName);
        //监听隐藏
        app.event.on(app.eventKey.OnUIShowBegin, (ui: UIBase) => {
            if (this) {
                if (app.ui.getUIIndex(this.uiName) == 1 && ui.fullScreen) {
                    this.onHideBegin();
                    this._isAnimEnd = false;
                }
            }
            else {
                app.event.offByTag(app.eventKey.OnUIShowBegin, this.uiName);
            }
        }, null, this.uiName);
        app.event.on(app.eventKey.OnUIShow, (ui: UIBase) => {
            if (this) {
                if (app.ui.getUIIndex(this.uiName) == 1 && ui.fullScreen) {
                    this.onHide();
                    this._isAnimEnd = true;
                }
            }
            else {
                app.event.offByTag(app.eventKey.OnUIShow, this.uiName);
            }
        }, null, this.uiName);
    }

    playShowAnim() {
        let p = new Promise<void>((resovle, reject) => {
            let callback = () => {
                this._isAnimEnd = true;
                resovle();
            };
            if (Boolean(this.action & EUIAnim.OPEN)) {
                if (this.animation) {//播放指定动画
                    let clip = this.animation.clips[0];
                    app.ui.blockTime = clip.duration + 0.1;
                    if (clip) {
                        this.animation.stop();
                        this.animation.once("finished" as any, callback);
                        this.animation.play(clip.name);
                        if (this.shadeOpacity) {
                            this.shadeOpacity.opacity = 0;
                            tween(this.shadeOpacity).to(clip.duration, { opacity: 255 }).start();
                        }
                    } else {
                        console.warn(this.node.name, "无UI打开动画文件");
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

    playHideAnim() {
        this._isAnimEnd = false;
        let p = new Promise<boolean>((resovle, reject) => {
            let callback = () => {
                this._isAnimEnd = true;
                resovle(true);
            };
            if (Boolean(this.action & EUIAnim.CLOSE)) {
                if (this.animation) {//播放指定动画
                    let clip = this.animation.clips[1];
                    if (clip) {
                        this.animation.stop();
                        this.animation.once("finished" as any, callback);
                        this.animation.play(clip.name);
                        if (this.shadeOpacity) tween(this.shadeOpacity).to(clip.duration, { opacity: 0 }).start();
                    } else {
                        console.warn(this.node.name, "无UI关闭动画文件");
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
    safeClose() {
        app.ui.hide(this.uiName);
    }

    /** UI准备打开时触发 (UI打开动画播放前) */
    onShowBegin() { }

    /** UI准备关闭时触发 (UI关闭动画播放前) */
    onHideBegin() { }

    /** UI完全打开时触发 (UI打开动画播放完) */
    onShow() { }

    /** UI完全关闭时触发 (UI关闭动画播放完) */
    onHide() { }
}