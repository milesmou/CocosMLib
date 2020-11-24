import { UIManager, EUIName } from "../../libs/ui/UIManager";
// import ButtonAssist from "../../script/component/ButtonAssist";
// import ButtonAssist from "../../script/component/ButtonAssist";
// import ButtonAssist from "../../script/component/ButtonAssist";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TestUIManager extends cc.Component {

    start() {
        UIManager.Inst.init();

    }

    openUI() {
        UIManager.Inst.openUI(EUIName.UI1);
    }
    showTip() {

        UIManager.Inst.tipMseeage.showTip("hello world singleTip");
    }

    showTips() {

        UIManager.Inst.tipMseeage.showTips("hello world tips");
        // UIManager.inst.tipMseeage.showTips("hello world tips 2");
    }

    showTipBox() {

        UIManager.Inst.tipMseeage.showTipBox("hello world 666", 2,
            () => {
                console.log("ok");
            },
            () => {
                console.log("cancel");
            }
        );
    }

}
