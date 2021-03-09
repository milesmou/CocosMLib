const {ccclass,property} = cc._decorator;
import  UIBase from "../../mm/ui/UIBase";
import UIMgr,{ UIKey  } from "../../mm/manager/UIMgr";


@ccclass
export default class UIUI2 extends UIBase {

    onLoad(){
        // super.onLoad();
    }


    start () {
        // let {ak,bk} = this.args;
        // super..start();
        cc.assetManager.downloader.register
        
    }

    close1(){
        UIMgr.Inst.hide(UIKey.UI1);
    }

}
