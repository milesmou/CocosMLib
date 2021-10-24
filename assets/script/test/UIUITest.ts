import { app } from "../../mm/App";
import UIBase from "../../mm/ui/UIBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIUITest extends UIBase {

    openUIPopUp1() {
        app.ui.show(app.uiKey.UIPopUp1);
    }

    showTip() {

        app.ui.tipMsg.showTip("hello world singleTip");
    }

    showTips() {

        app.ui.tipMsg.showTips("hello world tips");
        // UIManager.inst.tipMseeage.showTips("hello world tips 2");
    }

    showTipBox() {

        app.ui.tipMsg.showTipBox("hello world 666", {
            boxType:2,
            cbConfirm:() => {
                app.ui.tipMsg.showTips("ok");
            },
            cbCancel:() => {
                app.ui.tipMsg.showTips("cancel");
            }
        }
            
        );
    }
}
