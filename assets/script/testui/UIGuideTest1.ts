
import { _decorator, Component, Node, Label } from 'cc';
import { app } from '../../mm/App';
import { UIBase } from '../../mm/ui/UIBase';
const { ccclass, property } = _decorator;

@ccclass('UIGuideTest1')
export class UIGuideTest1 extends UIBase {


    onShow() {
        this.scheduleOnce(() => {
            app.ui.guide.startGuide(1, () => {
                app.ui.tipMsg.showTips("引导结束")
            });
        })
    }

    openUIGuideTest2() {
        app.ui.show(app.uiKey.UIGuideTest2);
    }
}