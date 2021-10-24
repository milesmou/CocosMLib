const { ccclass, property } = cc._decorator;
import UIBase from "../../mm/ui/UIBase";
import UIMgr, { UIKey } from "../../mm/manager/UIMgr";


@ccclass
export default class UIPopUp1 extends UIBase {

    onShowBegin() {
        console.log("UIPopUp1","onShowBegin");
    }

    onShow() {
        console.log("UIPopUp1","onShow");
    }

    onHideBegin() {
        console.log("UIPopUp1","onHideBegin");
    }

    onHide() {
        console.log("UIPopUp1","onHide");
    }

    onclick() {
        UIMgr.Inst.show(UIKey.UIPopUp2);
    }

}
