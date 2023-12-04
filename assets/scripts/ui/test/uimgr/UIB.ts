
import { _decorator, Component, Node, Label } from 'cc';
import { App } from '../../../../mlib/App';
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
                App.ui.show(UIConstant.UIA, { args: "B" });
                break;
            case "OpenB":
                App.ui.show(UIConstant.UIB, { args: "B" });
                break;
            case "OpenC":
                App.ui.show(UIConstant.UIC, { args: "B" });
                break;

            default:
                break;
        }
    }

}