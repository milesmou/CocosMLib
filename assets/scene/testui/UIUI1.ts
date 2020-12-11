const {ccclass,property} = cc._decorator;
import  UIBase from "../../libs/ui/UIBase";
import { UIManager,EUIName } from "../../libs/ui/UIManager";


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
        
        UIManager.Inst.showUI(EUIName.UI2);
    }

}
