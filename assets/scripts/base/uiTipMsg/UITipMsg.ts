import { Label, Node, Tween, UIOpacity, _decorator, instantiate, misc, tween, v3 } from 'cc';
import { ObjectPool } from '../../../mlib/module/pool/ObjectPool';
import { UIComponent } from '../../../mlib/module/ui/manager/UIComponent';
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
    private _toastMaxHeight = 300;//最大移动高度
    private _toastMoveSpeed = 200;//移动速度 多少像素每秒
    private _toastPool: ObjectPool<ToastItem>;
    private _toasts: ToastItem[] = [];
    ///确认框
    private _confirmBox: Node;
    private _btnOk: Node;
    private _btnCancel: Node;

    private _titleText: string;//标题默认文字
    private _okText: string;//确认按钮默认文字
    private _cancelText: string;//取消按钮默认文字
    private _confirmTitle: Label;
    private _confirmDesc: Label;

    private _autoHideConfirm: boolean;
    private _cbConfirm: Function;
    private _cbCancel: Function;



    onLoad() {
        UITipMsg.Inst = this;

        this._singleTip = this.rc.get("SingleTip", Node);
        this._toastGroup = this.rc.get("ToastGroup", Node);
        this._confirmBox = this.rc.get("ConfirmBox", Node);
        this._confirmTitle = this.rc.get("ConfirmTitle", Label);
        this._confirmDesc = this.rc.get("ConfirmDesc", Label);
        this._btnOk = this.rc.get("btnOk", Node);
        this._btnCancel = this.rc.get("btnCancel", Node);

        this._titleText = this._confirmTitle.string;
        this._okText = this._btnOk.getComponentInChildren(Label).string;
        this._cancelText = this._btnCancel.getComponentInChildren(Label).string;

        this.init();
    }

    private init() {
        this._singleTip.active = true;
        this._singleTip.getComponent(UIOpacity).opacity = 0;

        this._toastGroup.active = true;
        this._toastItem = this._toastGroup.children[0];
        this._toastPool = new ObjectPool({
            createNum: 10,
            newObject: () => {
                let toastItem = new ToastItem();
                let node = instantiate(this._toastItem);
                toastItem.node = node
                toastItem.content = node.getComponentInChildren(Label);
                toastItem.uiOpacity = node.ensureComponent(UIOpacity);
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
        let uiOpacity = this._singleTip.ensureComponent(UIOpacity)!;
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
                toast.node.position = v3(0, toast.node.position.y + this._toastMoveSpeed * dt);
                if (toast.node.position.y >= this._toastMaxHeight) {//超出范围后消失
                    toast.move = false;
                    tween(toast.uiOpacity)
                        .to(0.2, { opacity: 0 })
                        .call(() => {
                            this._toastPool.put(toast);
                            this._toasts.delete(toast);
                        })
                        .start();
                }
            }
        }
    }

    /**
     * 显示确认框
     */
    showConfirm(desc: string, args: ConfirmArgs) {
        let { type, autoHide, cbOk, cbCancel, title, okText, cancelText } = args || {};
        autoHide = autoHide === undefined ? true : autoHide;
        title = title || this._titleText;
        okText = okText || this._okText;
        cancelText = cancelText || this._cancelText;

        this._confirmBox.active = true;
        this._confirmTitle.string = title;
        this._confirmDesc.string = desc;

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

