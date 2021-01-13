import UIBase from "./UIBase";
import { EventMgr, GameEvent } from "../utils/EventMgr";
import UITipMessage from "./UITipMessage";
import UIGUide from "./UIGuide";


export class UIManager {
    private static inst: UIManager = null;
    public static get Inst() { return this.inst || (this.inst = new this()) }
    private constructor() { }

    private uiDict: { [name: string]: UIBase } = null;
    private uiStack: UIBase[] = null;
    private cooldown = false;//ui打开时进入冷却

    /** 最上层的UI */
    private get topUI() { return this.uiStack[this.uiStack.length - 1]; }
    /** 最下层的UI */
    private get botUI() { return this.uiStack[0]; }
    /** 普通的UI页面 */
    private NormalLayer: cc.Node = null;
    /** 比较上层的UI界面(如提示信息、引导等等)不参与UI堆栈 */
    private HigherLayer: cc.Node = null;
    /** UI的半透明遮罩 */
    public shade: cc.Node = null;

    //常驻高层UI
    public guide: UIGUide = null;
    public tipMseeage: UITipMessage = null;

    /** 场景加载后手动调用初始化 */
    public async init() {
        this.clear();
        EventMgr.on(GameEvent.ShowUI, this.showUI, this);
        EventMgr.on(GameEvent.HideUI, this.hideUI, this);

        let canvas = cc.find("Canvas");
        this.NormalLayer = new cc.Node("NormalLayer");
        this.NormalLayer.setContentSize(cc.winSize);
        this.NormalLayer.parent = canvas;
        this.HigherLayer = new cc.Node("HigherLayer");
        this.HigherLayer.setContentSize(cc.winSize);
        this.HigherLayer.parent = canvas;

        this.shade = await this.instNode(EUIName.UIShade);
        this.shade.setContentSize(cc.winSize);
        this.shade.parent = this.NormalLayer;
        this.shade.active = false;

        //添加上层ui
        this.guide = await this.initUI(EUIName.UIGuide) as UIGUide;
        this.guide.node.parent = this.HigherLayer;
        this.tipMseeage = await this.initUI(EUIName.UITipMessage) as UITipMessage;
        this.tipMseeage.node.parent = this.HigherLayer;
    }


    public async showUI<T extends UIBase>(name: EUIName, obj?: { args?: any, preload?: boolean }): Promise<T> {
        if (this.cooldown) { console.warn(`打开UI${name}失败`); return; }
        this.cooldown = true;
        EventMgr.emit(GameEvent.OnUIInitBegin, name);
        let ui = await this.initUI(name);
        ui.setArgs(obj?.args);
        if (obj?.preload && this.topUI) {//预加载在最下层
            ui.setVisible(false);
            ui.node.zIndex = this.botUI?.node.zIndex < 0 ? this.botUI.node.zIndex - 2 : -10;
            ui.node.parent = this.NormalLayer;
            this.uiStack.unshift(ui);
            this.cooldown = false;
        } else {//展示在最上层
            ui.setVisible(true);
            ui.node.zIndex = this.topUI?.node.zIndex > 0 ? this.topUI.node.zIndex + 2 : 10;
            ui.node.parent = this.NormalLayer;
            this.uiStack.push(ui);
            this.setShade();
            ui.onShowBegin();
            EventMgr.emit(GameEvent.OnUIShowBegin, ui);
            await ui.showAction();
            this.setUIVisible();
            this.cooldown = false;
            ui.onShow();
            EventMgr.emit(GameEvent.OnUIShow, ui);
        }
        return ui as T;
    }

    public async hideUI(name: EUIName): Promise<void> {
        let ui = this.uiDict[name];
        let index = this.uiStack.indexOf(ui)
        if (index != -1) {
            this.uiStack.splice(index, 1);
            this.setShade();
            this.setUIVisible();
            if (index == this.uiStack.length) {
                ui.onHideBegin();
                EventMgr.emit(GameEvent.OnUIHideBegin, ui);
                await ui.hideAction();
                ui.onHide();
                EventMgr.emit(GameEvent.OnUIHide, ui);
            }
            if (ui.destroyNode) {
                ui.node.destroy();
                this.uiDict[name] = undefined;
            } else {
                ui.node.parent = null;
            }
        }
    }

    public async initUI(name: EUIName): Promise<UIBase> {
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

    public isTopUI(name: EUIName) {
        return this.topUI == this.uiDict[name];
    }

    public getUI(name: EUIName) {
        let ui = this.uiDict[name];
        if (ui && ui.isValid) {
            return ui;
        }
    }

    private setUIVisible() {
        if (this.uiStack.length == 0) return;
        let isCover = false;
        for (let i = this.uiStack.length - 1; i >= 0; i--) {
            let ui = this.uiStack[i];
            if (ui.node.zIndex < 0) return;
            ui.setVisible(isCover ? false : true);
            if (!isCover) {
                isCover = ui.cover;
            }
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
    UILoading = "ui/UILoading",
    UI1 = "uitest/ui1",
    UI2 = "uitest/ui2",
    UI3 = "uitest/ui3",
    UI4 = "uitest/ui4",
}
