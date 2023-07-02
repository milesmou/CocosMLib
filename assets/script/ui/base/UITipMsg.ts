import { Button, instantiate, Label, Node, NodePool, tween, Tween, UIOpacity, UITransform, v3, _decorator } from 'cc';
import { UIBase } from '../../../mlib/component/UIBase';
const { ccclass, property } = _decorator;


@ccclass('UITipMsg')
export class UITipMsg extends UIBase {
    @property(Node)
    singleTip: Node;
    @property(Label)
    singleTipContent: Label;

    @property(Node)
    tipGroup: Node;
    tipItem: Node;
    tipPool: NodePool;

    @property(Node)
    tipBox: Node;
    @property(Label)
    tipBoxContent: Label;
    @property(Button)
    btnConfirm: Button;
    @property(Button)
    btnCancel: Button;

    tipGroupTransform: UITransform;

    cbConfirm: Function = undefined;
    cbCancel: Function = undefined;

    onLoad() {
        this.singleTip.active = true;
        this.singleTip.getComponent(UIOpacity)!.opacity = 0;

        this.tipGroupTransform = this.tipGroup.getComponent(UITransform)!;
        this.tipGroup.active = true;
        this.tipItem = this.tipGroup.children[0];
        this.tipPool = new NodePool();
        for (let i = 0, len = 10; i < len; i++) {
            let tip: Node = instantiate(this.tipItem);
            (tip as any)["Miles_Content"] = tip.getComponentInChildren(Label)!;
            (tip as any)["Miles_UIOpacity"] = tip.getComponent(UIOpacity)!;
            this.tipPool.put(tip);
        }
        this.tipGroup.removeAllChildren();

        this.tipBox.active = false;
    }

    /**
     * 显示单条提示
     * @param content 提示内容
     */
    showTip(content: string) {
        let uiOpacity = this.singleTip.getComponent(UIOpacity)!;
        this.singleTipContent.string = content;
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
        let tip = this.tipPool.get();
        if (!tip) {
            tip = instantiate(this.tipItem);
            (tip as any)["Miles_Content"] = tip.getComponentInChildren(Label)!;
            (tip as any)["Miles_UIOpacity"] = tip.getComponent(UIOpacity)!;
        }
        (tip as any)["Miles_Content"].string = content;
        (tip as any)["Miles_UIOpacity"].opacity = 255;
        (tip as any)["Miles_Move"] = true;
        tip.position = v3(0, 0);
        tip.parent = this.tipGroup;
        let count = this.tipGroup.children.length;
        if (count > 1 && this.tipGroup.children[count - 2].position.y < 45) {
            let deltaY = 45 - this.tipGroup.children[count - 2].position.y;
            for (let i = count - 2; i >= 0; i--) {
                let y = this.tipGroup.children[i].position.y + deltaY;
                this.tipGroup.children[i].position = v3(0, y <= this.tipGroupTransform.height ? y : this.tipGroupTransform.height);
            }
        }
    }

    update(dt: number) {
        for (let i = 0, len = this.tipGroup.children.length; i < len; i++) {
            let tip = this.tipGroup.children[i];
            if ((tip as any)["Miles_Move"]) {
                tip.position = v3(0, tip.position.y + 200 * dt);
                if (tip.position.y >= this.tipGroupTransform.height) {
                    (tip as any)["Miles_Move"] = false;
                    tween((tip as any)["Miles_UIOpacity"] as UIOpacity)
                        .to(0.2, { opacity: 0 })
                        .call(() => {
                            this.tipPool.put(tip)
                        })
                        .start();
                }
            }
        }
    }

    /**
     * 显示提示框
     * @param content 提示内容
     * @param boxType 提示框类型 1：一个确认按钮 2：确认和取消按钮
     * @param opts 确认和取消按钮回调
     */
    showConfirm(content: string, boxType = 2, cbOk?: Function, cbCancel?: Function) {
        this.tipBox.active = true;
        this.tipBoxContent.string = content;
        this.btnConfirm.node.once("click", this.Confirm, this);
        this.btnCancel.node.once("click", this.Cancel, this);
        this.btnCancel.node.active = boxType == 2;
        this.cbConfirm = cbOk;
        this.cbCancel = cbCancel;
    }

    Confirm() {
        this.cbConfirm && this.cbConfirm();
        this.tipBox.active = false;
        this.showToast("Confirm");
    }

    Cancel() {
        this.cbCancel && this.cbCancel();
        this.tipBox.active = false;
        this.showToast("Cancel");
    }
}

