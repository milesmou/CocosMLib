
import { Label, _decorator } from 'cc';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';
import { UIConstant } from '../../../gen/UIConstant';

const { ccclass, property } = _decorator;

@ccclass('UIA')
export class UIA extends UIBase {

    @property(Label)
    label: Label;

    onShow() {
        this.label.string = `由${this.args}打开`;
    }

    protected onClickButton(btnName: string): void {
        switch (btnName) {
            case "OpenA":
                app.ui.show(UIConstant.UIA, { args: "A" });
                break;
            case "OpenB":
                app.ui.show(UIConstant.UIB, { args: "A" });
                break;
            case "OpenC":
                app.ui.show(UIConstant.UIC, { args: "A" });
                break;

            default:
                break;
        }
    }

}