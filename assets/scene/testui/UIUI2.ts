const {ccclass,property} = cc._decorator;
import  UIBase from "../../libs/ui/UIBase";
import { EUIName, UIManager } from "../../libs/ui/UIManager";


@ccclass
export default class UIUI2 extends UIBase {

    onLoad(){
        // super.onLoad();
    }


    start () {
        // let {ak,bk} = this.args;
        // super..start();
        
    }

    close1(){
        UIManager.Inst.hideUI(EUIName.UI1);
    }

}
