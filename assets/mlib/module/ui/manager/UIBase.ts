import { Animation, BlockInputEvents, Node, Sprite, UIOpacity, _decorator, color, tween } from "cc";
const { property, ccclass, requireComponent } = _decorator;

import { js } from "cc";
import { CCUtils } from "../../../utils/CCUtil";
import { AssetComponent } from "../../asset/AssetComponent";
import { EventMgr } from "../../event/EventMgr";
import { EUIFormAnim } from "./EUIFormAnim";
import { UIForm } from "./UIForm";
import { UIMgr } from "./UIMgr";


@ccclass("UIBase")
export class UIBase extends UIForm {
    private _uiName: string;
    public get uiName(): string { return this._uiName; }
    private _shortName: string;
    public get shortName(): string { return this._shortName; }

    private _shadeNode: Node;

    private _isAnimEnd = true;
    public get isAnimEnd() { return this._isAnimEnd; }

    protected __preload(): void {
        this.ensureComponent(AssetComponent);
        this.ensureComponent(UIOpacity);
        super.__preload();
    }

    /** 初始化UI，只会执行一次，在子类重写该方法时，必须调用super.init() */
    public init(uiName: string) {
        if (this._uiName) return;
        this._uiName = uiName;
        this._shortName = uiName.substring(uiName.lastIndexOf("/") + 1);

        if (this.showShade) this.initShade();
        if (this.autoHide) this.enableAutoHide();
        if (this.blockInputEvent) this.addComponent(BlockInputEvents);

        this.closeBtn && this.closeBtn.onClick.addListener(this.safeClose, this);
        this.animation = this.getComponent(Animation) || CCUtils.getComponentInChildren(this.node, Animation);
    }

    private initShade() {
        if (this.node.children[0].name == "shade") {
            this._shadeNode = this.node.children[0];
            this._shadeNode.ensureComponent(UIOpacity);
        } else {
            this._shadeNode = CCUtils.createUINode("shade");
            this._shadeNode.parent = this.node;
            this._shadeNode.addComponent(UIOpacity);
            this._shadeNode.setSiblingIndex(0);
            this._shadeNode.matchParent();
            let imgNode = CCUtils.createUINode("img");
            imgNode.parent = this._shadeNode;
            let sp = imgNode.addComponent(Sprite);
            sp.sizeMode = Sprite.SizeMode.CUSTOM;
            sp.spriteFrame = UIMgr.Inst.defaultSprite;
            sp.color = color(0, 0, 0, UIMgr.Inst.shadeOpacity);
            imgNode.matchParent();

        }
    }


    public setArgs(args: any) {
        this.args = args;
    }

    public setVisible(visible: boolean) {
        this.visible = visible;
        let uiOpacity = this.getComponent(UIOpacity);
        if (visible) {
            this.node.active = true;
            this.node.setScale(1, 1);
            uiOpacity.opacity = 255;
        } else {
            this.node.setScale(0, 0);
            uiOpacity.opacity = 0;
        }
    }

    /* 被全屏UI挡住时 隐藏界面 降低dc */
    private enableAutoHide() {
        let listenToHide = (ui: UIBase) => {
            if (this?.isValid) {
                if (ui != this && ui.fullScreen && UIMgr.Inst.isUIBeCover(this) && UIMgr.Inst.isUIInStack(this)) this.setVisible(false);
            } else {
                EventMgr.off(mEventKey.OnUIShow, listenToHide);
            }
        }
        EventMgr.on(mEventKey.OnUIShow, listenToHide);

        let listenToShow = (ui: UIBase) => {
            if (this?.isValid) {
                if (!UIMgr.Inst.isUIBeCover(this) && UIMgr.Inst.isUIInStack(this)) this.setVisible(true);
            }
            else {
                EventMgr.off(mEventKey.OnUIHideBegin, listenToShow);
            }
        }
        EventMgr.on(mEventKey.OnUIHideBegin, listenToShow);
    }

    public playShowAnim() {
        this._isAnimEnd = false;
        let p = new Promise<void>((resovle, reject) => {
            let callback = () => {
                this._isAnimEnd = true;
                resovle();
            };
            if (Boolean(this.action & EUIFormAnim.OPEN)) {
                if (this.animation) {//播放指定动画
                    let clip = this.animation.clips[0];
                    UIMgr.Inst.blockTime = clip.duration + 0.1;
                    if (clip) {
                        this.animation.stop();
                        this.animation.once(Animation.EventType.FINISHED, callback);
                        this.animation.play(clip.name);
                        if (this._shadeNode) {
                            let uiOpacity = this._shadeNode.getComponent(UIOpacity);
                            uiOpacity.opacity = 0;
                            tween(uiOpacity).to(clip.duration, { opacity: 255 }).start();
                        }
                    } else {
                        mLogger.warn(this.node.name, "无UI打开动画文件");
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
        let p = new Promise<void>((resovle, reject) => {
            let callback = () => {
                this._isAnimEnd = true;
                resovle();
            };
            if (Boolean(this.action & EUIFormAnim.CLOSE)) {
                if (this.animation) {//播放指定动画
                    let clip = this.animation.clips[1];
                    if (clip) {
                        this.animation.stop();
                        this.animation.once(Animation.EventType.FINISHED, callback);
                        this.animation.play(clip.name);
                        if (this._shadeNode) {
                            let uiOpacity = this._shadeNode.getComponent(UIOpacity);
                            tween(uiOpacity).to(clip.duration, { opacity: 0 }).start();
                        }
                    } else {
                        mLogger.warn(this.node.name, "无UI关闭动画文件");
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

    public release() {
        this.asset.decRefAll();
    }

    /** 关闭UI时调用此方法 */
    protected safeClose() {
        UIMgr.Inst.hide(this._uiName);
    }
}