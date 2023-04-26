
import { _decorator, Component, Node, Label } from 'cc';
import { App } from '../../../App';
import { UIBase } from '../../../ui/UIBase';

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
            App.ui.show(App.uiKey.UIA, { args: "B" });
        } else if (data == "B") {
            App.ui.show(App.uiKey.UIB, { args: "B" });
        } else if (data == "C") {
            App.ui.show(App.uiKey.UIC, { args: "B" });
        }
    }

}