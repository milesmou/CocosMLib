
import { Label, _decorator } from 'cc';
import { App } from '../../../../App';
import { UIBase } from '../../../../ui/UIBase';
import { TestUIConst } from '../../TestUIConst';

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
            App.ui.show(TestUIConst.UIA, { args: "A" });
        } else if (data == "B") {
            App.ui.show(TestUIConst.UIB, { args: "A" });
        } else if (data == "C") {~
            App.ui.show(TestUIConst.UIC, { args: "A" });
        }
    }

}