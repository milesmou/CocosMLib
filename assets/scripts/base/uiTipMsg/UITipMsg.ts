import { _decorator } from 'cc';
import { UIComponent } from '../../../mlib/module/ui/manager/UIComponent';
import { ConfirmArgs } from './ConfirmArgs';
import { LoadingArgs } from './LoadingArgs';
import { TipMsgConfirm } from './TipMsgConfirm';
import { TipMsgLoading } from './TipMsgLoading';
import { TipMsgTip } from './TipMsgTip';
import { TipMsgToast } from './TipMsgToast';
const { ccclass, property } = _decorator;

@ccclass('UITipMsg')
export class UITipMsg extends UIComponent {

    public static Inst: UITipMsg;

    private get tip() { return this.rc.get("Tip", TipMsgTip); }
    private get toast() { return this.rc.get("Toast", TipMsgToast); }
    private get confirm() { return this.rc.get("Confirm", TipMsgConfirm); }
    private get loading() { return this.rc.get("Loading", TipMsgLoading); }


    protected onLoad() {
        UITipMsg.Inst = this;
    }

    protected onDestroy(): void {
        UITipMsg.Inst = undefined;
    }

    public showTip(content: string) {
        this.tip.show(content);
    }

    public showToast(content: string) {
        this.toast.show(content);
    }

    public showConfirm(desc: string, args: ConfirmArgs) {
        this.confirm.show(desc, args);
    }

    public showLoading(args?: LoadingArgs) {
        this.loading.show(args);
    }

    public hideLoading() {
        this.loading.hide();
    }
}

