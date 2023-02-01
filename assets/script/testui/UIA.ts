
import { _decorator, Component, Node, Label } from 'cc';
import { app } from '../../mm/App';
import { UIBase } from '../../mm/ui/UIBase';
const { ccclass, property } = _decorator;

@ccclass('UIA')
export class UIA extends UIBase {

    @property(Label)
    label!: Label;

    onShow() {
        this.label.string = `由${this.args}打开`;
    }

    showUI(evt: TouchEvent, data: string) {
        if (data == "A") {
            app.ui.show(app.uiKey.UIA, { args: "A" });
        } else if (data == "B") {
            app.ui.show(app.uiKey.UIB, { args: "A" });
        } else if (data == "C") {
            app.ui.show(app.uiKey.UIC, { args: "A" });
        }
    }

}