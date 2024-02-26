
import { _decorator } from 'cc';
import { App } from '../../../../mlib/App';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';
import { UIGuide } from '../../../base/guide/UIGuide';
import { UIConstant } from '../../../gen/UIConstant';


const { ccclass, property } = _decorator;

@ccclass('UIGuideTest1')
export class UIGuideTest1 extends UIBase {


    onShow() {
        this.scheduleOnce(() => {
            UIGuide.Inst.startGuide(1, {
                onEnded: () => {
                    App.tipMsg.showToast("引导结束")
                }
            });
        })
    }

    openUIGuideTest2() {
        App.ui.show(UIConstant.UIGuideTest2);
    }
}