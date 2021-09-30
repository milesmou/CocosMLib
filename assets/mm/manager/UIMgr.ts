const { ccclass, property } = cc._decorator;

import UIBase from "../ui/UIBase";
import UITipMsg from "../ui/UITipMsg";
import UIGUide from "../ui/UIGuide";
import { app } from "../App";

export enum UIKey {
    Shade = "ui/Shade",
    UIGuide = "ui/UIGuide",
    UITipMsg = "ui/UITipMsg",
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
    private shadeOpacity = 0;

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
        this.shade.parent = this.normal;
        this.shadeOpacity = this.shade.opacity;
        this.shade.opacity = 0;

        //添加上层ui
        this.guide = await this.showHigher(UIKey.UIGuide) as UIGUide;
        this.tipMsg = await this.showHigher(UIKey.UITipMsg) as UITipMsg;
    }


    public async show<T extends UIBase>(name: UIKey, obj?: { args?: any, preload?: boolean }): Promise<T> {
        if (this.cooldown && !obj?.preload) { return; }
        if (!obj?.preload) this.cooldown = true;
        app.event.emit(app.eventKey.OnUIInitBegin, name);
        let ui = await this.initUI(name);
        ui.setArgs(obj?.args);
        if (obj?.preload) {//预加载在最下层
            ui.setVisible(false);
            ui.node.zIndex = this.botUI?.node?.zIndex < 0 ? this.botUI.node.zIndex - 2 : -10;
            ui.node.parent = this.normal;
            this.uiStack.unshift(ui);
        } else {//展示在最上层
            ui.setVisible(true);
            ui.node.zIndex = this.topUI?.node?.zIndex > 0 ? this.topUI.node.zIndex + 2 : 10;
            ui.node.parent = this.normal;
            this.uiStack.push(ui);
            this.setShade();
            ui.onShowBegin();
            app.event.emit(app.eventKey.OnUIShowBegin, ui);
            await ui.playShowAnim();
            ui.onShow();
            this.cooldown = false;
            app.event.emit(app.eventKey.OnUIShow, ui);
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
                app.event.emit(app.eventKey.OnUIHideBegin, ui);
                await ui.playHideAnim();
                ui.onHide();
                app.event.emit(app.eventKey.OnUIHide, ui);
            }
            if (ui.destroyNode) {
                ui.node.destroy();
                this.uiDict[name] = undefined;
            } else {
                ui.node.parent = null;
            }
        }
    }

    public async showHigher<T extends UIBase>(name: UIKey, args?: any) {
        let ui = await this.initUI(name);
        ui.setArgs(args);
        ui.node.parent = this.higher;
        return ui as T;
    }

    public hideHigher(name: UIKey) {
        let ui = this.uiDict[name];
        if (!ui?.isValid) return;
        if (ui.destroyNode) {
            ui.node.destroy();
            this.uiDict[name] = undefined;
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
                    node.setContentSize(cc.winSize);
                    node.position = cc.v3(0, 0);
                    resolve(node);
                }
            });
        });
        return p;
    }

    public isTopUI(name: UIKey | string) {
        return this.topUI == this.uiDict[name];
    }

    public getUI<T extends UIBase>(name: UIKey | string) {
        let ui = this.uiDict[name];
        if (ui && ui.isValid) {
            return ui as T;
        }
    }

    /** 获取UI在栈中的层级,栈顶为0,向下依次递增 */
    public getUIIndex(name: UIKey | string) {
        let ui = this.uiDict[name];
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
                cc.tween(this.shade).to(0.15, { opacity: this.shadeOpacity }).start();
                return;
            }
        }
        cc.tween(this.shade).to(0.15, { opacity: 0 }).start();
    }
}
