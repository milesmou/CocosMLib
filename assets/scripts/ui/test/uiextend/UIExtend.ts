import { Label, _decorator } from 'cc';
import { App } from '../../../../mlib/App';
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
        App.ui.showToast("点击");
    }

    onLongPress12() {
        App.ui.showToast("长按");
    }
}


