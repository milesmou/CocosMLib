import { EventMgr, GameEvent } from "../utils/EventMgr";

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
        displayName: "完全覆盖",
        tooltip: "当前UI完全覆盖下层UI时，会隐藏下层UI"
    })
    cover = false;
    @property({
        displayName: "阻塞输入事件",
        tooltip: "是否阻塞所有的输入事件向下层传递"
    })
    blockInputEvent = true;
    @property({
        type: EAction,
        displayName: "动画(主动)",
        tooltip: "启用UI自身打开和关闭时动画"
    })
    activeAction = EAction.NONE;
    @property({
        type: EAction,
        displayName: "动画(被动)",
        tooltip: "启用UI受顶层UI影响时打开和关闭动画(顶层UI的Cover属性为true会影响下层UI的显示状态)"
    })
    passiveAction = EAction.NONE;
    @property({
        type: cc.Animation,
        displayName: "动画组件",
        tooltip: "UI打开关闭时播放指定动画(0:OPEN 1:CLOSE)，组件不存在时播放默认动画",
        visible: function () { return this.activeAction > 0 || this.passiveAction > 0 }
    })
    animation: cc.Animation = null;
    @property({
        type: cc.Button,
        displayName: "关闭按钮",
        tooltip: "自动为按钮绑定UI关闭事件"
    })
    closeBtn: cc.Button = null;

    protected block: cc.Node = null;
    protected args: any = null;
    protected uiName: string = null;

    /** 初始化UI，在子类重写该方法时，必须调用super.init() */
    init(name: string) {
        this.uiName = name;
        this.node.setContentSize(mm.safeArea);
        this.initBlock();
        this.closeBtn && this.closeBtn.node.on("click", this.safeClose, this);
        this.blockInputEvent && this.node.addComponent(cc.BlockInputEvents);
        this.animation && (this.animation.playOnLoad = false);
    }

    /** 初始化一个遮罩 在UI执行动画时 拦截用户操作 */
    private initBlock() {
        this.block = new cc.Node("block");
        this.block.setContentSize(mm.safeArea);
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

    setPosition(pos: cc.Vec3) {
        this.node.position = pos;
    }

    setOpacity(value: number) {
        this.node.opacity = value;
    }

    setActive(value: boolean) {
        this.node.active = value;
    }

    /** @param mode true:主动 false:被动 */
    openAction(mode: boolean) {
        let bAction = Boolean((mode ? this.activeAction : this.passiveAction) & EAction.OPEN);
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
                        this.animation.play(clip.name);
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

    /** 关闭UI时调用此方法 */
    safeClose() {
        EventMgr.emit(GameEvent.HideUI, this.uiName);
    }

    /** @param mode true:主动 false:被动 */
    closeAction(mode: boolean) {
        let bAction = Boolean((mode ? this.activeAction : this.passiveAction) & EAction.CLOSE);
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
                        this.animation.play(clip.name);
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

    /**
     * UI准备打开时触发 (UI打开动画播放前)
     * @param mode true:主动 false:被动
     */
    onShowBegin(mode: boolean) { }

    /**
     * UI准备关闭时触发 (UI关闭动画播放前)
     * @param mode true:主动 false:被动
     */
    onHideBegin(mode: boolean) { }

    /** 
     * UI完全打开时触发 (UI打开动画播放完)
     * @param mode true:主动 false:被动
     */
    onShow(mode: boolean) { }

    /**
     * UI完全关闭时触发 (UI关闭动画播放完)
     * @param mode true:主动 false:被动
     */
    onHide(mode: boolean) { }
}