
import { Label, _decorator } from 'cc';
import { App } from '../../../../mlib/App';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';
import { UIConstant } from '../../../gen/UIConstant';

const { ccclass, property } = _decorator;

@ccclass('UIA')
export class UIA extends UIBase {

    @property(Label)
    label!: Label;

    onShow() {
        this.label.string = `由${this.args}打开`;
    }

    onClick() {
        this.safeClose();
    }

    showUI(evt: TouchEvent, data: string) {
        if (data == "A") {
            App.ui.show(UIConstant.UIA, { args: "A" });
        } else if (data == "B") {
            App.ui.show(UIConstant.UIB, { args: "A" });
        } else if (data == "C") {~
            App.ui.show(UIConstant.UIC, { args: "A" });
        }
    }

}