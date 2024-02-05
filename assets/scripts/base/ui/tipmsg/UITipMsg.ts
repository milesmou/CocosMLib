import { Label, Node, Tween, UIOpacity, UITransform, _decorator, instantiate, misc, tween, v3 } from 'cc';
import { ObjectPool } from '../../../../mlib/module/pool/ObjectPool';
import { UIComponent } from '../../../../mlib/module/ui/manager/UIComponent';
import { Utils } from '../../../../mlib/utils/Utils';
import { ConfirmArgs } from './ConfirmArgs';
const { ccclass, property } = _decorator;

class ToastItem {
    /** 节点 */
    node: Node;
    /** 文本组件 */
    content: Label;
    /** 透明度组件 */
    uiOpacity: UIOpacity;
    /** 是否正在移动 */
    move: boolean;
}


@ccclass('UITipMsg')
export class UITipMsg extends UIComponent {

    public static Inst: UITipMsg;

    ///单个提示
    private _singleTip: Node;

    ///提示组
    private _toastGroup: Node;
    private _toastItem: Node;
    private _toastMaxHeight = 400;
    private _toastPool: ObjectPool<ToastItem>;
    private _toasts: ToastItem[] = [];
    ///确认框
    private _confirmBox: Node;
    private _btnOk: Node;
    private _btnCancel: Node;


    private _autoHideConfirm: boolean;
    private _cbConfirm: Function;
    private _cbCancel: Function;


    onLoad() {
        UITipMsg.Inst = this;

        this._singleTip = this.rc.getNode("singleTip");
        this._toastGroup = this.rc.getNode("toastGroup");
        this._confirmBox = this.rc.getNode("confirmBox");
        this._btnOk = this.rc.getNode("btnOk");
        this._btnCancel = this.rc.getNode("btnCancel");

        this.init();
    }

    private init() {
        this._singleTip.active = true;
        this._singleTip.getComponent(UIOpacity).opacity = 0;

        this._toastGroup.active = true;
        this._toastItem = this._toastGroup.children[0];
        this._toastPool = new ObjectPool({
            defaultCreateNum: 10,
            newObject: () => {
                let toastItem = new ToastItem();
                let node = instantiate(this._toastItem);
                toastItem.node = node
                toastItem.content = node.getComponentInChildren(Label);
                toastItem.uiOpacity = node.getComponentInChildren(UIOpacity);
                return toastItem;
            },
            onPutObject: obj => {
                obj.node.parent = null;
            },
        });
        this._toastItem.parent = null;

        this._confirmBox.active = false;
    }


    /**
     * 显示单条提示
     * @param content 提示内容
     */
    showTip(content: string) {
        let uiOpacity = this._singleTip.getComponent(UIOpacity)!;
        this._singleTip.getComponentInChildren(Label).string = content;
        Tween.stopAllByTarget(uiOpacity);
        uiOpacity.opacity = 255;
        tween(uiOpacity)
            .delay(1.2)
            .to(0.2, { opacity: 0 })
            .start();
    }
    /**
     * 显示向上浮动提示
     * @param content 提示内容
     */
    showToast(content: string) {
        let toast = this._toastPool.get();
        this._toasts.push(toast);
        toast.content.string = content;
        toast.uiOpacity.opacity = 255;
        toast.move = true;
        toast.node.position = v3(0, 0);
        toast.node.parent = this._toastGroup;
        let count = this._toasts.length;
        if (count > 1) {//数量大于1 则需要检测其它item的位置 避免重叠
            let deltaY = 60;//item之间的间距
            for (let i = 0; i < count - 1; i++) {
                let minY = (count - i - 1) * deltaY;
                let node = this._toasts[i].node;
                node.position = v3(0, misc.clampf(node.position.y, minY, this._toastMaxHeight));
            }
        }
    }

    update(dt: number) {
        for (let i = 0, len = this._toasts.length; i < len; i++) {
            let toast = this._toasts[i];
            if (toast.move) {
                toast.node.position = v3(0, toast.node.position.y + 200 * dt);//移动速度每秒200个像素
                if (toast.node.position.y >= this._toastMaxHeight) {//超出范围后小时
                    toast.move = false;
                    tween(toast.uiOpacity)
                        .to(0.2, { opacity: 0 })
                        .call(() => {
                            this._toastPool.put(toast);
                            Utils.delItemFromArray(this._toasts, toast);
                        })
                        .start();
                }
            }
        }
    }

    /**
     * 显示确认框
     */
    showConfirm(content: string, args: ConfirmArgs) {
        let { type, autoHide, cbOk, cbCancel, okText, cancelText } = args || {};
        autoHide = autoHide === undefined ? true : autoHide;
        okText = okText || "確認";
        cancelText = cancelText || "取消";

        this._confirmBox.active = true;
        this._confirmBox.getComponentInChildren(Label).string = content;

        this._btnOk.once("click", this.confirm, this);
        this._btnOk.getComponentInChildren(Label).string = okText;
        this._btnCancel.once("click", this.cancel, this);
        this._btnCancel.getComponentInChildren(Label).string = cancelText;
        this._btnCancel.active = type == 2;

        this._cbConfirm = cbOk;
        this._cbCancel = cbCancel;
        this._autoHideConfirm = autoHide;
    }

    private confirm() {
        this._cbConfirm && this._cbConfirm();
        if (this._autoHideConfirm) {
            this._btnOk.off("click");
            this._confirmBox.active = false;
        }
    }

    private cancel() {
        this._cbCancel && this._cbCancel();
        if (this._autoHideConfirm) {
            this._btnCancel.off("click");
            this._confirmBox.active = false;
        }
    }
}

