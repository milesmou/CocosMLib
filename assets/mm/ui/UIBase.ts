import { Animation, BlockInputEvents, Button, Enum, Node, tween, UITransform, v3, view, _decorator } from 'cc';
const { property, ccclass } = _decorator;

import { app } from "../App";
import { CCUtils } from '../utils/CCUtil';
import { AssetHandler } from './AssetHandler';
const EAction = Enum({
    NONE: 0,
    OPEN: 1,
    CLOSE: 2,
    BOTH: 3
})

@ccclass('UIBase')
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
        displayName: "是否弹窗",
        tooltip: "有时需要根据是否是弹窗还是全屏UI来判断是否执行UI动画"
    })
    popUp = false;
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
        type: Button,
        displayName: "关闭按钮",
        tooltip: "自动为按钮绑定UI关闭事件"
    })
    closeBtn: Button | null = null;
    public uiName: any = null;
    public transform!: UITransform;
    public block!: Node;
    protected animation: Animation | null = null;
    protected args: any = null;

    /** 初始化UI，在子类重写该方法时，必须调用super.init() */
    init(name: string) {
        this.uiName = name;
        this.transform = this.getComponent(UITransform)!;
        this.transform.setContentSize(view.getVisibleSize());
        this.initBlock();
        this.closeBtn && this.closeBtn.node.on("click", this.safeClose, this);
        this.blockInputEvent && this.addComponent(BlockInputEvents);
        this.animation = CCUtils.getComponentInChildren(this.node, Animation);
    }

    /** 初始化一个遮罩 在UI执行动画时 拦截用户操作 */
    private initBlock() {
        this.block = new Node("block");
        let uiTransform = this.block.addComponent(UITransform);
        uiTransform.setContentSize(this.transform.contentSize);
        this.block.addComponent(BlockInputEvents);
        this.block.parent = this.node;
        this.block.active = false;
        this.block.setSiblingIndex(20000);
    }

    setArgs(args: any) {
        this.args = args;
    }

    setVisible(visible: boolean) {
        if (visible) {
            // this.setOpacity(255);
        } else {
            // this.setOpacity(0);
        }
    }

    showAction() {
        let bAction = Boolean(this.action & EAction.OPEN);
        let p = new Promise<boolean>((resovle, reject) => {
            let callback = () => {
                this.block.active = false;
                resovle(true);
            };
            if (bAction) {
                this.block.active = true;
                if (this.animation) {//播放指定动画
                    let clip = this.animation.clips[0];
                    if (clip) {
                        this.animation.once("finished" as any, callback);
                        this.animation.play(clip.name);
                    } else {
                        console.warn(this.node.name, "无UI打开动画文件");
                        callback();
                    }
                } else {//播放默认动画
                    this.node.scale = v3(0.85, 0.85);
                    tween(this.node)
                        .to(0.3, { scale: v3(1, 1) }, { easing: "elasticOut" })
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
        app.ui.hide(this.uiName);
    }

    hideAction() {
        let bAction = Boolean(this.action & EAction.CLOSE);
        let p = new Promise<boolean>((resovle, reject) => {
            let callback = () => {
                this.block.active = false;
                resovle(true);
            };
            if (bAction) {
                this.block.active = true;
                if (this.animation) {//播放指定动画
                    let clip = this.animation.clips[1];
                    if (clip) {
                        this.animation.once("finished" as any, callback);
                        this.animation.play(clip.name);
                    } else {
                        console.warn(this.node.name, "无UI关闭动画文件");
                        callback();
                    }
                } else {//播放默认动画
                    tween(this.node)
                        .to(0.2, { scale: v3(0.5, 0.5) }, { easing: "backIn" })
                        .call(callback)
                        .start();
                }
            } else {
                callback();
            }
        });
        return p;
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