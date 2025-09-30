import { BlockInputEvents, Camera, Component, Node, Prefab, SpriteFrame, _decorator } from 'cc';

const { ccclass, property, requireComponent } = _decorator;

import { Canvas, ResolutionPolicy, math, view } from 'cc';
import { UIConstant } from '../../../../scripts/gen/UIConstant';
import { CCUtils } from '../../../utils/CCUtil';
import { AssetMgr } from '../../asset/AssetMgr';
import { EventMgr } from '../../event/EventMgr';
import { EUIFormClose } from './EUIFormClose';
import { EUIFormPassiveType } from './EUIFormPassiveType';
import { UIComponent } from './UIComponent';
import { UIForm } from './UIForm';
import { UIStack } from './UIStack';

/** 最小屏幕比例 */
const MinScreenRatio = 16 / 9;

/** UI打开关闭时阻挡操作的时间 */
const UIBlockTime = 0.2;

/** 打开UI时的参数 */
interface ShowUIParam {
    /** 传递到UI的自定义参数 */
    args?: any;
    /** UI的父节,不填默认为UIRoot下的Normal节点 */
    parent?: Node;
    /** 是否播放打开动画 默认true(UI面板开启动画才有效) */
    playAnim?: boolean;
    /** 指定打开动画的名字 默认根节点Animation组件第1个动画 */
    animName?: string;
    /** UI是否显示 默认true*/
    visible?: boolean;
    /** 是否将UI加载到最下层 */
    bottom?: boolean;
    /** UI加载进度回调 */
    onProgress?: Progress
}

/** 关闭UI时的参数 */
interface HideUIParam {
    /** 是否播放关闭动画 默认true(UI面板开启动画才有效) */
    playAnim?: boolean;
    /** 指定关闭动画的名字 默认根节点Animation组件第2个动画 */
    animName?: string;
}

@ccclass("UIMgr")
@requireComponent(Canvas)
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
    /** 拦截所有触摸事件的节点(手动管理) */
    private _blockInput: Node
    /** 拦截所有触摸事件的节点(定时自动管理) */
    private _blockInputTime: Node

    /** 正在加载过程中的UI */
    private _loadingUI: Set<string> = new Set();
    /** UI的缓存Dict */
    private _uiDict: Map<string, UIForm> = new Map();
    /** 实时的UI栈(加载UI需要时间) */
    private _uiNameStack: UIStack<string> = new UIStack();
    /** 加载完成的UI栈 */
    private _uiStack: UIStack<UIForm> = new UIStack();

    public _whiteSplash: SpriteFrame = null;
    /** 纯白色贴图 */
    public get whiteSplash() { return this._whiteSplash; }

    /** 最上层的UI */
    public get topUI() {
        return this._uiStack.flatArr[this._uiStack.flatArr.length - 1];
    }

    /** 拦截所有触摸事件的节点(手动显示隐藏) */
    public get block() { return this._blockInput; }

    private _blockTime = 0;
    /** 描屏蔽用户输入事件时间(秒),小于0表示立即停止屏蔽触摸事件 */
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
        this._camera = this.getComponent(Canvas).cameraComponent;
        this.updateCanvasResolution();
        this.init();
    }

    protected start(): void {
        this.node.on(Node.EventType.SIZE_CHANGED, this.updateCanvasResolution, this);
    }

    protected onDestroy(): void {
        this.node.on(Node.EventType.SIZE_CHANGED, this.updateCanvasResolution, this);
    }

    private init() {
        //创建3个UI层级
        this._normal = CCUtils.createUINode("Normal", this.node);
        this._normal.matchParent();
        this._higher = CCUtils.createUINode("Higher", this.node);
        this._higher.matchParent();
        this._resident = CCUtils.createUINode("Resident", this.node);
        this._resident.matchParent();
        //创建拦截所有触摸事件的节点
        this._blockInput = CCUtils.createUINode("BlockInput", this.node);
        this._blockInput.addComponent(BlockInputEvents);
        this._blockInput.matchParent();
        this._blockInput.active = false;
        //创建拦截所有触摸事件的节点
        this._blockInputTime = CCUtils.createUINode("BlockInputTime", this.node);
        this._blockInputTime.addComponent(BlockInputEvents);
        this._blockInputTime.matchParent();
        //加载默认的单色精灵帧
        AssetMgr.loadAsset("DefaultSprite", SpriteFrame).then(sp => {
            this._whiteSplash = sp;
        });
        //加载Loading界面
        AssetMgr.loadAsset(UIConstant.Loading, Prefab).then(prefab => {
            instantiate(prefab).parent = this._resident;
        });
    }

    public async show<T extends UIForm>(uiName: string, options?: ShowUIParam): Promise<T> {
        let { args, parent, playAnim, animName, visible, bottom, onProgress } = options || {};
        playAnim = playAnim === undefined ? true : playAnim;
        visible = visible === undefined ? true : visible;
        bottom = bottom === undefined ? false : bottom;
        let parentUI = parent ? parent.getComponentInParent("UIBase") as UIForm : undefined;
        let parentUIName = parentUI ? parentUI.name : undefined;
        this._uiNameStack.add(uiName, !visible || bottom, parentUIName);
        this.blockTime = UIBlockTime;
        this.checkShowUI(uiName, visible);
        EventMgr.emit(mEventKey.OnUIInitBegin, uiName, visible);
        this._uiArgs[uiName] = args;
        let ui = await this.initUI(uiName, parent || this._normal, visible, bottom, onProgress);
        if (!ui) return;
        this._uiStack.add(ui, !visible || bottom, parentUI)
        ui.setArgs(args);
        if (visible) {
            let belowUI = this._uiStack.flatArr[this._uiStack.flatArr.length - 2];
            ui.onShowBegin();
            belowUI?.onPassive(EUIFormPassiveType.HideBegin, ui);
            EventMgr.emit(mEventKey.OnUIShowBegin, ui);
            if (playAnim) await ui.playShowAnim(animName);
            ui.onShow();
            belowUI?.onPassive(EUIFormPassiveType.Hide, ui);
            EventMgr.emit(mEventKey.OnUIShow, ui);
        } else {
            ui.onShowBegin();
            ui.onShow();
        }
        return ui as T;
    }

    public async hide(uiName: string, options?: HideUIParam): Promise<void> {

        let { playAnim, animName } = options || {};
        playAnim = playAnim === undefined ? true : playAnim;

        this.blockTime = UIBlockTime;
        this._uiNameStack.remove(uiName);
        let ui = this._uiDict.get(uiName);
        if (!ui?.isValid) return;
        let hideUI = () => {
            if (ui.whenClose > EUIFormClose.NONE) {
                ui.node.destroy();
                this._uiDict.delete(uiName);
                if (ui.whenClose == EUIFormClose.Release) {
                    ui.release();
                }
            }
            else {
                ui.node.active = false;
            }
        };
        let isTopUI = this._uiStack.isTop(ui);
        this._uiStack.remove(ui);
        if (isTopUI) {//关闭最上层UI
            let topUI = this._uiStack.flatArr[this._uiStack.flatArr.length - 1];
            ui.onHideBegin();
            topUI?.onPassive(EUIFormPassiveType.ShowBegin, ui);
            EventMgr.emit(mEventKey.OnUIHideBegin, ui);
            if (playAnim) await ui.playHideAnim(animName);
            ui.onHide();
            hideUI();
            topUI?.onPassive(EUIFormPassiveType.Show, ui);
            EventMgr.emit(mEventKey.OnUIHide, ui);
        } else {//快速关闭非最上层UI 不播动画
            EventMgr.emit(mEventKey.OnUIHideBegin, ui);
            ui.onHide();
            hideUI();
            EventMgr.emit(mEventKey.OnUIHide, ui);
        }
    }

    public async showHigher(uiName: string, obj?: { args?: any, visible?: boolean, onProgress?: Progress }) {
        let { args, visible, onProgress } = obj || {};
        visible = visible === undefined ? true : visible;
        this.blockTime = 0.2;
        let ui = await this.initUI(uiName, this._higher, visible, false, onProgress);
        ui.setArgs(args);
        EventMgr.emit(mEventKey.OnUIShow, ui);
        return ui;
    }

    public hideHigher(uiName: string) {
        let ui = this._uiDict.get(uiName);
        if (!ui?.isValid) return;
        if (ui.whenClose > EUIFormClose.NONE) {
            ui.node.destroy();
            this._uiDict.delete(uiName);
            if (ui.whenClose == EUIFormClose.Release) {
                ui.release();
                AssetMgr.decRef(uiName, Prefab);
            }
        }
        else {
            ui.node.active = false;
        }
        EventMgr.emit(mEventKey.OnUIHide, ui);
    }

    public async showResident(uiName: string) {
        await this.instNode(uiName, this._resident);
    }

    public hideAll(...exclude: string[]) {
        let hideList = this._uiStack.flatArr.filter(ui => exclude.indexOf(ui.uiName) == -1);
        hideList.forEach(ui => {
            this.hide(ui.uiName, { playAnim: false });
        });
    }

    private async initUI(uiName: string, parent: Node, visible = true, bottom = false, onProgress?: Progress): Promise<UIForm> {
        if (visible) this._blockInput.active = true;
        let ui = this._uiDict.get(uiName);
        if (!ui?.isValid) {
            if (this._loadingUI.has(uiName)) {
                ui = await this.waitUILoad(uiName);
            } else {
                this._loadingUI.add(uiName);
                let node = await this.instNode(uiName, parent, false, onProgress);
                if (!node) return;
                ui = node.getComponent(UIComponent) as UIForm;
                ui.onCreate();
                ui.init(uiName);
                this._uiDict.set(uiName, ui);
                this._loadingUI.delete(uiName);
            }
        } else {
            onProgress && onProgress(1, 1);
        }
        ui.node.active = true;
        ui.setVisible(visible);
        ui.node.setSiblingIndex(visible && !bottom ? 999999 : 0);
        if (visible) this._blockInput.active = false;
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

    private async instNode(uiName: string, parent: Node, active = true, onProgress?: Progress): Promise<Node> {
        let prefab = await AssetMgr.loadAsset(uiName, Prefab, onProgress);
        if (!prefab) return;
        let uiObj = instantiate(prefab);
        uiObj.active = active;
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
            return this._uiNameStack.isTop(uiName);
        } else {
            let ui = this._uiDict.get(uiName);
            if (!ui?.isValid) return false;
            return this._uiStack.isTop(ui);
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
        let index = this._uiStack.flatArr.indexOf(ui);
        if (index > -1) {
            return this._uiStack.flatArr.length - 1 - index;
        } else {
            return -1;
        }
    }

    /**
     * UI是否在显示的UI栈中
     */
    public isUIInStack(uiName: string);
    public isUIInStack(ui: UIForm);
    public isUIInStack(ui: string | UIForm) {
        if (typeof ui === "string") return this._uiNameStack.has(ui);
        else return this._uiStack.has(ui);
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
            let index = this._uiStack.flatArr.indexOf(ui);
            if (index > -1) {
                for (let i = index + 1; i < this._uiStack.flatArr.length; i++) {
                    let v = this._uiStack.flatArr[i];
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
        this._blockInputTime.active = this._blockTime > 0;
    }


    /** 更新画布适配模式 */
    private updateCanvasResolution() {
        let designSize = view.getDesignResolutionSize();//设计分辨率
        let visibleSize = view.getVisibleSize();//实际视图分辨率

        if (designSize.width > designSize.height) {//横屏游戏
            let ratio = visibleSize.width / visibleSize.height;
            if (ratio < MinScreenRatio) {//平板
                view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
                this.updateCameraViewRect(1);
            } else {//手机
                view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
                this.updateCameraViewRect(0);
            }
        } else {//竖屏游戏
            let ratio = visibleSize.height / visibleSize.width;
            if (ratio < MinScreenRatio) {//平板
                view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
                this.updateCameraViewRect(2);
            } else {//手机
                view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
                this.updateCameraViewRect(0);
            }
        }
    }

    /** 更新摄像机视野范围 0:显示全部 1:横屏裁切上下 2:竖屏裁切左右 */
    private updateCameraViewRect(type: 0 | 1 | 2) {
        let visibleSize = view.getVisibleSize();
        switch (type) {
            case 0:
                this.camera.rect = math.rect(0, 0, 1, 1);
                break;
            case 1:
                let hRatio = visibleSize.width / MinScreenRatio / visibleSize.height;
                let y = (1 - hRatio) / 2;
                this.camera.rect = math.rect(0, y, 1, hRatio);
                break;
            case 2:
                let wRatio = visibleSize.height / MinScreenRatio / visibleSize.width;
                let x = (1 - wRatio) / 2;
                this.camera.rect = math.rect(x, 0, wRatio, 1);
                break;
        }
    }
}
