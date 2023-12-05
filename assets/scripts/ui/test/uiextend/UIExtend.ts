import { Label, _decorator } from 'cc';
import { App } from '../../../../mlib/App';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';

const { ccclass, property } = _decorator;

@ccclass('UIExtend')
export class UIExtend extends UIBase {
    //gen property start don't modify this area
    //gen property end don't modify this area 
    @property(Label)
    tip: Label;

    onLoad() {
        
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


