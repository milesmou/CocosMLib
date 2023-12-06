import { Component, Node, Prefab, SpriteFrame, _decorator, instantiate, v3 } from 'cc';

const { ccclass, property } = _decorator;

import { EventKey } from '../../../../scripts/base/GameEnum';
import { UITipMsg } from '../../../../scripts/base/ui/UITipMsg';
import { UIGuide } from '../../../../scripts/base/ui/guide/UIGuide';
import { UIConstant } from '../../../../scripts/gen/UIConstant';
import { CCUtils } from '../../../utils/CCUtil';
import { Utils } from '../../../utils/Utils';
import { AssetMgr } from '../../asset/AssetMgr';
import { EventMgr } from '../../event/EventMgr';
import { L10nMgr } from '../../l10n/L10nMgr';
import { MLogger } from '../../logger/MLogger';
import { EPassiveType, UIBase } from "./UIBase";

@ccclass
export class UIMgr extends Component {
    public static Inst: UIMgr;
    /** 普通的UI页面 */
    @property(Node)
    private normal: Node = null;
    /** 比较上层的UI界面(如切换地图或UI时的加载界面)不参与UI堆栈 */
    @property(Node)
    private higher: Node = null;
    /** 常驻在最上层的UI界面(如提示信息、引导)不参与UI堆栈 */
    @property(Node)
    private resident: Node = null;
    /** 拦截所有UI事件的组件 */
    @property(Node)
    private blockInput: Node = null;
    /** 纯白色贴图 */
    public defaultSprite: SpriteFrame = null;
    /** UI的缓存Dict */
    private uiDict: Map<string, UIBase> = new Map();
    /** 实时的UI栈 */
    private uiNameStack: string[] = [];
    /** 加载完成的UI栈 */
    private uiStack: UIBase[] = [];
    /** 实时的子UI栈 */
    private subUINameStack: string[] = [];
    /** 加载完成的子UI栈 */
    private subUIStack: UIBase[] = [];

    /** 最上层的UI */
    public get topUI() {
        return this.uiStack[this.uiStack.length - 1];
    }

    private _blockTime = 0;
    /** 描屏蔽用户输入事件时间(秒),小于0表示立即停止屏蔽事件述 */
    public set blockTime(value: number) {
        if (value > this._blockTime) this._blockTime = value;
        if (value <= 0) this._blockTime = 0.1;

    }
    /** 记录上一次请求打开UI的时间 抛出短时间内(0.1s)连续打开同一UI的警告 */
    private openUITime: Map<string, number> = new Map();

    /** UI参数缓存 方便可以在onLoad时手动拿到参数 */
    private uiArgs: Map<string, object> = new Map();

    //常驻高层UI
    public guide: UIGuide;
    private tipMsg: UITipMsg;

    onLoad() {
        UIMgr.Inst = this;
        CCUtils.uiNodeMatchParent(this.normal);
        CCUtils.uiNodeMatchParent(this.higher);
        CCUtils.uiNodeMatchParent(this.resident);
        AssetMgr.loadAsset("DefaultSprite", SpriteFrame).then(sp => {
            this.defaultSprite = sp;
        });

    }

    async init() {
        // 添加引导界面
        this.instNode(UIConstant.UIGuide, this.resident).then(n => {
            this.guide = n.getComponent(UIGuide);
        });
        // 添加提示信息界面
        this.instNode(UIConstant.UITipMsg, this.resident).then(n => {
            this.tipMsg = n.getComponent(UITipMsg);
        });
    }

    public async show<T extends UIBase>(uiName: string, obj: { args?: any, blockTime?: number, parent?: Node, playAnim?: boolean, visible?: boolean } = {}): Promise<T> {
        let { args, blockTime, parent, playAnim, visible } = obj;
        blockTime = blockTime === undefined ? 0.2 : blockTime;
        playAnim = playAnim === undefined ? true : visible;
        visible = visible === undefined ? true : visible;
        if (!parent) {//主UI
            Utils.delItemFromArray(this.uiNameStack, uiName);
            if (visible) this.uiNameStack.push(uiName);
        } else {//子UI
            Utils.delItemFromArray(this.uiNameStack, uiName);
            if (visible) this.subUINameStack.push(uiName);
        }
        this.checkShowUI(uiName);
        this.blockTime = blockTime;
        EventMgr.emit(EventKey.OnUIInitBegin, uiName);
        this.uiArgs[uiName] = args;
        let ui = await this.initUI(uiName, parent || this.normal, visible);
        if (!parent) {//主UI
            Utils.delItemFromArray(this.uiStack, ui);
            if (visible) this.uiStack.push(ui);
        } else {//子UI
            Utils.delItemFromArray(this.subUIStack, ui);
            if (visible) this.subUIStack.push(ui);
        }
        ui.setArgs(args);
        if (visible) {
            let belowUI = this.uiStack[this.uiStack.length - 2];
            ui.onShowBegin();
            belowUI?.onPassive(EPassiveType.HideBegin, ui);
            EventMgr.emit(EventKey.OnUIShowBegin, ui);
            if (playAnim) await ui.playShowAnim();
            ui.onShow();
            belowUI?.onPassive(EPassiveType.Hide, ui);
            EventMgr.emit(EventKey.OnUIShow, ui);
        } else {
            ui.onShowBegin();
            ui.onShow();
        }
        return ui as T;
    }

    public async hide(uiName: string, blockTime = 0.2, fastHide = false): Promise<void> {
        this.blockTime = blockTime;
        Utils.delItemFromArray(this.uiNameStack, uiName);
        Utils.delItemFromArray(this.subUINameStack, uiName);
        let ui = this.uiDict.get(uiName);
        if (!ui?.isValid) return;
        let hideUI = () => {
            if (ui.destroyNode) {
                ui.node.destroy();
                this.uiDict.delete(uiName);
                AssetMgr.DecRef(uiName);
            }
            else {
                ui.node.active = false;
            }
        };
        let index = this.uiStack.indexOf(ui)
        if (index > -1) {//关闭主UI
            Utils.delItemFromArray(this.uiStack, ui);
            if (index == this.uiStack.length) {//关闭最上层UI
                let topUI = this.uiStack[this.uiStack.length - 1];
                ui.onHideBegin();
                topUI?.onPassive(EPassiveType.ShowBegin, ui);
                EventMgr.emit(EventKey.OnUIHideBegin, ui);
                if (!fastHide) await ui.playHideAnim();
                ui.onHide();
                hideUI();
                topUI?.onPassive(EPassiveType.Show, ui);
                EventMgr.emit(EventKey.OnUIHide, ui);
            } else {//快速关闭非最上层UI 不播动画
                EventMgr.emit(EventKey.OnUIHideBegin, ui);
                ui.onHide();
                hideUI();
                EventMgr.emit(EventKey.OnUIHide, ui);
            }
            return;
        }
        index = this.subUIStack.indexOf(ui)
        if (index > -1) {//关闭子UI
            Utils.delItemFromArray(this.subUIStack, ui);
            if (index == this.subUIStack.length) {//关闭最上层UI
                let topUI = this.subUIStack[this.subUIStack.length - 1];
                ui.onHideBegin();
                topUI?.onPassive(EPassiveType.ShowBegin, ui);
                EventMgr.emit(EventKey.OnUIHideBegin, ui);
                if (!fastHide) await ui.playHideAnim();
                ui.onHide();
                hideUI();
                topUI?.onPassive(EPassiveType.Show, ui);
                EventMgr.emit(EventKey.OnUIHide, ui);
            } else {//快速关闭非最上层UI
                EventMgr.emit(EventKey.OnUIHideBegin, ui);
                ui.onHide();
                hideUI();
                EventMgr.emit(EventKey.OnUIHide, ui);
            }
            return;
        }

    }

    public async showHigher(uiName: string, args?: any) {
        this.blockTime = 0.2;
        let ui = await this.initUI(uiName, this.higher);
        ui.setArgs(args);
        ui.node.setSiblingIndex(999999);
        EventMgr.emit(EventKey.OnUIShow, ui);
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
        EventMgr.emit(EventKey.OnUIHide, ui);
    }

    public showResident(uiName: string) {
        this.instNode(uiName, this.resident);
    }

    public hideAll(...exclude: string[]) {
        var hideList = this.uiStack.filter(ui => exclude.indexOf(ui.uiName) == -1);
        hideList.forEach(ui => {
            this.hide(ui.uiName, 0.2, true);
        });
    }

    public async initUI(uiName: string, parent: Node, visible = true): Promise<UIBase> {
        let ui = this.uiDict.get(uiName);
        if (!ui?.isValid) {
            let node = await this.instNode(uiName, parent);
            ui = node.getComponent(UIBase)!;
            ui.init(uiName);
            this.uiDict.set(uiName, ui);
        }
        ui.node.active = true;
        ui.setVisible(visible);
        if (visible) {
            ui.node.setSiblingIndex(999999);
            ui.node.position = v3(0, 0, 0);
        } else {
            ui.node.setSiblingIndex(0);
            ui.node.position = v3(-10086, 0, 0);
        }
        return ui;
    }

    private async instNode(uiName: string, parent: Node): Promise<Node> {
        let prefab = await AssetMgr.loadAsset(uiName, Prefab);
        var uiObj = instantiate(prefab);
        CCUtils.uiNodeMatchParent(uiObj);
        uiObj.parent = parent;
        return uiObj;
    }

    public getUIArgs(uiName: string) {
        return this.uiArgs.get(uiName);
    }

    /** 判断是否最上层UI isRealTime true:实时的,调用show方法瞬间即生效 false:ui加载完成才生效 */
    public isTopUI(uiName: string, isRealTime = false) {
        if (isRealTime) {
            if (this.uiNameStack.length == 0 && this.subUINameStack.length == 0) return false;
            return this.uiNameStack[this.uiNameStack.length - 1] == uiName || this.subUINameStack[this.subUINameStack.length - 1] == uiName;
        } else {
            if (this.uiStack.length == 0 && this.subUIStack.length == 0) return false;
            let ui = this.uiDict.get(uiName);
            if (!ui?.isValid) return false;
            return this.uiStack[this.uiStack.length - 1] == ui || this.subUIStack[this.subUIStack.length - 1] == ui;
        }
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
                MLogger.warn(`短时间内连续打开UI[${uiName}] 请检查是否有逻辑问题`);
                this.openUITime.delete(uiName);
            }
            this.openUITime[uiName] = now;
        }
        else this.openUITime.set(uiName, now);
    }

    update(dt: number) {
        if (this._blockTime > 0) this._blockTime -= dt;
        this.blockInput.active = this._blockTime > 0;
    }

    //#region UITipMsg方法

    showTip(content: string) {
        this.tipMsg && this.tipMsg.showTip(content);
    }

    showToast(content: string, isLanguageKey = false, ...languageArgs: any[]) {
        if (isLanguageKey) {
            content = L10nMgr.getStringByKey(content, languageArgs);
        }
        this.tipMsg && this.tipMsg.showToast(content);
    }

    showConfirm(content: string, boxType: 1 | 2 = 2, cbOk?: Function, cbCancel?: Function) {
        this.tipMsg && this.tipMsg.showConfirm(content, boxType, cbOk, cbCancel);
    }

    //#endregion
}
