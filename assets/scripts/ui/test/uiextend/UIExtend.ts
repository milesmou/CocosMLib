import { Label, _decorator } from 'cc';
import { App } from '../../../../mlib/App';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';
import { PropertyBase } from '../../../../mlib/module/ui/property/PropertyBase';
import { UIExtendProperty } from '../../../gen/property/UIExtendProperty';

const { ccclass, property } = _decorator;

@ccclass('UIExtend')
export class UIExtend extends UIBase {
    
    protected property: UIExtendProperty;

    start() {
        console.log(this.property.toggleGroupTC);
        
    }


    protected onClickButton(btnName: string): void {
        switch (btnName) {
            case "ButtonDD":
                console.log("hahaha");
                
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


