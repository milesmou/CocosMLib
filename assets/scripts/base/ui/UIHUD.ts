
import { Button, _decorator, js, tween } from 'cc';
import { App } from '../../../mlib/App';
import { UIBase } from '../../../mlib/module/ui/manager/UIBase';
import { UIConstant } from '../../gen/UIConstant';
import { GameData } from '../GameData';
import { PropertyBase } from '../../../mlib/module/ui/property/PropertyBase';
import { UIHUDProperty } from '../../gen/property/UIHUDProperty';

const { ccclass, property } = _decorator;

@ccclass('UIHUD')
export class UIHUD extends UIBase {

    protected property: PropertyBase;

    onLoad() {
        super.onLoad();
        console.log(GameData.Inst.getSerializeStr());
    }

    protected onClickButton(btnName: string): void {
        switch (btnName) {
            case "AudioMgr":
                App.ui.show(UIConstant.UIAudioMgr);
                break;
            case "UIMgr":
                App.ui.show(UIConstant.UIUIMgr);
                break;
            case "Guide":
                App.ui.show(UIConstant.UIGuideTest1);
                break;
            case "UIExtend":
                App.ui.show(UIConstant.UIExtend);
                break;
            case "ScrollviewEnhance":
                App.ui.show(UIConstant.UIScrollviewEnhance);
                break;
        }
    }

}


