const {ccclass,property} = cc._decorator;
import  UIBase from "../../libs/ui/UIBase";
import { EventMgr, GameEvent } from "../../libs/utils/EventMgr";
import { EUIName } from "../../libs/ui/UIManager";


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
        EventMgr.emit(GameEvent.CloseUI,EUIName.UI1);
    }

}
