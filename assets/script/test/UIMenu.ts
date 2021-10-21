import { app } from "../../mm/App";
import UIBase from "../../mm/ui/UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMenu extends UIBase {

    @property(cc.Node)
    funcList: cc.Node = null;

    onLoad() {
        this.funcList.children.forEach(v => {
            let btn = v.getComponent(cc.Button);
            btn.clickEvents = [];
            let evtHandler = new cc.Component.EventHandler();
            evtHandler.target = this.node;
            evtHandler.component = "UIMenu";
            evtHandler.handler = "onClickBtn",
                evtHandler.customEventData = v.name;
            btn.clickEvents[0] = evtHandler;
        })
    }

    onClickBtn(evt, data) {
        app.ui.show(app.uiKey[data]);
    }
}
