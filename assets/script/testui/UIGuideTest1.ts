
import { _decorator, Component, Node, Label } from 'cc';
import { app } from '../../mlib/App';
import { UIBase } from '../../mlib/ui/UIBase';
const { ccclass, property } = _decorator;

@ccclass('UIGuideTest1')
export class UIGuideTest1 extends UIBase {


    onShow() {
        this.scheduleOnce(() => {
            app.ui.guide.startGuide(1, () => {
                app.ui.tipMsg.showToast("引导结束")
            });
        })
    }

    openUIGuideTest2() {
        app.ui.show(app.uiKey.UIGuideTest2);
    }
}