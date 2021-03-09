const { ccclass, property } = cc._decorator;

import UIBase from "../ui/UIBase";
import UITipMsg from "../ui/UITipMsg";
import UIGUide from "../ui/UIGuide";
import mm from "../mm";

export enum UIKey {
    Shade = "ui/Shade",
    UIGuide = "ui/UIGuide",
    UITipMsg = "ui/UITipMsg",
    UILoading = "ui/UILoading",
    //testui
    UI1 = "testui/ui1",
    UI2 = "testui/ui2",
    UI3 = "testui/ui3",
    UI4 = "testui/ui4",
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

    private uiDict: { [name: string]: UIBase } = {};
    private uiStack: UIBase[] = [];
    private cooldown = false;//ui打开时进入冷却

    /** 最上层的UI */
    private get topUI() { return this.uiStack[this.uiStack.length - 1]; }
    /** 最下层的UI */
    private get botUI() { return this.uiStack[0]; }

    /** UI的半透明遮罩 */
    public shade: cc.Node = null;

    //常驻高层UI
    public guide: UIGUide = null;
    public tipMsg: UITipMsg = null;

    onLoad() {
        UIMgr.Inst = this;
        this.init();
    }

    /** 初始化 */
    public async init() {

        this.shade = await this.instNode(UIKey.Shade);
        this.shade.setContentSize(cc.winSize);
        this.shade.parent = this.normal;
        this.shade.active = false;

        //添加上层ui
        this.guide = await this.initUI(UIKey.UIGuide) as UIGUide;
        this.guide.node.parent = this.higher;
        this.tipMsg = await this.initUI(UIKey.UITipMsg) as UITipMsg;
        this.tipMsg.node.parent = this.higher;
    }


    public async show<T extends UIBase>(name: UIKey, obj?: { args?: any, preload?: boolean }): Promise<T> {
        if (this.cooldown && !obj?.preload) { return; }
        if (!obj?.preload) this.cooldown = true;
        mm.event.emit(mm.eventKey.OnUIInitBegin, name);
        let ui = await this.initUI(name);
        ui.setArgs(obj?.args);
        if (obj?.preload) {//预加载在最下层
            ui.setVisible(false);
            ui.node.zIndex = this.botUI?.node.zIndex < 0 ? this.botUI.node.zIndex - 2 : -10;
            ui.node.parent = this.normal;
            this.uiStack.unshift(ui);
        } else {//展示在最上层
            ui.setVisible(true);
            ui.node.zIndex = this.topUI?.node.zIndex > 0 ? this.topUI.node.zIndex + 2 : 10;
            ui.node.parent = this.normal;
            this.uiStack.push(ui);
            this.setShade();
            ui.onShowBegin();
            mm.event.emit(mm.eventKey.OnUIShowBegin, ui);
            await ui.showAction();
            ui.onShow();
            this.cooldown = false;
            mm.event.emit(mm.eventKey.OnUIShow, ui);
        }
        return ui as T;
    }

    public async hide(name: UIKey): Promise<void> {
        let ui = this.uiDict[name];
        let index = this.uiStack.indexOf(ui)
        if (index != -1) {
            this.uiStack.splice(index, 1);
            this.setShade();
            if (index == this.uiStack.length) {
                ui.onHideBegin();
                mm.event.emit(mm.eventKey.OnUIHideBegin, ui);
                await ui.hideAction();
                ui.onHide();
                mm.event.emit(mm.eventKey.OnUIHide, ui);
            }
            if (ui.destroyNode) {
                ui.node.destroy();
                this.uiDict[name] = undefined;
            } else {
                ui.node.parent = null;
            }
        }
    }

    public async initUI(name: UIKey): Promise<UIBase> {
        let ui = this.uiDict[name];
        if (ui?.isValid) {
            let index = this.uiStack.indexOf(ui);
            if (index > -1) {
                this.uiStack.splice(index, 1);
            }
        } else {
            let node = await this.instNode(name);
            ui = node.getComponent(UIBase);
            ui.init(name);
            this.uiDict[name] = ui;
        }
        ui.setActive(true);
        return ui;
    }

    private async instNode(name: string): Promise<cc.Node> {
        let p = new Promise<cc.Node>((resolve, reject) => {
            cc.resources.load(name, cc.Prefab, (err, prefab: any) => {
                if (err) {
                    console.error(name, err);
                    reject();
                } else {
                    let node: cc.Node = cc.instantiate(prefab);
                    node.position = cc.v3(0, 0);
                    resolve(node);
                }
            });
        });
        return p;
    }

    public isTopUI(name: UIKey) {
        return this.topUI == this.uiDict[name];
    }

    public getUI<T extends UIBase>(name: UIKey) {
        let ui = this.uiDict[name];
        if (ui && ui.isValid) {
            return ui as T;
        }
    }

    private setShade() {
        for (let i = this.uiStack.length - 1; i >= 0; i--) {
            let ui = this.uiStack[i];
            if (ui?.showShade) {
                this.shade.active = true;
                this.shade.zIndex = ui.node.zIndex - 1;
                return;
            }
        }
        this.shade.active = false;
    }
}
