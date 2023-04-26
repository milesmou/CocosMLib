
import { Label, _decorator } from 'cc';
import { App } from '../../../App';
import { UIBase } from '../../../ui/UIBase';

const { ccclass, property } = _decorator;

@ccclass('UIC')
export class UIC extends UIBase {

    @property(Label)
    label!: Label;

    onShow() {
        this.label.string = `由${this.args}打开`;
    }

    showUI(evt: TouchEvent, data: string) {
        if (data == "A") {
            App.ui.show(App.uiKey.UIA, { args: "C" });
        } else if (data == "B") {
            App.ui.show(App.uiKey.UIB, { args: "C" });
        } else if (data == "C") {
            App.ui.show(App.uiKey.UIC, { args: "C" });
        }
    }

}