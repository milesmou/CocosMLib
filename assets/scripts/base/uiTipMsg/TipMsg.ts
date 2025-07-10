import { L10nMgr } from "../../../mlib/module/l10n/L10nMgr";
import { UIConstant } from "../../gen/UIConstant";
import { ConfirmArgs } from "./ConfirmArgs";
import { LoadingArgs } from "./LoadingArgs";
import { UITipMsg } from "./UITipMsg";

export class TipMsg {

    private static get isReady() { return Boolean(UITipMsg.Inst); }

    public static async init() {
        if (this.isReady) return;
        await app.ui.showResident(UIConstant.UITipMsg);
    }

    public static async showTip(content: string) {
        await this.init();
        UITipMsg.Inst.showTip(content);
    }

    public static async showToast(content: string) {
        await this.init();
        UITipMsg.Inst.showToast(content);
    }

    public static async showToastByLanguageKey(languageKey: string, ...languageArgs: any[]) {
        await this.init();
        let content = L10nMgr.getStringByKey(languageKey, languageArgs);
        this.showToast(content);
    }

    public static async showConfirm(content: string, args: ConfirmArgs) {
        await this.init();
        UITipMsg.Inst.showConfirm(content, args);
    }

    public static async showLoading(args?: LoadingArgs) {
        await this.init();
        UITipMsg.Inst.showLoading(args);
    }

    public static async hideLoading() {
        await this.init();
        UITipMsg.Inst.hideLoading();
    }

}