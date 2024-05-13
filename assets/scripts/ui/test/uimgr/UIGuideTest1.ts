
import { _decorator } from 'cc';
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
                    app.tipMsg.showToast("引导结束")
                }
            });
        })
    }

    openUIGuideTest2() {
        app.ui.show(UIConstant.UIGuideTest2);
    }
}