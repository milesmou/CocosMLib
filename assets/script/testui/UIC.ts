
import { _decorator, Component, Node, Label } from 'cc';
import { app } from '../../mlib/App';
import { UIBase } from '../../mlib/ui/UIBase';
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
            app.ui.show(app.uiKey.UIA, { args: "C" });
        } else if (data == "B") {
            app.ui.show(app.uiKey.UIB, { args: "C" });
        } else if (data == "C") {
            app.ui.show(app.uiKey.UIC, { args: "C" });
        }
    }

}