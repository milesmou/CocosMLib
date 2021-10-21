import { app } from "../App";
import Language from "../component/Language";
import UIBase from "./UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UITipMsg extends UIBase {

    @property(cc.Node)
    singleTip: cc.Node = null;
    @property(cc.RichText)
    singleTipContent: cc.RichText = null;

    @property(cc.Node)
    tipGroup: cc.Node = null;
    tipGroupSpaceY = 50;

    @property(cc.Node)
    tipBox: cc.Node = null;
    @property(cc.RichText)
    tipBoxContent: cc.RichText = null;
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
        app.pool.initPool(app.poolKey.ToastItem, this.tipGroup.children[0], 5);

        this.tipGroup.removeAllChildren(true);
        this.tipBox.active = false;
    }

    /**
     * 显示单条提示
     * @param content 提示内容
     */
    showTip(content: string) {
        content = Language.getStringByID(content);
        if (!(content.startsWith("<color") && content.startsWith("</c>"))) {
            content = "<color=#00ffff>" + content + "</c>";
        }
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
        let tip = app.pool.get(app.poolKey.ToastItem);
        content = Language.getStringByID(content);
        if (!(content.startsWith("<color") && content.startsWith("</c>"))) {
            content = "<color=#00ffff>" + content + "</c>";
        }
        tip.getComponentInChildren(cc.RichText).string = content;
        tip.opacity = 255;
        tip.parent = this.tipGroup;
        for (let i = this.tipGroup.childrenCount - 1; i >= 0; i--) {
            let v = this.tipGroup.children[i];
            let posY = (this.tipGroup.childrenCount - 2 - i) * this.tipGroupSpaceY;
            v.y = posY;
        }
        cc.tween(tip).delay(1.5).to(0.3, { opacity: 0 }).call(() => {
            app.pool.put(app.poolKey.ToastItem, tip);
        }).start();
    }

    update(dt: number) {
        for (let i = this.tipGroup.childrenCount - 1; i >= 0; i--) {
            let v = this.tipGroup.children[i];
            let posY = (this.tipGroup.childrenCount - 1 - i) * this.tipGroupSpaceY;
            if (v.y < posY) {
                v.y += 200 * dt;
            }
        }
    }

    /**
     * 显示提示框
     * @param content 提示内容
     * @param boxType 提示框类型 1：一个确认按钮 2：确认和取消按钮
     * @param opts 确认和取消按钮回调
     */
    showTipBox(content: string, params: { boxType: 1 | 2, cbConfirm?: Function, cbCancel?: Function }) {
        this.tipBox.active = true;
        this.tipBoxContent.string = content;
        this.btnConfirm.node.once("click", this.Confirm, this);
        this.btnCancel.node.once("click", this.Cancel, this);
        this.btnCancel.node.active = params.boxType == 2;
        this.cbConfirm = params.cbConfirm;
        this.cbCancel = params.cbCancel;
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

