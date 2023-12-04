import { _decorator } from 'cc';
import { App } from '../../../../mlib/App';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';
import { UIConstant } from '../../../gen/UIConstant';

const { ccclass, property } = _decorator;

@ccclass('UIUIMgr')
export class UIUIMgr extends UIBase {


    protected onClickButton(btnName: string): void {
        switch (btnName) {
            case "showSingleTip":
                App.ui.showTip("SingleTip");
                break;
            case "showTips":
                App.ui.showToast("Tips");
                break;
            case "showTipBox":
                App.ui.showConfirm("I'm a TipBox");
                break;
            case "showPopUp":
                App.ui.show(UIConstant.UIPopUp);
                break;
            case "showUIA":
                App.ui.show(UIConstant.UIA, { args: "UIUIMgr" });
                break;
            case "showUIB":
                App.ui.show(UIConstant.UIB, { args: "UIUIMgr" });
                break;
            case "showUIC":
                App.ui.show(UIConstant.UIC, { args: "UIUIMgr" });
                break;

            default:
                break;
        }
    }

}