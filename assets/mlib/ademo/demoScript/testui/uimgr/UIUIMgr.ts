import { Button, Label, Sprite, UITransform, _decorator } from 'cc';
import { App } from '../../../../App';
import { UIBase } from '../../../../ui/UIBase';
import { TestUIConst } from '../../TestUIConst';

const { ccclass, property } = _decorator;

@ccclass('UIUIMgr')
export class UIUIMgr extends UIBase {
    //gen property start don't modify this area
    get bsssswssuttonTf(){ return this.getAutoBindComp("bp_Bsssswssutton", UITransform); }
    get bsssswssuttonSp(){ return this.getAutoBindComp("bp_Bsssswssutton", Sprite); }
    get bsssswssuttonBtn(){ return this.getAutoBindComp("bp_Bsssswssutton", Button); }
    //gen property end don't modify this area 
    showSingleTip() {


        App.ui.showTip("SingleTip");
        
        console.log("");
        

    }

    showTips() {

        App.ui.showToast("Tips");

    }


    showTipBox() {

        App.ui.showConfirm("I'm a TipBox");

    }


    onClickShowPopUp() {



        App.ui.show(TestUIConst.UIPopUp);



    }































    showUI(evt: TouchEvent, data: string) {















        if (data == "A") {















            App.ui.show(TestUIConst.UIA, { args: "UIMgr" });















        } else if (data == "B") {















            App.ui.show(TestUIConst.UIB, { args: "UIMgr" });















        } else if (data == "C") {















            App.ui.show(TestUIConst.UIC, { args: "UIMgr" });















        }















    }







}