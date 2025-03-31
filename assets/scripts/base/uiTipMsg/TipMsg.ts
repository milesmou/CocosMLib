import { L10nMgr } from "../../../mlib/module/l10n/L10nMgr";
import { ConfirmArgs } from "./ConfirmArgs";
import { LoadingArgs } from "./LoadingArgs";
import { UITipMsg } from "./UITipMsg";

export class TipMsg {

    public static showTip(content: string) {
        UITipMsg.Inst.showTip(content);
    }

    public static showToast(content: string) {
        UITipMsg.Inst.showToast(content);
    }

    public static showToastByLanguageKey(languageKey: string, ...languageArgs: any[]) {
        let content = L10nMgr.getStringByKey(languageKey, languageArgs);
        this.showToast(content);
    }

    public static showConfirm(content: string, args: ConfirmArgs) {
        UITipMsg.Inst.showConfirm(content, args);
    }

    public static showLoading(args?: LoadingArgs) {
        UITipMsg.Inst.showLoading(args);
    }

    public static hideLoading() {
        UITipMsg.Inst.hideLoading();
    }

}