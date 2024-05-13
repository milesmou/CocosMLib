
import { Label, _decorator } from 'cc';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';
import { UIConstant } from '../../../gen/UIConstant';



const { ccclass, property } = _decorator;

@ccclass('UIC')
export class UIC extends UIBase {

    @property(Label)
    label!: Label;

    onShow() {
        this.label.string = `由${this.args}打开`;
    }

    protected onClickButton(btnName: string): void {
        switch (btnName) {
            case "OpenA":
                app.ui.show(UIConstant.UIA, { args: "C" });
                break;
            case "OpenB":
                app.ui.show(UIConstant.UIB, { args: "C" });
                break;
            case "OpenC":
                app.ui.show(UIConstant.UIC, { args: "C" });
                break;

            default:
                break;
        }
    }

}