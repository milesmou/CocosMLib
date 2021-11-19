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
    /** 比较上层的UI界面(如提示信息、引导等等)不参与UI堆栈 */
    @property(cc.Node)
    private higher: cc.Node = null;
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


    //常驻高层UI
    public guide: UIGUide = null;
    public tipMsg: UITipMsg = null;

    onLoad() {
        UIMgr.Inst = this;
        this.init();
    }

    /** 初始化 */
    public async init() {
        //添加上层ui
        this.guide = await this.showHigher(UIKey.UIGuide) as UIGUide;
        this.tipMsg = await this.showHigher(UIKey.UITipMsg) as UITipMsg;
    }

    /**
     * 打开一个UI界面
     * @param obj parent 允许自定义UI父节点,UI间的层级顺序只有父节点相同时有效(父节点所在UI关闭时,必须手动关闭父节点下所有UI)
     */
    public async show<T extends UIBase>(name: UIKey, obj?: { args?: any, visible?: boolean, blockTime?: number, parent?: cc.Node, onShow?: (ui: T) => void }) {
        this.BlockTime = obj?.blockTime == undefined ? 0.5 : obj?.blockTime;
        let visible = obj?.visible == undefined ? true : obj.visible;
        Utils.delItemFromArray(this.uiKeyStack, name);
        visible ? this.uiKeyStack.push(name) : this.uiKeyStack.unshift(name);
        app.event.emit(app.eventKey.OnUIInitBegin, name);
        let ui = await this.initUI(name);
        if (!this.uiKeyStack.includes(name)) return; //UI未加载成功就已被关闭 

        Utils.delItemFromArray(this.uiStack, ui);
        visible ? this.uiStack.push(ui) : this.uiStack.unshift(ui);
        ui.setArgs(obj?.args);
        ui.setVisible(visible);
        ui.node.parent = obj?.parent || this.normal;
        ui.node.setSiblingIndex(visible ? 10000 : 0);
        if (visible) {
            this.setShade();
            ui.onShowBegin();
            app.event.emit(app.eventKey.OnUIShowBegin, ui);
            ui.playShowAnim(() => {
                ui.onShow();
                app.event.emit(app.eventKey.OnUIShow, ui);
                obj?.onShow && obj.onShow(ui as T);
            });
        }
    }

    public async hide(name: UIKey): Promise<void> {
        this.BlockTime = 0.25;
        Utils.delItemFromArray(this.uiKeyStack, name);
        let ui = this.uiMap.get(name);
        let index = this.uiStack.indexOf(ui)
        if (index > -1) {
            Utils.delItemFromArray(this.uiStack, ui);
            this.setShade();
            let hideUI = () => {
                if (ui.destroyNode) {
                    ui.node.destroy();
                    ui.node.removeFromParent();
                    this.uiMap.delete(name);
                } else if (ui.isValid) {
                    ui.node.active = false;
                }
            }
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
        }
    }

    public async showHigher<T extends UIBase>(name: UIKey, args?: any) {
        let ui = await this.initUI(name);
        ui.setArgs(args);
        ui.node.parent = this.higher;
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
                    node.width = this.normal.width;
                    node.height = this.normal.height;
                    node.position = cc.v3(0, 0);
                    resolve(node);
                }
            }).catch(e => {
                reject(e);
            })
        });
        return p;
    }

    /** 当前UI是否是栈顶的UI */
    public isTopUI(name: UIKey | string, immediate = false) {
        if (!name) return false;
        if (!immediate) {
            let topUI = this.uiStack[this.uiStack.length - 1];
            if (!topUI) return false;
            return topUI == this.uiMap.get(name as UIKey);
        } else {
            return this.uiKeyStack[this.uiKeyStack.length - 1] == name;
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
        //筛选出UIRoot下的UI
        let uiStack = this.uiStack.filter(v => this.normal.getChildByName(v.node.name));
        let hideUICnt = 0;
        this.normal.children.forEach(v => {
            if (v.active == false) {
                hideUICnt++;
            }
        })
        for (let i = uiStack.length - 1; i >= 0; i--) {
            let ui = uiStack[i];
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
    showConfirm(content: string, boxType = 2, cbConfirm?: Function, cbCancel?: Function) {
        if (this.tipMsg) {
            this.tipMsg.showConfirm(content, boxType, cbConfirm, cbCancel);
        }
    }
    //#endregion
}