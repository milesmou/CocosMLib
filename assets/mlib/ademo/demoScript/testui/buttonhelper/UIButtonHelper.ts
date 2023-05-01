import { Button, Label, Node, NodeEventType, _decorator } from 'cc';
import { ButtonHelper } from '../../../../component/ButtonHelper';
import { UIBase } from '../../../../ui/UIBase';
import { App } from '../../../../App';

const { ccclass, property } = _decorator;

@ccclass('UIButtonHelper')
export class UIButtonHelper extends UIBase {
    @property(Label)
    tip: Label;

    onLoad() {
        ButtonHelper.defaultAuidoLocation = "testaudio/click";

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


