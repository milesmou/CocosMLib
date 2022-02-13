const { ccclass, property } = cc._decorator;

import UIBase from "../ui/UIBase";
import UITipMsg from "../ui/UITipMsg";
import UIGUide from "../ui/UIGuide";
import { app } from "../App";
import { Utils } from "../utils/Utils";

export enum UIKey {
    UIGuide = "ui/UIGuide",
    UITipMsg = "ui/UITipMsg",
    //testui
    UIMenu = "testui/UIMenu",
    UIUITest = "testui/UIUITest",
    UIPopUp1 = "testui/UIPopUp1",
    UIPopUp2 = "testui/UIPopUp2",

    UIAudio = "testui/UIAudio",
}


@ccclass
export default class UIMgr extends cc.Component {

    public static Inst: UIMgr = null;

    /** 普通的UI页面 */
    @property(cc.Node)
    private normal: cc.Node = null;
    /** 比较上层的UI界面(如切换地图或UI时的加载界面)不参与UI堆栈 */
    @property(cc.Node)
    public higher: cc.Node = null;
    /** 固定在最上层的UI界面(如提示信息、引导)不参与UI堆栈 */
    @property(cc.Node)
    public fixed: cc.Node = null;
    /** 弹窗UI的半透明遮罩 */
    @property(cc.Node)
    private shade: cc.Node = null;
    /** 拦截所有UI事件的组件 */
    @property(cc.Node)
    private blockNode: cc.Node = null;
    /** UI的缓存Map */
    private uiMap: Map<UIKey, UIBase> = new Map();
    /** 加载完成的UI栈 */
    private uiStack: UIBase[] = [];
    /** UIKey的堆栈,这个栈是实时的,因为UI加载需要时间 */
    private uiKeyStack: UIKey[] = [];

    private blockTime = 0;
    /** 屏蔽用户输入事件时间,小于0表示立即停止屏蔽事件 */
    public set BlockTime(value: number) {
        if (value > this.blockTime) {
            this.blockTime = value;
        }
        if (value < 0) {
            this.blockTime = 0;
        }
    }

    /** UI中的子UIKey列表,子UI不参与主UI堆栈 */
    private subUIKeyList: UIKey[] = [];
    /** UI中的子UI列表,子UI不参与主UI堆栈 */
    private subUIList: UIBase[] = [];
    /** 记录上一次请求打开UI的时间 抛出短时间内(0.1s)连续打开同一UI的警告 */
    private lastOpenUITime: Map<UIKey, number> = new Map();

    //固定在最高层UI
    public guide: UIGUide = null;
    private tipMsg: UITipMsg = null;

    onLoad() {
        UIMgr.Inst = this;
        this.init();
    }

    /** 初始化 */
    public async init() {
        this.blockNode.setContentSize(app.winSize);
        //添加上层ui
        this.tipMsg = await this.showHigher(UIKey.UITipMsg) as UITipMsg;
        this.guide = await this.showHigher(UIKey.UIGuide) as UIGUide;
    }

    /**
     * 打开一个UI界面
     * @param obj parent 允许自定义UI父节点,UI间的层级顺序只有父节点相同时有效(父节点所在UI关闭时,必须手动关闭父节点下所有UI)
     */
    public async show<T extends UIBase>(name: UIKey, obj?: { args?: any, visible?: boolean, parent?: cc.Node, blockTime?: number, onShow?: (ui: T) => void }) {
        this.checkShowUIFrequently(name);
        let { args, visible, parent, blockTime, onShow } = obj || {};
        visible = visible == undefined ? true : visible;
        blockTime = blockTime == undefined ? 0.5 : blockTime;
        this.BlockTime = blockTime;
        Utils.delItemFromArray(this.uiKeyStack, name);
        if (!parent) {
            if (visible) {
                this.uiKeyStack.push(name);
            } else {
                this.uiKeyStack.unshift(name);
            }
        } else {
            this.subUIKeyList.push(name);
        }
        app.event.emit(app.eventKey.OnUIInitBegin, name);
        let ui = await this.initUI(name);
        if (!this.uiKeyStack.includes(name) && !this.subUIKeyList.includes(name)) return; //UI未加载成功就已被关闭 
        Utils.delItemFromArray(this.uiStack, ui);
        if (!parent) {
            if (visible) {
                this.uiStack.push(ui);
            } else {
                this.uiStack.unshift(ui);
            }
        } else {//子UI存放在列表中,不参与主UI的堆栈
            this.subUIList.push(ui);
        }
        ui.setArgs(args);
        ui.setVisible(visible);
        ui.node.parent = parent || this.normal;
        ui.node.setSiblingIndex(visible ? 10000 : 0);
        if (visible) {
            this.setShade();
            ui.onShowBegin();
            app.event.emit(app.eventKey.OnUIShowBegin, ui);
            ui.playShowAnim(() => {
                ui.onShow();
                app.event.emit(app.eventKey.OnUIShow, ui);
                onShow && onShow(ui as T);
            });
        }
    }

    public async hide(name: UIKey, blockTime = 0.25): Promise<void> {
        let ui = this.uiMap.get(name);
        if (!ui || !ui.isValid) return;
        this.BlockTime = blockTime;
        Utils.delItemFromArray(this.uiKeyStack, name);
        let index = this.uiStack.indexOf(ui);
        let hideUI = () => {
            this.setShade();
            if (ui.destroyNode) {
                ui.node.destroy();
                ui.node.removeFromParent();
                this.uiMap.delete(name);
            } else if (ui.isValid) {
                ui.node.active = false;
            }
        }
        if (index > -1) {
            Utils.delItemFromArray(this.uiStack, ui);
            if (index == this.uiStack.length) {
                ui.onHideBegin();
                app.event.emit(app.eventKey.OnUIHideBegin, ui);
                ui.playHideAnim(() => {
                    ui.onHide();
                    app.event.emit(app.eventKey.OnUIHide, ui);
                    hideUI();
                });
            } else {
                hideUI();
            }
        } else {
            //子UI列表
            index = this.subUIList.indexOf(ui);
            if (index > -1) {
                hideUI();
                Utils.delItemFromArray(this.subUIKeyList, name);
                Utils.delItemFromArray(this.subUIList, ui);
            }
        }
    }

    public async showHigher<T extends UIBase>(name: UIKey, args?: any[]) {
        let ui = await this.initUI(name);
        ui.setArgs(args);
        ui.node.parent = this.higher;
        app.event.emit(app.eventKey.OnUIShow, ui);
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
        app.event.emit(app.eventKey.OnUIHide, ui);
    }

    public hideAll(exclude?: UIKey[]) {
        let len = this.uiStack.filter(v => !exclude || exclude.includes(v.uiName)).length;
        while (this.uiStack.length > len) {
            let ui = this.uiStack.find(v => !exclude || !exclude.includes(v.uiName));
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
        return ui;
    }

    private async instNode(name: UIKey): Promise<cc.Node> {
        let p = new Promise<cc.Node>((resolve, reject) => {
            app.res.load(name, cc.Prefab).then(prefab => {
                let ui = this.uiMap.get(name);
                if (ui?.isValid) {
                    resolve(ui.node);
                } else {
                    let node: cc.Node = cc.instantiate(prefab);
                    node.setContentSize(app.winSize);
                    node.position = cc.v3(0, 0);
                    resolve(node);
                }
            }).catch(e => {
                reject(e);
            })
        });
        return p;
    }

    /** 检测是否在短时间内(0.1s)连续打开同一UI 抛出警告 */
    private checkShowUIFrequently(name: UIKey) {
        if (this.lastOpenUITime.get(name)) {
            let lastTime = this.lastOpenUITime.get(name);
            if (Date.now() - lastTime < 100) {
                cc.warn(`短时间内连续打开UI[${name}] 请检查是否有逻辑问题`)
            }
        }
        this.lastOpenUITime.set(name, Date.now());
    }

    /** 当前UI是否是栈顶的UI */
    public isTopUI(name: UIKey | string, immediate = false) {
        let ui = this.uiMap.get(name as UIKey);
        if (!ui?.isValid) return false;
        if (!immediate) {
            return this.uiStack[this.uiStack.length - 1] == ui || this.subUIList[this.subUIList.length - 1] == ui;
        } else {
            return this.uiKeyStack[this.uiKeyStack.length - 1] == name || this.subUIKeyList[this.subUIKeyList.length - 1] == name;
        }
    }

    public getUI<T extends UIBase>(name: UIKey | string) {
        let ui = this.uiMap.get(name as UIKey);
        if (ui && ui.isValid) {
            return ui as T;
        }
    }

    /** 获取UI在栈中的层级,栈顶为0,向下依次递增 */
    public getUIIndex(name: UIKey | string, immediate = false) {
        let index = -1;
        if (immediate) {
            index = this.uiKeyStack.indexOf(name as UIKey);
        } else {
            let ui = this.uiMap.get(name as UIKey);
            index = this.uiStack.indexOf(ui);
        }
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
        let hideUICnt = 0;
        this.normal.children.forEach(v => {
            if (v.active == false) {
                hideUICnt++;
            }
        })
        for (let i = this.uiStack.length - 1; i >= 0; i--) {
            let ui = this.uiStack[i];
            if (ui?.showShade) {
                this.shade.setSiblingIndex(hideUICnt + i);
                ui.node.setSiblingIndex(hideUICnt + i + 1);
                cc.tween(this.shade).to(0.15, { opacity: 255 }).start();
                return;
            }
        }
        cc.tween(this.shade).to(0.15, { opacity: 0 }).start();
    }

    lateUpdate(dt: number) {
        if (this.blockTime > 0) {
            this.blockTime -= dt;
        }
        if (this.blockTime > 0) {
            this.blockNode.active = true;
        } else {
            this.blockNode.active = false;
        }
    }

    /** 通过UI的名字 调用UI上的方法 */
    sendMessage(name: UIKey, funcName: string, ...args) {
        let ui = this.uiMap.get(name);
        if (ui?.isValid) {
            let func: Function = ui[funcName];
            if (func && typeof func === "function") {
                func.apply(ui, args);
            } else {
                console.error("UI不存在指定方法", name, funcName);
            }
        } else {
            console.error("UI不存在", name);
        }
    }

    //#region 提示信息
    /** 显示单条提示 */
    showTip(content: string) {
        if (this.tipMsg) {
            this.tipMsg.showTip(content);
        }
    }
    /** 显示向上浮动提示 */
    showToast(content: string) {
        if (this.tipMsg) {
            this.tipMsg.showToast(content);
        }
    }
    /**
     * 显示确认框
     * @param content 提示内容
     * @param boxType 提示框类型 1：一个确认按钮 2：确认和取消按钮
     * @param opts 确认和取消按钮回调
     */
    showConfirm(content: string, args: { boxType: 1 | 2, confirmText?: string, cancelText?: string, cbConfirm?: Function, cbCancel?: Function }) {
        if (this.tipMsg) {
            this.tipMsg.showConfirm(content, args);
            app.event.emit(app.eventKey.OnUIShow, this.tipMsg, app.eventKey.OnUIShow);
        }
    }
    //#endregion
}