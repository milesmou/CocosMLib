
import { _decorator, Component, Node, Label } from 'cc';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';
import { UIConstant } from '../../../gen/UIConstant';



const { ccclass, property } = _decorator;

@ccclass('UIB')
export class UIB extends UIBase {

    @property(Label)
    label!: Label;

    onShow() {
        this.label.string = `由${this.args}打开`;
    }

    protected onClickButton(btnName: string): void {
        switch (btnName) {
            case "OpenA":
                app.ui.show(UIConstant.UIA, { args: "B" });
                break;
            case "OpenB":
                app.ui.show(UIConstant.UIB, { args: "B" });
                break;
            case "OpenC":
                app.ui.show(UIConstant.UIC, { args: "B" });
                break;

            default:
                break;
        }
    }

}