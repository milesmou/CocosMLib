import { BlockInputEvents, Camera, Component, Node, Prefab, SpriteFrame, _decorator, instantiate } from 'cc';

const { ccclass, property } = _decorator;

import { EventKey } from '../../../../scripts/base/GameEnum';
import { UIConstant } from '../../../../scripts/gen/UIConstant';
import { CCUtils } from '../../../utils/CCUtil';
import { AssetMgr } from '../../asset/AssetMgr';
import { EventMgr } from '../../event/EventMgr';
import { EUIFormPassiveType } from './EUIFormPassiveType';
import { UIComponent } from './UIComponent';
import { UIForm } from './UIForm';
import { UIStack } from './UIStack';

@ccclass
export class UIMgr extends Component {
    public static Inst: UIMgr;

    @property({ tooltip: "弹窗遮罩透明度" })
    public shadeOpacity = 200;

    private _camera: Camera;
    /** UI摄像机 */
    public get camera() { return this._camera; }

    /** 普通的UI页面 */
    private _normal: Node;
    /** 比较上层的UI界面(如切换地图或UI时的加载界面)不参与UI堆栈 */
    private _higher: Node;
    /** 常驻在最上层的UI界面(如提示信息、引导)不参与UI堆栈 */
    private _resident: Node;
    /** 拦截所有触摸事件的节点 */
    private _blockInput: Node

    /** 正在加载过程中的UI */
    private _loadingUI: Set<string> = new Set();
    /** UI的缓存Dict */
    private _uiDict: Map<string, UIForm> = new Map();
    /** 实时的UI栈(加载UI需要时间) */
    private _uiNameStack: UIStack<string> = new UIStack();
    /** 加载完成的UI栈 */
    private _uiStack: UIStack<UIForm> = new UIStack();
    /** 实时的子UI栈 */
    private _subUINameStack: UIStack<string> = new UIStack();
    /** 加载完成的子UI栈 */
    private _subUIStack: UIStack<UIForm> = new UIStack();

    public _defaultSprite: SpriteFrame = null;
    /** 纯白色贴图 */
    public get defaultSprite() { return this._defaultSprite; }

    /** 最上层的UI */
    public get topUI() {
        return this._uiStack[this._uiStack.length - 1];
    }

    private _blockTime = 0;
    /** 描屏蔽用户输入事件时间(秒),小于0表示立即停止屏蔽事件述 */
    public set blockTime(value: number) {
        if (value > this._blockTime) this._blockTime = value;
        if (value <= 0) this._blockTime = 0.1;
    }

    /** 记录上一次请求打开UI的时间 抛出短时间内(0.1s)连续打开同一UI的警告 */
    private _openUITime: Map<string, number> = new Map();

    /** UI参数缓存 方便可以在onLoad时手动拿到参数 */
    private _uiArgs: Map<string, object> = new Map();

    protected onLoad() {
        UIMgr.Inst = this;
        this.init();
    }

    private init() {
        //创建3个UI层级
        this._normal = CCUtils.createUINode("Normal");
        this._normal.parent = this.node;
        this._normal.matchParent();
        this._higher = CCUtils.createUINode("Higher");
        this._higher.parent = this.node;
        this._higher.matchParent();
        this._resident = CCUtils.createUINode("Resident");
        this._resident.parent = this.node;
        this._resident.matchParent();
        //创建拦截所有触摸事件的节点
        this._blockInput = CCUtils.createUINode("BlockInput");
        this._blockInput.addComponent(BlockInputEvents);
        this._blockInput.parent = this.node;
        this._blockInput.matchParent();
        //加载默认的单色精灵帧
        AssetMgr.loadAsset("DefaultSprite", SpriteFrame).then(sp => {
            this._defaultSprite = sp;
        });
        //加载Loading界面
        AssetMgr.loadAsset(UIConstant.Loading, Prefab).then(prefab => {
            instantiate(prefab).parent = this._resident;
        });
    }

    public async show<T extends UIForm>(uiName: string, obj?: {
        args?: any, blockTime?: number, parent?: Node, playAnim?: boolean,
        visible?: boolean, bottom?: boolean, onProgress?: Progress
    }): Promise<T> {
        let { args, blockTime, parent, playAnim, visible, bottom, onProgress } = obj || {};
        blockTime = blockTime === undefined ? 0.2 : blockTime;
        playAnim = playAnim === undefined ? true : playAnim;
        visible = visible === undefined ? true : visible;
        bottom = bottom === undefined ? false : bottom;
        if (!parent) {//主UI
            this._uiNameStack.add(uiName, !visible || bottom)
        } else {//子UI
            this._subUINameStack.add(uiName, !visible || bottom)
        }
        this.checkShowUI(uiName, visible);
        this.blockTime = blockTime;
        EventMgr.emit(EventKey.OnUIInitBegin, uiName, visible);
        this._uiArgs[uiName] = args;
        let ui = await this.initUI(uiName, parent || this._normal, visible, bottom, onProgress);
        if (!parent) {//主UI
            this._uiStack.add(ui, !visible || bottom)
        } else {//子UI
            this._subUIStack.add(ui, !visible || bottom)
        }
        ui.setArgs(args);
        if (visible) {
            let belowUI = this._uiStack[this._uiStack.length - 2];
            ui.onShowBegin();
            belowUI?.onPassive(EUIFormPassiveType.HideBegin, ui);
            EventMgr.emit(EventKey.OnUIShowBegin, ui);
            if (playAnim) await ui.playShowAnim();
            ui.onShow();
            belowUI?.onPassive(EUIFormPassiveType.Hide, ui);
            EventMgr.emit(EventKey.OnUIShow, ui);
        } else {
            ui.onShowBegin();
            ui.onShow();
        }
        return ui as T;
    }

    public async hide(uiName: string, blockTime = 0.2, fastHide = false): Promise<void> {
        this.blockTime = blockTime;
        this._uiNameStack.remove(uiName);
        this._subUINameStack.remove(uiName);
        let ui = this._uiDict.get(uiName);
        if (!ui?.isValid) return;
        let hideUI = () => {
            if (ui.destroyNode) {
                ui.node.destroy();
                this._uiDict.delete(uiName);
                AssetMgr.decRef(uiName);
            }
            else {
                ui.node.active = false;
            }
        };
        let index = this._uiStack.indexOf(ui)
        if (index > -1) {//关闭主UI
            this._uiStack.remove(ui);
            if (index == this._uiStack.length) {//关闭最上层UI
                let topUI = this._uiStack[this._uiStack.length - 1];
                ui.onHideBegin();
                topUI?.onPassive(EUIFormPassiveType.ShowBegin, ui);
                EventMgr.emit(EventKey.OnUIHideBegin, ui);
                if (!fastHide) await ui.playHideAnim();
                ui.onHide();
                hideUI();
                topUI?.onPassive(EUIFormPassiveType.Show, ui);
                EventMgr.emit(EventKey.OnUIHide, ui);
            } else {//快速关闭非最上层UI 不播动画
                EventMgr.emit(EventKey.OnUIHideBegin, ui);
                ui.onHide();
                hideUI();
                EventMgr.emit(EventKey.OnUIHide, ui);
            }
            return;
        }
        index = this._subUIStack.indexOf(ui)
        if (index > -1) {//关闭子UI
            this._subUIStack.remove(ui);
            if (index == this._subUIStack.length) {//关闭最上层UI
                let topUI = this._subUIStack[this._subUIStack.length - 1];
                ui.onHideBegin();
                topUI?.onPassive(EUIFormPassiveType.ShowBegin, ui);
                EventMgr.emit(EventKey.OnUIHideBegin, ui);
                if (!fastHide) await ui.playHideAnim();
                ui.onHide();
                hideUI();
                topUI?.onPassive(EUIFormPassiveType.Show, ui);
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

    public async showHigher(uiName: string, obj?: { args?: any, visible?: boolean, onProgress?: Progress }) {
        let { args, visible, onProgress } = obj || {};
        visible = visible === undefined ? true : visible;
        this.blockTime = 0.2;
        let ui = await this.initUI(uiName, this._higher, visible, false, onProgress);
        ui.setArgs(args);
        EventMgr.emit(EventKey.OnUIShow, ui);
        return ui;
    }

    public hideHigher(uiName: string) {
        let ui = this._uiDict.get(uiName);
        if (!ui?.isValid) return;
        if (ui.destroy) {
            ui.node.destroy();
            this._uiDict.delete(uiName);
        }
        else ui.node.active = false;
        EventMgr.emit(EventKey.OnUIHide, ui);
    }

    public async showResident(uiName: string) {
        await this.instNode(uiName, this._resident);
    }

    public hideAll(...exclude: string[]) {
        let hideList = this._uiStack.filter(ui => exclude.indexOf(ui.uiName) == -1);
        hideList.forEach(ui => {
            this.hide(ui.uiName, 0.2, true);
        });
    }

    private async initUI(uiName: string, parent: Node, visible = true, bottom = false, onProgress?: Progress): Promise<UIForm> {
        let ui = this._uiDict.get(uiName);
        if (!ui?.isValid) {
            if (this._loadingUI.has(uiName)) {
                ui = await this.waitUILoad(uiName);
            } else {
                this._loadingUI.add(uiName);
                let node = await this.instNode(uiName, parent, onProgress);
                ui = node.getComponent(UIComponent) as UIForm;
                ui.init(uiName);
                this._uiDict.set(uiName, ui);
                this._loadingUI.delete(uiName);
            }
        }
        ui.node.active = true;
        ui.setVisible(visible);
        ui.node.setSiblingIndex(visible && !bottom ? 999999 : 0);
        return ui;
    }

    private async waitUILoad(uiName: string) {
        while (!this._uiDict.get(uiName)) {
            await this.nextFrame();
        }
        return this._uiDict.get(uiName);
    }

    private nextFrame() {
        let p = new Promise((resolve) => {
            this.scheduleOnce(resolve);
        });
        return p;
    }

    private async instNode(uiName: string, parent: Node, onProgress?: Progress): Promise<Node> {
        let prefab = await AssetMgr.loadAsset(uiName, Prefab, onProgress);
        let uiObj = instantiate(prefab);
        uiObj.parent = parent;
        uiObj.matchParent(true);
        return uiObj;
    }

    public getUIArgs(uiName: string) {
        return this._uiArgs.get(uiName);
    }

    /** 判断是否最上层UI isRealTime true:实时的,调用show方法瞬间即生效 false:ui加载完成才生效 */
    public isTopUI(uiName: string, isRealTime = false) {
        if (isRealTime) {
            if (this._uiNameStack.length == 0 && this._subUINameStack.length == 0) return false;
            return this._uiNameStack[this._uiNameStack.length - 1] == uiName || this._subUINameStack[this._subUINameStack.length - 1] == uiName;
        } else {
            if (this._uiStack.length == 0 && this._subUIStack.length == 0) return false;
            let ui = this._uiDict.get(uiName);
            if (!ui?.isValid) return false;
            return this._uiStack[this._uiStack.length - 1] == ui || this._subUIStack[this._subUIStack.length - 1] == ui;
        }
    }

    public getUI<T extends UIForm>(name: string) {
        let ui = this._uiDict.get(name);
        if (ui?.isValid) {
            return ui as T;
        }
        return null;
    }

    /* 获取UI在栈中的层级,栈顶为0,向下依次递增  */
    public getUIIndex(uiName: string) {
        let ui = this._uiDict.get(uiName);
        if (!ui?.isValid) return -1;
        if (ui.node.parent != this._normal) return -1;
        let index = this._uiStack.indexOf(ui);
        if (index > -1) {
            return this._uiStack.length - 1 - index;
        }
        else {
            return -1;
        }
    }

    /* UI是否在显示的UI栈中 */
    public isUIInStack(ui: UIForm) {
        return this._uiStack.indexOf(ui) > -1;
    }

    /* UI是否被其它全屏UI覆盖 */
    public isUIBeCover(ui?: UIForm) {
        if (!ui?.isValid) {
            //非UI,在UI下层
            for (const v of this._uiStack) {
                if (v.fullScreen) return true;
            }
        }
        else {
            let index = this._uiStack.indexOf(ui);

            if (index > -1) {
                for (let i = index + 1; i < this._uiStack.length; i++) {
                    let v = this._uiStack[i];
                    if (v.fullScreen) return true;
                }
            }
        }
        return false;
    }

    /** 调用指定UI上的methodName方法 */
    public sendMessage(uiName: string, methodName: string, ...args: any[]) {
        let ui = this._uiDict.get(uiName);
        if (!ui?.isValid) return -1;
        let method: Function = ui[methodName];
        if (method && typeof method === "function") {
            method.apply(ui, args);
        } else {
            mLogger.error(`${UIConstant[uiName]}上未找到指定方法 ${methodName}`);
        }
    }

    /** 检测是否在短时间内(0.1s)连续打开同一UI 抛出警告 */
    private checkShowUI(uiName: string, visible: boolean) {
        if (!visible) return;
        let now = Date.now();
        if (this._openUITime.has(uiName)) {
            let lastTime = this._openUITime.get(uiName);
            if (now - lastTime < 100) {
                console.warn(`短时间内连续打开UI[${uiName}] 请检查是否有逻辑问题`);
            }
        }
        this._openUITime.set(uiName, now);
    }

    protected update(dt: number) {
        if (this._blockTime > 0) this._blockTime -= dt;
        this._blockInput.active = this._blockTime > 0;
    }
}
