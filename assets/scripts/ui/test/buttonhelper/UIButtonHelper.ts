import { Label, _decorator } from 'cc';
import { App } from '../../../../mlib/App';
import { ButtonHelper } from '../../../../mlib/component/ButtonHelper';
import { UIBase } from '../../../../mlib/component/UIBase';

const { ccclass, property } = _decorator;

@ccclass('UIButtonHelper')
export class UIButtonHelper extends UIBase {
    //gen property start don't modify this area
    //gen property end don't modify this area 
    @property(Label)
    tip: Label;

    onLoad() {
        ButtonHelper.defaultAuidoLocation = "audio/test/click";

    }

    start() {

    }


    onLongPress11() {
        App.ui.showToast("点击");
    }

    onLongPress12() {
        App.ui.showToast("长按");
    }
}


