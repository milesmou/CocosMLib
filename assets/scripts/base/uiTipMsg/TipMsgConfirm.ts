import { _decorator, Label } from 'cc';
import { MButton } from 'db://assets/mlib/module/ui/extend/MButton';
import { UIComponent } from 'db://assets/mlib/module/ui/manager/UIComponent';
import { ConfirmArgs } from './ConfirmArgs';
const { ccclass, property } = _decorator;

@ccclass('TipMsgConfirm')
export class TipMsgConfirm extends UIComponent {

    private get title() { return this.rc.get("Title", Label); }
    private get desc() { return this.rc.get("Desc", Label); }
    private get btnCancel() { return this.rc.get("BtnCancel", MButton); }
    private get btnOk() { return this.rc.get("BtnOk", MButton); }
    private get cancelText() { return this.rc.get("CancelText", Label); }
    private get okText() { return this.rc.get("OkText", Label); }


    private _titleText: string;//标题默认文字
    private _okText: string;//确认按钮默认文字
    private _cancelText: string;//取消按钮默认文字

    private _autoHideConfirm: boolean;
    private _cbConfirm: Function;
    private _cbCancel: Function;

    protected onLoad() {
        this._titleText = this.title.string;
        this._okText = this.okText.string;
        this._cancelText = this.cancelText.string;
        this.hide();
    }

    /**  显示确认框  */
    public show(desc: string, args: ConfirmArgs) {
        let { type, autoHide, cbOk, cbCancel, title, okText, cancelText } = args || {};
        autoHide ??= true;
        title ??= this._titleText;
        okText ??= this._okText;
        cancelText ??= this._cancelText;

        this.node.active = true;
        this.title.string = title;
        this.desc.string = desc;

        this.btnOk.onClick.addListener(this.confirm, this, true);
        this.okText.string = okText;
        this.btnCancel.onClick.addListener(this.cancel, this, true);
        this.cancelText.string = cancelText;
        this.btnCancel.node.active = type == 2;

        this._cbConfirm = cbOk;
        this._cbCancel = cbCancel;
        this._autoHideConfirm = autoHide;
    }

    private hide() {
        this.node.active = false;
    }

    private confirm() {
        this._cbConfirm && this._cbConfirm();
        if (this._autoHideConfirm) this.hide();
    }

    private cancel() {
        this._cbCancel && this._cbCancel();
        if (this._autoHideConfirm) this.hide();
    }
}


