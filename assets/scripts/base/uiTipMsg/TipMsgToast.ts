import { _decorator, instantiate, Label, misc, Node, tween, UIOpacity, v3 } from 'cc';
import { ObjectPool } from 'db://assets/mlib/module/pool/ObjectPool';
import { UIComponent } from 'db://assets/mlib/module/ui/manager/UIComponent';
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


@ccclass('TipMsgToast')
export class TipMsgToast extends UIComponent {

    ///提示组
    private _toastItem: Node;
    private _toastMaxHeight = 300;//最大移动高度
    private _toastMoveSpeed = 200;//移动速度 多少像素每秒
    private _toastPool: ObjectPool<ToastItem>;
    private _toasts: ToastItem[] = [];

    protected onLoad() {
        this._toastItem = this.node.children[0];
        this._toastPool = new ObjectPool({
            createNum: 10,
            newObject: () => {
                let toastItem = new ToastItem();
                let node = instantiate(this._toastItem);
                toastItem.node = node;
                toastItem.content = node.getComponentInChildren(Label);
                toastItem.uiOpacity = node.ensureComponent(UIOpacity);
                return toastItem;
            },
            onPutObject: obj => {
                obj.node.parent = null;
            },
        });
        this._toastItem.parent = null;
    }

    /**
    * 显示向上浮动提示
    * @param content 提示内容
    */
    public show(content: string) {
        let toast = this._toastPool.get();
        this._toasts.push(toast);
        toast.content.string = content;
        toast.uiOpacity.opacity = 255;
        toast.move = true;
        toast.node.position = v3(0, 0);
        toast.node.parent = this.node;
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

    protected update(dt: number) {
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

}

