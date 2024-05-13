import { _decorator } from 'cc';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';
import { UIConstant } from '../../../gen/UIConstant';

const { ccclass, property } = _decorator;

@ccclass('UIUIMgr')
export class UIUIMgr extends UIBase {


    protected onClickButton(btnName: string): void {
        switch (btnName) {
            case "showSingleTip":
                app.tipMsg.showTip("SingleTip");
                break;
            case "showTips":
                app.tipMsg.showToast("Tips");
                break;
            case "showTipBox":
                app.tipMsg.showConfirm("I'm a TipBox", { type: 2 });
                break;
            case "showPopUp":
                app.ui.show(UIConstant.UIPopUp);
                break;
            case "showUIA":
                app.ui.show(UIConstant.UIA, { args: "UIUIMgr" });
                break;
            case "showUIB":
                app.ui.show(UIConstant.UIB, { args: "UIUIMgr" });
                break;
            case "showUIC":
                app.ui.show(UIConstant.UIC, { args: "UIUIMgr" });
                break;

            default:
                break;
        }
    }

}