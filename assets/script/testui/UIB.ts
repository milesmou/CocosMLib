
import { _decorator, Component, Node, Label } from 'cc';
import { app } from '../../mlib/App';
import { UIBase } from '../../mlib/ui/UIBase';
const { ccclass, property } = _decorator;

@ccclass('UIB')
export class UIB extends UIBase {

    @property(Label)
    label!: Label;

    onShow() {
        this.label.string = `由${this.args}打开`;
    }

    showUI(evt: TouchEvent, data: string) {
        if (data == "A") {
            app.ui.show(app.uiKey.UIA, { args: "B" });
        } else if (data == "B") {
            app.ui.show(app.uiKey.UIB, { args: "B" });
        } else if (data == "C") {
            app.ui.show(app.uiKey.UIC, { args: "B" });
        }
    }

}