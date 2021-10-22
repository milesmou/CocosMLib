const { ccclass, property } = cc._decorator;

import UIBase from "../ui/UIBase";
import UITipMsg from "../ui/UITipMsg";
import UIGUide from "../ui/UIGuide";
import { app } from "../App";

export enum UIKey {
    UIGuide = "ui/UIGuide",
    UITipMsg = "ui/UITipMsg",
    //testui
    UIMenu = "testui/UIMenu",
    UIUITest = "testui/UIUITest",
    UI1 = "testui/ui1",
    UI2 = "testui/ui2",
    UI3 = "testui/ui3",
    UI4 = "testui/ui4",
    UIAudio = "testui/UIAudio",
}


@ccclass
export default class UIMgr extends cc.Component {

    public static Inst: UIMgr = null;

    /** 普通的UI页面 */
    @property(cc.Node)
    private normal: cc.Node = null;
    /** 比较上层的UI界面(如提示信息、引导等等)不参与UI堆栈 */
    @property(cc.Node)
    private higher: cc.Node = null;
    /** 弹窗UI的半透明遮罩 */
    @property(cc.Node)
    private shade: cc.Node = null;
    /** 拦截所有UI事件的组件 */
    @property(cc.BlockInputEvents)
    private blockInput: cc.BlockInputEvents = null;

    private uiMap: Map<UIKey, UIBase> = new Map();
    private uiStack: UIBase[] = [];
    /** 打开关闭ui时标记是否正在被操作,避免同时打开和关闭同一个UI */
    private uiLock = new Set<UIKey>();
    /** UI打开时进入冷却(无法同时打开多个UI) */
    private cooldown = false;

    /** 最上层的UI */
    private get topUI() { return this.uiStack[this.uiStack.length - 1]; }
    /** 最下层的UI */
    private get botUI() { return this.uiStack[0]; }

    private blockCnt = 0;
    public get block() {
        return this.blockInput?.enabled;
    }
    /** 是否拦截所有的UI事件(采用计数的方式,启用后一定要关闭) */
    public set block(value) {
        this.blockCnt += (value ? 1 : -1);
        this.blockInput.enabled = this.blockCnt > 0 ? true : false;
    }

    //常驻高层UI
    public guide: UIGUide = null;
    public tipMsg: UITipMsg = null;

    onLoad() {
        UIMgr.Inst = this;
        this.init();
    }

    /** 初始化 */
    public async init() {
        //添加上层ui
        this.guide = await this.showHigher(UIKey.UIGuide) as UIGUide;
        this.tipMsg = await this.showHigher(UIKey.UITipMsg) as UITipMsg;
    }


    public async show<T extends UIBase>(name: UIKey, obj?: { args?: any, preload?: boolean, onShow?: (ui: T) => void }) {
        if (this.uiLock.has(name) || this.cooldown) {
            this.scheduleOnce(() => {
                this.show(name, obj);
            })
            return;
        }
        this.uiLock.add(name);
        this.cooldown = true
        this.block = true;
        app.event.emit(app.eventKey.OnUIInitBegin, name);
        let ui = await this.initUI(name);
        ui.setArgs(obj?.args);
        if (obj?.preload) {//预加载在最下层
            ui.node.zIndex = this.botUI?.node?.zIndex < 0 ? this.botUI.node.zIndex - 2 : -10;
            this.uiStack.unshift(ui);
            ui.setVisible(false);
            ui.node.parent = this.normal;
            this.uiLock.delete(name);
            this.cooldown = false;
        } else {//展示在最上层
            ui.node.zIndex = this.topUI?.node?.zIndex > 0 ? this.topUI.node.zIndex + 2 : 10;
            this.uiStack.push(ui);
            ui.setVisible(true);
            ui.node.parent = this.normal;
            this.setShade();
            ui.onShowBegin();
            app.event.emit(app.eventKey.OnUIShowBegin, ui);
            await ui.playShowAnim();
            this.uiLock.delete(name);
            this.cooldown = false;
            ui.onShow();
            app.event.emit(app.eventKey.OnUIShow, ui);
        }
        this.block = false;
        obj?.onShow && obj.onShow(ui as T);
    }

    public async hide(name: UIKey): Promise<void> {
        if (this.uiLock.has(name)) {
            this.scheduleOnce(() => {
                this.hide(name);
            })
            return;
        }
        this.uiLock.add(name);
        this.block = true;
        let ui = this.uiMap.get(name);
        let index = this.uiStack.indexOf(ui)
        if (index != -1) {
            this.uiStack.splice(index, 1);
            this.setShade();
            if (index == this.uiStack.length) {
                ui.onHideBegin();
                app.event.emit(app.eventKey.OnUIHideBegin, ui);
                await ui.playHideAnim();
                ui.onHide();
                app.event.emit(app.eventKey.OnUIHide, ui);
            }
            if (ui.destroyNode) {
                ui.node.destroy();
                this.uiMap.delete(name);
            } else {
                ui.node.parent = null;
            }
        }
        this.uiLock.delete(name);
        this.block = false;
    }

    public async showHigher<T extends UIBase>(name: UIKey, args?: any) {
        let ui = await this.initUI(name);
        ui.setArgs(args);
        ui.node.parent = this.higher;
        return ui as T;
    }

    public hideHigher(name: UIKey) {
        let ui = this.uiMap.get(name);
        if (!ui?.isValid) return;
        if (ui.destroyNode) {
            ui.node.destroy();
            this.uiMap.delete(name);
        } else {
            ui.node.parent = null;
        }
    }

    /** 关闭除指定UI外其它所有UI */
    public hideOther(exclude: UIKey[]) {
        let len = this.uiStack.filter(v => exclude.includes(v.uiName)).length;
        while (this.uiStack.length > len) {
            let ui = this.uiStack.find(v => !exclude.includes(v.uiName));
            this.hide(ui.uiName);
        }
    }

    public async initUI(name: UIKey): Promise<UIBase> {
        let ui = this.uiMap.get(name);
        if (ui?.isValid) {
            let index = this.uiStack.indexOf(ui);
            if (index > -1) {
                this.uiStack.splice(index, 1);
            }
        } else {
            let node = await this.instNode(name);
            ui = node.getComponent(UIBase);
            ui.init(name);
            this.uiMap.set(name, ui);
        }
        ui.setActive(true);
        return ui;
    }

    private async instNode(name: UIKey): Promise<cc.Node> {
        let p = new Promise<cc.Node>((resolve, reject) => {
            cc.resources.load(name, cc.Prefab, (err, prefab: any) => {
                if (err) {
                    cc.error(name, err);
                    reject();
                } else {
                    let node: cc.Node = cc.instantiate(prefab);
                    node.setContentSize(cc.winSize);
                    node.position = cc.v3(0, 0);
                    resolve(node);
                }
            });
        });
        return p;
    }

    public isTopUI(name: UIKey | string) {
        return this.topUI == this.uiMap.get(name as UIKey);
    }

    public getUI<T extends UIBase>(name: UIKey | string) {
        let ui = this.uiMap.get(name as UIKey);
        if (ui && ui.isValid) {
            return ui as T;
        }
    }

    /** 获取UI在栈中的层级,栈顶为0,向下依次递增 */
    public getUIIndex(name: UIKey | string) {
        let ui = this.uiMap.get(name as UIKey);
        let index = this.uiStack.indexOf(ui);
        if (index > -1) {
            return this.uiStack.length - 1 - index;
        } else {
            return -1;
        }
    }

    /** UI是否被其它全屏UI覆盖 */
    public isUIBeCover(ui?: UIBase) {
        if (ui === undefined) {//非UI,在UI下层
            for (const ui of this.uiStack) {
                if (ui.isFullScreen) return true;
            }
        } else {
            let index = this.uiStack.indexOf(ui);
            if (index > -1) {
                for (let i = index + 1; i < this.uiStack.length; i++) {
                    const element = this.uiStack[i];
                    if (ui.isFullScreen) return true;
                }
            }
        }
        return false;
    }

    private setShade() {
        for (let i = this.uiStack.length - 1; i >= 0; i--) {
            let ui = this.uiStack[i];
            if (ui?.showShade) {
                this.shade.zIndex = ui.node.zIndex - 1;
                cc.tween(this.shade).to(0.15, { opacity: 255 }).start();
                return;
            }
        }
        cc.tween(this.shade).to(0.15, { opacity: 0 }).start();
    }

}
