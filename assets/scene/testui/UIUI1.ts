const {ccclass,property} = cc._decorator;
import  UIBase from "../../mm/ui/UIBase";
import UIMgr,{ UIKey } from "../../mm/manager/UIMgr";


@ccclass
export default class UIUI1 extends UIBase {

    onLoad(){
        console.log("onLoad");
    }

    start () {
        console.log("start");
    }

    onEnable(){
        console.log("onEnable"); 
    }

    onShowBegin(){
        console.log("onShowBegin");
    }

    onShow(){
        console.log("onShow");
    }

    onclick(){
        console.log("onclick");
        
        UIMgr.Inst.show(UIKey.UI2);
    }

}
