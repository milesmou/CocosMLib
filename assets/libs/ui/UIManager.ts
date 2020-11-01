import UIBase from "./UIBase";
import { EventMgr, GameEvent } from "../utils/EventMgr";
import UITipMessage from "./UITipMessage";
import UIGUide from "./UIGuide";

export class UIManager  {
    private static inst: UIManager  = null;
    public static get Inst() { return this.inst || (this.inst = new this()) }
    private constructor() { }

    private uiDict: { [name: string]: UIBase } = null;
    private uiStack: UIBase[] = null;
    private cooldown = false;//ui打开时进入冷却

    /** 当前在最上层的UI */
    private topUI: UIBase = null;
    /** UI的半透明遮罩 */
    private shade: cc.Node = null;
    /** 普通的UI页面 */
    private NormalLayer: cc.Node = null;
    /** 比较上层的UI界面(如提示信息、引导等等)不参与UI堆栈 */
    private HigherLayer: cc.Node = null;

    public guide: UIGUide = null;
    public tipMseeage: UITipMessage = null;

    /** 场景加载后手动调用初始化 */
    public async init() {
        this.clear();
        EventMgr.on(GameEvent.OpenUI, this.openUI, this);
        EventMgr.on(GameEvent.CloseUI, this.closeUI, this);
        let canvas = cc.find("Canvas");
        this.NormalLayer = new cc.Node("NormalLayer");
        this.NormalLayer.setContentSize(cc.winSize);
        this.NormalLayer.parent = canvas;
        this.HigherLayer = new cc.Node("HigherLayer");
        this.HigherLayer.setContentSize(cc.winSize);
        this.HigherLayer.parent = canvas;

        this.shade = await this.instNode(EUIName.UIShade);
        this.shade.parent = this.NormalLayer;
        this.shade.active = false;

        //添加上层ui
        this.guide = await this.initUI(EUIName.UIGuide) as UIGUide;
        this.guide.node.parent = this.HigherLayer;
        this.tipMseeage = await this.initUI(EUIName.UITipMessage) as UITipMessage;
        this.tipMseeage.node.parent = this.HigherLayer;
    }


    public async openUI<T extends UIBase>(name: EUIName, obj?: { args?: any, action?: boolean, active?: boolean,  underTop?: boolean }): Promise<T> {
        if (this.cooldown) return;
        this.cooldown = true;
        let ui = await this.initUI(name);
        ui.setArgs(obj?.args);
        ui.setActive(typeof obj?.active === "boolean" ? obj.active : true)
        if (!this.topUI || !(typeof obj?.underTop === "boolean") || !obj?.underTop) {
            ui.node.zIndex = this.topUI ? this.topUI.node.zIndex + 2 : 1;
            this.uiStack.push(ui);
        } else {
            this.topUI.node.zIndex += 2;
            ui.node.zIndex = this.topUI.node.zIndex - 2;
            this.uiStack.splice(this.uiStack.length - 1, 0, ui);
        }
        ui.node.parent = this.NormalLayer;
        this.topUI = ui;
        this.setShade();
        await ui.open(obj?.action);
        this.setUIVisible();
        this.cooldown = false;
        ui.onOpen();
        return ui as T;
    }

    public async closeUI(name: EUIName, obj?: { action?: boolean }): Promise<void> {
        let ui = this.uiDict[name];
        let index = this.uiStack.indexOf(ui)
        if (index != -1) {
            this.uiStack.splice(index, 1);
            this.topUI = this.uiStack[this.uiStack.length - 1];
            this.setShade();
            this.setUIVisible();
            await ui.close(obj?.action);
            ui.node.parent = null;
            if (ui.destroyNode) {
                ui.node.destroy();
                this.uiDict[name] = undefined;
            }
            ui.onClose();
        }
    }

    public toTop(name: EUIName) {
        let ui = this.uiDict[name];
        let index = this.uiStack.indexOf(ui)
        if (index != -1) {
            ui.node.zIndex = this.topUI ? this.topUI.node.zIndex + 2 : 1;
            this.uiStack.splice(index, 1);
            this.uiStack.push(ui);
            this.topUI = this.uiStack[this.uiStack.length - 1];
            this.setShade();
            this.setUIVisible();
        }
    }

    public async initUI(name: EUIName): Promise<UIBase> {
        let ui = this.uiDict[name];
        if (ui?.isValid) {
            let index = this.uiStack.indexOf(ui);
            if (index > -1) {
                this.uiStack.splice(index, 1);
            }
            return ui;
        }
        let node = await this.instNode(name);
        ui = node.getComponent(UIBase);
        ui.init(name);
        this.uiDict[name] = ui;
        return ui;
    }

    private async instNode(name: string): Promise<cc.Node> {
        let p = new Promise<cc.Node>((resolve, reject) => {
            cc.resources.load(name, cc.Prefab, (err, prefab: any) => {
                if (err) {
                    console.error(name, err);
                    reject();
                } else {
                    let node = cc.instantiate(prefab);
                    resolve(node);
                }
            });
        });
        return p;
    }

    public getUI(name: EUIName) {
        let ui = this.uiDict[name];
        if (ui && ui.isValid) {
            return ui;
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

    private setUIVisible() {
        let isCover = false;
        for (let i = this.uiStack.length - 1; i >= 0; i--) {
            let ui = this.uiStack[i];
            ui.setOpacity(isCover ? 0 : 255);
            if (!isCover) {
                isCover = ui.cover;
            }
        }
    }

    /** 切换场景后清除资源 */
    private clear() {
        for (let name in this.uiDict) {
            let ui = this.uiDict[name];
            if (ui?.isValid) {
                ui.node.destroy();
            }
        }
        if (this.shade?.isValid) {
            this.shade.destroy();
        }
        this.uiDict = {};
        this.uiStack = [];
        this.cooldown = false;
    }

}

export enum EUIName {//字符串值为ui加载路径
    UIShade = "ui/Shade",
    UIGuide = "ui/UIGuide",
    UITipMessage = "ui/UITipMessage",
    UI1 = "uitest/ui1",
    UI2 = "uitest/ui2",
    UI3 = "uitest/ui3",
    UI4 = "uitest/ui4",
}
