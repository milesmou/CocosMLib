import { app } from "../App";

const { property, ccclass } = cc._decorator;

const EAction = cc.Enum({
    NONE: 0,
    OPEN: 1,
    CLOSE: 2,
    BOTH: 3
})

@ccclass
export default class UIBase extends cc.Component {

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
        tooltip: "有时需要根据是弹窗还是全屏UI来判断是否执行UI动画或者隐藏下层UI"
    })
    isFullScreen = false;
    @property({
        displayName: "自动隐藏",
        tooltip: "被全屏UI覆盖时,是否将透明度设置为0,降低DC"
    })
    autoHide = false;
    @property({
        displayName: "监听返回",
        tooltip: "监听回到当前界面,当关闭它的上层UI界面回到此界面时,会触发onShowBegin、onShow方法"
    })
    listenBack = false;
    @property({
        type: cc.Integer,
        displayName: "返回动画延迟",
        tooltip: "回到当前界面(onShowBegin)时,延迟多久播放UI的打开动画(小于0表示不播放动画)",
        visible: function () { return this.listenBack && (this.action & EAction.OPEN) != 0 }
    })
    backAnimDur = -1;
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
    public block: cc.Node = null;
    protected animation: cc.Animation = null;
    protected args: any = null;

    /** 初始化UI，在子类重写该方法时，必须调用super.init() */
    init(uiName: string) {
        this.uiName = uiName;
        this.node.setContentSize(cc.winSize);
        this.initBlock();
        this.autoHide && this.enableAutoHide();
        this.listenBack && this.enableListenBack();
        this.blockInputEvent && this.node.addComponent(cc.BlockInputEvents);
        this.closeBtn && this.closeBtn.node.on("click", this.safeClose, this);
        this.animation = this.getComponent(cc.Animation);
    }

    /** 初始化一个遮罩 在UI执行动画时 拦截用户操作 */
    private initBlock() {
        this.block = new cc.Node("block");
        this.block.setContentSize(cc.winSize);
        this.block.addComponent(cc.BlockInputEvents);
        this.block.zIndex = cc.macro.MAX_ZINDEX;
        this.block.parent = this.node;
        this.block.active = false;
    }

    setArgs(args: any) {
        this.args = args;
    }

    setVisible(visible: boolean) {
        if (visible) {
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

    /** 监听回到当前界面,当关闭它的上层UI界面回到此界面时,会触发onShowBegin、onShow方法 */
    enableListenBack() {
        let onUIHideBegin = (ui: UIBase) => {
            if (!this?.isValid) {
                app.event.off(app.eventKey.OnUIHideBegin, onUIHideBegin)
                return;
            }
            if (app.ui.isTopUI(this.uiName)) {
                if (this.backAnimDur > 0 && (this.action & EAction.OPEN) != 0) {
                    this.scheduleOnce(() => {
                        this.playShowAnim();
                    }, this.backAnimDur)
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
    }


    playShowAnim() {
        let bAction = Boolean(this.action & EAction.OPEN);
        let p = new Promise<boolean>((resovle, reject) => {
            let callback = () => {
                this.block.active = false;
                resovle(true);
            };
            if (bAction) {
                this.block.active = true;
                if (this.animation) {//播放指定动画
                    let clip = this.animation.getClips()[0];
                    if (clip) {
                        this.animation.once("finished", callback);
                        this.animation.play(clip.name, 0);
                    } else {
                        console.warn(this.node.name, "无UI打开动画文件");
                        callback();
                    }
                } else {//播放默认动画
                    this.node.scale = 0.85;
                    cc.tween(this.node)
                        .to(0.3, { scale: 1 }, { easing: "elasticOut" })
                        .call(callback)
                        .start();
                }
            } else {
                callback();
            }
        })
        return p;
    }

    playHideAnim() {
        let bAction = Boolean(this.action & EAction.CLOSE);
        let p = new Promise<boolean>((resovle, reject) => {
            let callback = () => {
                this.block.active = false;
                resovle(true);
            };
            if (bAction) {
                this.block.active = true;
                if (this.animation) {//播放指定动画
                    let clip = this.animation.getClips()[1];
                    if (clip) {
                        this.animation.once("finished", callback);
                        this.animation.play(clip.name, 0);
                    } else {
                        console.warn(this.node.name, "无UI关闭动画文件");
                        callback();
                    }
                } else {//播放默认动画
                    cc.tween(this.node)
                        .to(0.2, { scale: 0.5 }, { easing: "backIn" })
                        .call(callback)
                        .start();
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