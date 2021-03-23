import app from "../../mm/App";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TestUI extends cc.Component {

    start() {
        app.audio.playMusic(app.audioKey.M_BGM);
    }

    openUI() {
        app.ui.show(app.uiKey.UI1);
    }

    showTip() {

        app.ui.tipMsg.showTip("hello world singleTip");
    }

    showTips() {

        app.ui.tipMsg.showTips("hello world tips");
        // UIManager.inst.tipMseeage.showTips("hello world tips 2");
    }

    showTipBox() {

        app.ui.tipMsg.showTipBox("hello world 666", 2,
            () => {
                app.ui.tipMsg.showTips("ok");
            },
            () => {
                app.ui.tipMsg.showTips("cancel");
            }
        );
    }

}
