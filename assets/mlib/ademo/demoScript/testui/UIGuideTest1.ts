
import { _decorator } from 'cc';
import { App } from '../../../App';
import { UIBase } from '../../../ui/UIBase';

const { ccclass, property } = _decorator;

@ccclass('UIGuideTest1')
export class UIGuideTest1 extends UIBase {


    onShow() {
        this.scheduleOnce(() => {
            App.ui.guide.startGuide(1, () => {
                App.ui.showToast("引导结束")
            });
        })
    }

    openUIGuideTest2() {
        App.ui.show(App.uiKey.UIGuideTest2);
    }
}