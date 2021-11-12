import { app } from "../App";
import IComponent from "../component/IComponent";

const { property, ccclass } = cc._decorator;

const EAction = cc.Enum({
    NONE: 0,
    OPEN: 1,
    CLOSE: 2,
    BOTH: 3
})

@ccclass
export default class UIBase extends IComponent {
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
        tooltip: "有时需要根据是弹窗还是全屏UI来判断是否隐藏下层UI"
    })
    isFullScreen = false;
    @property({
        displayName: "自动隐藏",
        tooltip: "被全屏UI覆盖时,是否将透明度设置为0,降低DC"
    })
    autoHide = false;
    @property({
        displayName: "监听显隐",
        tooltip: "监听界面因其它界面的打开关闭造成的显隐情况\n\n从当前界面打开新的UI界面时,会触发onHideBegin、onHide方法\n\n关闭它的上层UI界面回到此界面时,会触发onShowBegin、onShow方法"
    })
    listenVisible = false;
    @property({
        type: cc.Integer,
        displayName: "显示动画延迟",
        tooltip: "关闭其它回到当前界面(onShowBegin)时,延迟多久播放UI的打开动画(小于0表示不播放动画)",
        visible: function () { return this.listenVisible && (this.action & EAction.OPEN) != 0 }
    })
    showAnimDur = -1;
    @property({
        type: cc.Integer,
        displayName: "隐藏动画延迟",
        tooltip: "从当前界面打开新的UI界面时,此界面被覆盖(onHideBegin)时,延迟多久播放UI的关闭动画(小于0表示不播放动画)",
        visible: function () { return this.listenVisible && (this.action & EAction.CLOSE) != 0 }
    })
    hideAnimDur = -1;
    @property({
        displayName: "阻塞输入事件",
        tooltip: "是否阻塞所有的输入事件向下层传递"
    })
    blockInputEvent = true;
    @property({
        type: EAction,
        displayName: "动画",
        tooltip: "是否启用UI打开和关闭动画"
    })
    action = EAction.NONE;
    @property({
        type: cc.Button,
        displayName: "关闭按钮",
        tooltip: "自动为按钮绑定UI关闭事件"
    })
    closeBtn: cc.Button = null;

    public uiName: any = null;
    protected uiAnim: cc.Animation = null;
    protected args: any = null;

    /** 初始化UI，在子类重写该方法时，必须调用super.init() */
    init(uiName: string) {
        if (this.uiName) return;
        this.uiName = uiName;
        this.autoHide && this.enableAutoHide();
        this.listenVisible && this.enableListenVisible();
        this.blockInputEvent && this.node.addComponent(cc.BlockInputEvents);
        this.closeBtn && this.closeBtn.node.on("click", this.safeClose, this);
        this.uiAnim = this.getComponent(cc.Animation);
        this.getComponentsInChildren(cc.Button).forEach(v => v.node.on("click", () => { this.onClickButton(v.node.name); }))
    }

    setArgs(args: any) {
        this.args = args;
    }

    setVisible(visible: boolean) {
        if (visible) {
            this.node.active = true;
            this.setOpacity(255);
        } else {
            this.setOpacity(0);
        }
    }

    setOpacity(value: number) {
        this.node.opacity = value;
    }

    setActive(value: boolean) {
        this.node.active = value;
    }

    /** 被全屏UI挡住时 将UI透明度设置为0 降低dc */
    enableAutoHide() {
        let onUIShow = (ui: UIBase) => {
            if (!this?.isValid) {
                app.event.off(app.eventKey.OnUIShow, onUIShow)
                return;
            }
            if (ui != this && ui.isFullScreen) {
                this.node.opacity = 0;
            }
        }
        app.event.on(app.eventKey.OnUIShow, onUIShow)
        let onUIHideBegin = () => {
            if (!this?.isValid) {
                app.event.off(app.eventKey.OnUIHideBegin, onUIHideBegin)
                return;
            }
            if (!app.ui.isUIBeCover(this)) {
                this.node.opacity = 255;
            }
        }
        app.event.on(app.eventKey.OnUIHideBegin, onUIHideBegin);
    }

    /** 监听因其它界面的打开关闭而影响界面的显隐情况 */
    enableListenVisible() {
        //监听显示
        let onUIHideBegin = (ui: UIBase) => {
            if (!this?.isValid) {
                app.event.off(app.eventKey.OnUIHideBegin, onUIHideBegin)
                return;
            }
            if (app.ui.isTopUI(this.uiName)) {
                if (this.showAnimDur > 0 && (this.action & EAction.OPEN) != 0) {
                    this.scheduleOnce(() => {
                        this.playShowAnim();
                    }, this.showAnimDur)
                }
                this.onShowBegin();
            }
        }
        app.event.on(app.eventKey.OnUIHideBegin, onUIHideBegin);
        let onUIHide = (ui: UIBase) => {
            if (!this?.isValid) {
                app.event.off(app.eventKey.OnUIShow, onUIHide)
                return;
            }
            if (app.ui.isTopUI(this.uiName)) {
                this.onShow();
            }
        }
        app.event.on(app.eventKey.OnUIHide, onUIHide)
        //监听隐藏
        let onUIShowBegin = (ui: UIBase) => {
            if (!this?.isValid) {
                app.event.off(app.eventKey.OnUIShowBegin, onUIShowBegin)
                return;
            }
            if (app.ui.getUIIndex(this.uiName) == 1) {
                if (this.hideAnimDur > 0 && (this.action & EAction.CLOSE) != 0) {
                    this.scheduleOnce(() => {
                        this.playHideAnim();
                    }, this.hideAnimDur)
                }
                this.onHideBegin();
            }
        }
        app.event.on(app.eventKey.OnUIShowBegin, onUIShowBegin);
        let onUIShow = (ui: UIBase) => {
            if (!this?.isValid) {
                app.event.off(app.eventKey.OnUIShow, onUIShow)
                return;
            }
            if (app.ui.getUIIndex(this.uiName) == 1) {
                this.onHide();
            }
        }
        app.event.on(app.eventKey.OnUIShow, onUIShow)
    }


    playShowAnim(callback?: () => void) {
        let bAction = Boolean(this.action & EAction.OPEN);
        if (bAction) {
            if (this.uiAnim) {//播放指定动画
                let clip = this.uiAnim.getClips()[0];
                if (clip) {
                    app.ui.BlockTime = 10;
                    this.uiAnim.off("finished");
                    this.uiAnim.once("finished", () => {
                        app.ui.BlockTime = -1;
                    });
                    this.uiAnim.once("finished", callback);
                    this.uiAnim.play(clip.name, 0);
                } else {
                    cc.warn(this.node.name, "无UI打开动画文件");
                    callback && callback();
                }
            } else {//播放默认动画
                this.node.scale = 0.85;
                cc.tween(this.node)
                    .to(0.3, { scale: 1 }, { easing: "elasticOut" })
                    .call(callback)
                    .start();
            }
        } else {
            callback && callback();
        }
    }

    playHideAnim(callback?: () => void) {
        let bAction = Boolean(this.action & EAction.CLOSE);
        if (bAction) {
            if (this.uiAnim) {//播放指定动画
                let clip = this.uiAnim.getClips()[1];
                if (clip) {
                    app.ui.BlockTime = 10;
                    this.uiAnim.off("finished");
                    this.uiAnim.once("finished", () => {
                        app.ui.BlockTime = -1;
                    });
                    this.uiAnim.once("finished", callback);
                    this.uiAnim.play(clip.name, 0);
                } else {
                    cc.warn(this.node.name, "无UI关闭动画文件");
                    callback && callback();
                }
            } else {//播放默认动画
                cc.tween(this.node)
                    .to(0.2, { scale: 0.5 }, { easing: "backIn" })
                    .call(callback)
                    .start();
            }
        } else {
            callback && callback();
        }
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

    /** 点击UI中的按钮 */
    onClickButton(btnName: string) { }
}