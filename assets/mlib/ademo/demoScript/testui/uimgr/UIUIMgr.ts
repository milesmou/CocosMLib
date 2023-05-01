
import { _decorator } from 'cc';
import { App } from '../../../../App';
import { UIBase } from '../../../../ui/UIBase';
import { TestUIConst } from '../../TestUIConst';

const { ccclass, property } = _decorator;

@ccclass('UIUIMgr')
export class UIUIMgr extends UIBase {


    showSingleTip() {
        App.ui.showTip("SingleTip");
    }

    showTips() {
        App.ui.showToast("Tips");
    }

    showTipBox() {
        App.ui.showConfirm("I'm a TipBox");
    }

    onClickShowPopUp() {
        App.ui.show(TestUIConst.UIPopUp);
    }

    showUI(evt: TouchEvent, data: string) {
        if (data == "A") {
            App.ui.show(TestUIConst.UIA, { args: "UIMgr" });
        } else if (data == "B") {
            App.ui.show(TestUIConst.UIB, { args: "UIMgr" });
        } else if (data == "C") {
            App.ui.show(TestUIConst.UIC, { args: "UIMgr" });
        }
    }
}
