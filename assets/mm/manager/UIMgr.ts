import { _decorator, Component, Node, UIOpacity, Prefab, resources, instantiate, v3, tween } from 'cc';
const { ccclass, property } = _decorator;

import { app } from "../App";
import { Shade } from '../ui/Shade';
import { UIBase } from "../ui/UIBase";
import { UITipMsg } from "../ui/UITipMsg";
import { UIGuide } from "../ui/UIGuide";

@ccclass('UIMgr')
export class UIMgr extends Component {
    public static Inst: UIMgr;
    /** 普通的UI页面 */
    @property(Node)
    private normal!: Node;
    /** 比较上层的UI界面(如提示信息、引导等等)不参与UI堆栈 */
    @property(Node)
    private higher!: Node;
    private uiDict: { [name: string]: UIBase } = {};
    private uiStack: UIBase[] = [];
    private cooldown = false;//ui打开时进入冷却
    /** 最上层的UI */
    private get topUI() { return this.uiStack[this.uiStack.length - 1]; }
    /** 最下层的UI */
    private get botUI() { return this.uiStack[0]; }
    /** UI的半透明遮罩 */
    public shade!: Shade;
    //常驻高层UI
    public guide!: UIGuide;
    public tipMsg!: UITipMsg;
    onLoad() {
        UIMgr.Inst = this;
        this.init();
    }
    /** 初始化 */
    public async init() {

        let shadeNode = await this.instNode(UIKey.Shade);
        this.shade = shadeNode.getComponent(Shade)!;
        this.shade.node.parent = this.normal;

        //添加上层ui
        this.guide = await this.initUI(UIKey.UIGuide) as UIGuide;
        this.guide.node.parent = this.higher;
        this.tipMsg = await this.initUI(UIKey.UITipMsg) as UITipMsg;
        this.tipMsg.node.parent = this.higher;
    }
    public async show<T extends UIBase>(name: UIKey, obj?: { args?: any, preload?: boolean }): Promise<T> {
        if (this.cooldown && !obj?.preload) { return null!; }
        if (!obj?.preload) this.cooldown = true;
        app.event.emit(app.eventKey.OnUIInitBegin, name);
        let ui = await this.initUI(name);
        ui.setArgs(obj?.args);
        if (obj?.preload) {//预加载在最下层
            ui.setVisible(false);
            ui.node.setSiblingIndex(this.botUI?.node.getSiblingIndex() < 0 ? this.botUI.node.getSiblingIndex() - 2 : -10);
            ui.node.parent = this.normal;
            this.uiStack.unshift(ui);
        } else {//展示在最上层
            ui.setVisible(true);
            ui.node.setSiblingIndex(this.topUI?.node.getSiblingIndex() > 0 ? this.topUI.node.getSiblingIndex() + 2 : 10);
            ui.node.parent = this.normal;
            this.uiStack.push(ui);
            this.setShade();
            ui.onShowBegin();
            app.event.emit(app.eventKey.OnUIShowBegin, ui);
            await ui.showAction();
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
                await ui.hideAction();
                ui.onHide();
                app.event.emit(app.eventKey.OnUIHide, ui);
            }
            if (ui.destroyNode) {
                ui.node.destroy();
                delete this.uiDict[name];
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
            ui = node.getComponent(UIBase)!;
            ui.init(name);
            this.uiDict[name] = ui;
        }
        ui.node.active = true;
        return ui;
    }
    private async instNode(name: string): Promise<Node> {
        let p = new Promise<Node>((resolve, reject) => {
            resources.load(name, Prefab, (err: any, prefab: any) => {
                if (err) {
                    console.error(name, err);
                    reject();
                } else {
                    let node: Node = instantiate(prefab);
                    node.position = v3(0, 0);
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
                this.shade.node.setSiblingIndex(ui.node.getSiblingIndex() - 1);
                this.shade.show();
                return;
            }
        }
        this.shade.hide();
    }
}

export enum UIKey {
    Shade = "ui/Shade",
    UIGuide = "ui/UIGuide",
    UITipMsg = "ui/UITipMsg",
    UIHUD = "ui/UIHUD",
    //testui
    UIAudioMgr = "testui/UIAudioMgr",
    UIUIMgr = "testui/UIUIMgr",
    UIPopUp = "testui/UIPopUp",
    UIA = "testui/UIA",
    UIB = "testui/UIB",
    UIC = "testui/UIC",
    UIGuideTest1 = "testui/UIGuideTest1",
    UIGuideTest2 = "testui/UIGuideTest2",
}
