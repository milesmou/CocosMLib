import { _decorator } from 'cc';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';

const { ccclass, property } = _decorator;

@ccclass('UIExtend')
export class UIExtend extends UIBase {

    start() {


    }


    protected onClickButton(btnName: string): void {
        switch (btnName) {
            case "ButtonDD":
                console.log("hahaha");

                break;
            case "Button-00122":
                console.log("Button-00122");

                break;

            default:
                break;
        }
    }


    onLongPress11() {
        app.tipMsg.showToast("点击");
    }

    onLongPress12() {
        app.tipMsg.showToast("长按");
    }
}


