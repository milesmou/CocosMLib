import { Component, instantiate, Node, Prefab, SpriteFrame, _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { app } from "../App";
import { UIBase } from "../ui/UIBase";
import { UIGuide } from "../ui/UIGuide";
import { UITipMsg } from "../ui/UITipMsg";
import { Utils } from '../utils/Utils';
import { AssetMgr } from './AssetMgr';

@ccclass('UIMgr')
export class UIMgr extends Component {
    public static Inst: UIMgr;
    /** 普通的UI页面 */
    @property(Node)
    private normal: Node;
    /** 比较上层的UI界面(如切换地图或UI时的加载界面)不参与UI堆栈 */
    @property(Node)
    private higher: Node;
    /** 常驻在最上层的UI界面(如提示信息、引导)不参与UI堆栈 */
    @property(Node)
    private resident: Node;
    /** 拦截所有UI事件的组件 */
    @property(Node)
    private blockInput: Node;

    @property(SpriteFrame)
    public whiteSplash: SpriteFrame;
    /* UI的缓存Dict */
    private uiDict: Map<string, UIBase> = new Map();
    /* 加载完成的UI栈 */
    private uiStack: UIBase[] = [];
    /* 所有打开的UI的列表,包含堆栈的普通UI、子UI等等 */
    private uiList: string[] = [];

    /* 描屏蔽用户输入事件时间,小于0表示立即停止屏蔽事件述 */
    private _blockTime = 0;
    public set blockTime(value: number) {

        if (value > this._blockTime) this._blockTime = value;
        if (value <= 0) this._blockTime = 0.1;
    }
    /** 记录上一次请求打开UI的时间 抛出短时间内(0.1s)连续打开同一UI的警告 */
    private openUITime: Map<string, number> = new Map();

    /* UI参数缓存 方便可以在onLoad时手动拿到参数 */
    private uiArgs: Map<string, object> = new Map();

    public static onStart: () => void;

    //常驻高层UI
    public guide: UIGuide;
    private tipMsg: UITipMsg;

    onLoad() {
        UIMgr.Inst = this;
        this.init();
    }

    start() {
        UIMgr.onStart && UIMgr.onStart();
    }
    /** 初始化 */
    public async init() {

        //添加上层ui
        this.guide = await this.initUI(UIKey.UIGuide, this.resident) as UIGuide;
        this.tipMsg = await this.initUI(UIKey.UITipMsg, this.resident) as UITipMsg;
    }

    public async show<T extends UIBase>(uiName: string, obj: { args?: any, blockTime?: number, visible?: boolean, parent?: Node } = {}): Promise<T> {

        let { args, blockTime, visible, parent } = obj;
        blockTime = blockTime === undefined ? 0.2 : blockTime;
        visible = visible === undefined ? true : visible;
        this.checkShowUI(uiName);
        this.blockTime = blockTime;
        Utils.delItemFromArray(this.uiList, uiName);
        app.event.emit(app.eventKey.OnUIInitBegin, uiName);
        this.uiArgs[uiName] = args;
        let ui = await this.initUI(uiName, parent || this.normal, visible);
        Utils.delItemFromArray(this.uiStack, ui);
        if (!parent) {
            if (visible) this.uiStack.push(ui);
            else this.uiStack.unshift(ui);
        }
        ui.setArgs(args);
        if (visible) ui.node.setSiblingIndex(999999);
        else ui.node.setSiblingIndex(0);
        if (visible) {
            ui.onShowBegin();
            app.event.emit(app.eventKey.OnUIShowBegin, ui);
            await ui.playShowAnim();
            ui.onShow();
            app.event.emit(app.eventKey.OnUIShow, ui);
        }
        return ui as T;
    }

    public async hide(uiName: string, blockTime = 0.2, fastHide = false): Promise<void> {
        this.blockTime = blockTime;
        let ui = this.uiDict.get(uiName);
        if (!ui?.isValid) return;
        let hideUI = () => {
            if (ui.destroy) {
                ui.node.destroy();
                this.uiDict.delete(uiName);
                AssetMgr.DecRef(uiName, 1);
            }
            else {
                ui.node.active = false;
            }
        };
        let index = this.uiStack.indexOf(ui)
        if (index > -1) {
            Utils.delItemFromArray(this.uiList, uiName);
            Utils.delItemFromArray(this.uiStack, ui);
            if (index == this.uiStack.length) {
                ui.onHideBegin();
                app.event.emit(app.eventKey.OnUIHideBegin, ui);
                if (fastHide) {
                    ui.onHide();
                    app.event.emit(app.eventKey.OnUIHide, ui);
                    hideUI();
                } else {
                    await ui.playHideAnim();
                    ui.onHide();
                    app.event.emit(app.eventKey.OnUIHide, ui);
                    hideUI();
                }
            }
        } else {
            index = this.uiList.indexOf(uiName);
            if (index > -1) {
                Utils.delItemFromArray(this.uiList, uiName);
                hideUI();
            }
        }
    }

    public async showHigher(uiName: string, args?: any) {
        this.blockTime = 0.2;
        let ui = await this.initUI(uiName, this.higher);
        ui.setArgs(args);
        ui.node.setSiblingIndex(999999);
        app.event.emit(app.eventKey.OnUIShow, ui);
        return ui;
    }

    public hideHigher(uiName: string) {
        let ui = this.uiDict.get(uiName);
        if (!ui?.isValid) return;
        if (ui.destroy) {
            ui.node.destroy();
            this.uiDict.delete(uiName);
        }
        else ui.node.active = false;
        app.event.emit(app.eventKey.OnUIHide, ui);
    }

    public showResident(uiName: string) {
        this.instNode(uiName, this.resident);
    }

    public hideAll(...exclude: string[]) {
        var hideList = this.uiStack.filter(ui => exclude.indexOf(ui.uiName) == -1);
        hideList.forEach(ui => {
            this.hide(ui.uiName);
        });
    }

    public async initUI(uiName: string, parent: Node, visible = true): Promise<UIBase> {
        let ui = this.uiDict.get(uiName);
        if (!ui?.isValid) {
            let node = await this.instNode(uiName, parent, visible);
            ui = node.getComponent(UIBase)!;
            ui.init(uiName);
            this.uiDict.set(uiName, ui);
        }
        ui.node.active = true;
        return ui;
    }

    private async instNode(uiName: string, parent: Node, visible = true): Promise<Node> {
        if (this.uiDict.has(uiName)) {
            var ui = this.uiDict.get(uiName);
            if (ui?.isValid) {
                if (visible) ui.node.setSiblingIndex(999999);
                return ui.node;
            }
        }
        let prefab = await AssetMgr.loadAsset(uiName, Prefab);
        var uiObj = instantiate(prefab);
        uiObj.parent = parent;
        if (!visible) uiObj.setSiblingIndex(0);
        return uiObj;
    }

    public getUIArgs(uiName: string) {
        return this.uiArgs.get(uiName);
    }

    public isTopUI(uiName: string) {
        if (this.uiStack.length == 0) return false;
        let ui = this.uiDict.get(uiName);
        if (!ui?.isValid) return false;
        return this.uiStack[this.uiStack.length - 1] == ui;
    }

    public getUI<T extends UIBase>(name: string) {
        let ui = this.uiDict.get(name);
        if (ui?.isValid) {
            return ui as T;
        }
        return null;
    }

    /* 获取UI在栈中的层级,栈顶为0,向下依次递增  */
    public getUIIndex(uiName: string) {
        let ui = this.uiDict.get(uiName);
        if (!ui?.isValid) return -1;
        if (ui.node.parent != this.normal) return -1;
        let index = this.uiStack.indexOf(ui);
        if (index > -1) {
            return this.uiStack.length - 1 - index;
        }
        else {
            return -1;
        }
    }

    /* UI是否在显示的UI栈中 */
    public isUIInStack(ui: UIBase) {
        return this.uiStack.indexOf(ui) > -1;
    }

    /* UI是否被其它全屏UI覆盖 */
    public isUIBeCover(ui?: UIBase) {
        if (!ui?.isValid) {
            //非UI,在UI下层
            for (const v of this.uiStack) {
                if (v.fullScreen) return true;
            }
        }
        else {
            let index = this.uiStack.indexOf(ui);

            if (index > -1) {
                for (let i = index + 1; i < this.uiStack.length; i++) {
                    let v = this.uiStack[i];
                    if (v.fullScreen) return true;
                }
            }
        }
        return false;
    }

    /** 检测是否在短时间内(0.1s)连续打开同一UI 抛出警告 */
    private checkShowUI(uiName: string) {
        let now = Date.now();
        if (this.openUITime.has(uiName)) {
            let lastTime = this.openUITime[uiName];
            if (now - lastTime < 100) {
                console.warn(`短时间内连续打开UI[${uiName}] 请检查是否有逻辑问题`);
                this.openUITime.delete(uiName);
            }

            this.openUITime[uiName] = now;
        }
        else this.openUITime.set(uiName, now);
    }

    lateUpdate(dt: number) {
        if (this._blockTime > 0) this._blockTime -= dt;
        this.blockInput.active = this._blockTime > 0;
    }

    //#region UITipMsg方法

    showTip(content: string) {
        this.tipMsg && this.tipMsg.showTip(content);
    }

    showToast(content: string) {
        this.tipMsg && this.tipMsg.showToast(content);
    }

    showConfirm(content: string, boxType = 2, cbOk?: Function, cbCancel?: Function) {
        this.tipMsg && this.tipMsg.showConfirm(content, boxType, cbOk, cbCancel);
    }

    //#endregion
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
