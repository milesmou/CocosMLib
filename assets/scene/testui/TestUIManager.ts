import { UIManager, EUIName } from "../../libs/ui/UIManager";
// import ButtonAssist from "../../script/component/ButtonAssist";
// import ButtonAssist from "../../script/component/ButtonAssist";
// import ButtonAssist from "../../script/component/ButtonAssist";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TestUIManager extends cc.Component {

    start() {
        UIManager.inst.init();

    }

    openUI() {
        UIManager.inst.openUI(EUIName.UI1);
    }
    showTip() {

        UIManager.inst.tipMseeage.showTip("hello world singleTip");
    }

    showTips() {

        UIManager.inst.tipMseeage.showTips("hello world tips");
        // UIManager.inst.tipMseeage.showTips("hello world tips 2");
    }

    showTipBox() {

        UIManager.inst.tipMseeage.showTipBox("hello world 666", 2, {
            cbConfirm: () => {
                console.log("ok");
            },
            cbCancel:()=>{
                console.log("cancel");
            }
        });
    }

}
