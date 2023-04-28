import { Button, Label, Node, NodeEventType, _decorator } from 'cc';
import { ButtonHelper } from '../../../component/ButtonHelper';
import { UIBase } from '../../../ui/UIBase';
const { ccclass, property } = _decorator;

@ccclass('UIButtonHelper')
export class UIButtonHelper extends UIBase {
    @property(Label)
    tip: Label;

    onLoad(){
        ButtonHelper.defaultAuidoLocation = "testaudio/click";
    }

    start() {
       
    }



}


