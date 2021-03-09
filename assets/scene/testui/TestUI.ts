import mm from "../../mm/mm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TestUI extends cc.Component {

    start() {
        mm.audio.playMusic(mm.audioKey.M_BGM);
    }

    openUI() {
        mm.ui.show(mm.uiKey.UI1);
    }

    showTip() {

        mm.ui.tipMsg.showTip("hello world singleTip");
    }

    showTips() {

        mm.ui.tipMsg.showTips("hello world tips");
        // UIManager.inst.tipMseeage.showTips("hello world tips 2");
    }

    showTipBox() {

        mm.ui.tipMsg.showTipBox("hello world 666", 2,
            () => {
                mm.ui.tipMsg.showTips("ok");
            },
            () => {
                mm.ui.tipMsg.showTips("cancel");
            }
        );
    }

}
