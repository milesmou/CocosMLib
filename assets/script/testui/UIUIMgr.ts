
import { _decorator, Component, Node } from 'cc';
import { app } from '../../mlib/App';
import { UIBase } from '../../mlib/ui/UIBase';
const { ccclass, property } = _decorator;

@ccclass('UIUIMgr')
export class UIUIMgr extends UIBase {


    showSingleTip() {
        app.ui.tipMsg.showTip("SingleTip");
    }

    showTips() {
        app.ui.tipMsg.showToast("Tips");
    }

    showTipBox() {
        app.ui.tipMsg.showConfirm("I'm a TipBox");
    }

    onClickShowPopUp() {
        app.ui.show(app.uiKey.UIPopUp);
    }

    showUI(evt: TouchEvent, data: string) {
        if (data == "A") {
            app.ui.show(app.uiKey.UIA, { args: "UIMgr" });
        } else if (data == "B") {
            app.ui.show(app.uiKey.UIB, { args: "UIMgr" });
        } else if (data == "C") {
            app.ui.show(app.uiKey.UIC, { args: "UIMgr" });
        }
    }
}
