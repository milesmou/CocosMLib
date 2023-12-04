
import { Label, _decorator } from 'cc';
import { App } from '../../../../mlib/App';
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
                App.ui.show(UIConstant.UIA, { args: "A" });
                break;
            case "OpenB":
                App.ui.show(UIConstant.UIB, { args: "A" });
                break;
            case "OpenC":
                App.ui.show(UIConstant.UIC, { args: "A" });
                break;

            default:
                break;
        }
    }

}