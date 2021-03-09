import UIBase from "./UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UITipMsg extends UIBase {

    @property(cc.Node)
    singleTip: cc.Node = null;
    @property(cc.Label)
    singleTipContent: cc.Label = null;

    @property(cc.Node)
    tipGroup: cc.Node = null;
    tipItem: cc.Node = null;
    tipPool: cc.NodePool = null;

    @property(cc.Node)
    tipBox: cc.Node = null;
    @property(cc.Label)
    tipBoxContent: cc.Label = null;
    @property(cc.Button)
    btnConfirm: cc.Button = null;
    @property(cc.Button)
    btnCancel: cc.Button = null;
    cbConfirm: Function = null;
    cbCancel: Function = null;

    onLoad() {
        this.singleTip.active = true;
        this.singleTip.opacity = 0;

        this.tipGroup.active = true;
        this.tipItem = this.tipGroup.children[0];
        this.tipPool = new cc.NodePool();
        for (let i = 0, len = 10; i < len; i++) {
            let tip: cc.Node = cc.instantiate(this.tipItem);
            tip["Miles_Content"] = tip.getComponentInChildren(cc.Label);
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
        this.singleTip.stopAllActions();
        this.singleTip.opacity = 255;
        this.singleTipContent.string = content;
        cc.tween(this.singleTip)
            .delay(1.2)
            .to(0.2, { opacity: 0 })
            .start();
    }

    /**
     * 显示向上浮动提示
     * @param content 提示内容
     */
    showTips(content: string) {
        let tip = this.tipPool.get();
        if (!tip) {
            tip = cc.instantiate(this.tipItem);
            tip["Miles_Content"] = tip.getComponentInChildren(cc.Label);
        }
        (tip["Miles_Content"] as cc.Label).string = content;
        tip["Miles_Move"] = true;
        tip.opacity = 255;
        tip.y = 0;
        tip.parent = this.tipGroup;
        let count = this.tipGroup.childrenCount;
        if (count > 1 && this.tipGroup.children[count - 2].y < 45) {
            let deltaY = 45 - this.tipGroup.children[count - 2].y;
            for (let i = count - 2; i >= 0; i--) {
                let y = this.tipGroup.children[i].y + deltaY;
                this.tipGroup.children[i].y = y <= this.tipGroup.height ? y : this.tipGroup.height;
            }
        }
    }

    update(dt) {
        for (let i = 0, len = this.tipGroup.childrenCount; i < len; i++) {
            let tip = this.tipGroup.children[i];
            if (tip["Miles_Move"]) {
                tip.y += 200 * dt;
                if (tip.y >= this.tipGroup.height) {
                    tip["Miles_Move"] = false;
                    cc.tween(tip)
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
    showTipBox(content: string, boxType = 2,  cbConfirm?: Function, cbCancel?: Function ) {
        this.tipBox.active = true;
        this.tipBoxContent.string = content;
        this.btnConfirm.node.once("click", this.Confirm, this);
        this.btnCancel.node.once("click", this.Cancel, this);
        this.btnCancel.node.active = boxType == 2;
        this.cbConfirm = cbConfirm;
        this.cbCancel = cbCancel;
    }

    Confirm() {
        this.cbConfirm && this.cbConfirm();
        this.tipBox.active = false;
    }

    Cancel() {
        this.cbCancel && this.cbCancel();
        this.tipBox.active = false;
    }

}

