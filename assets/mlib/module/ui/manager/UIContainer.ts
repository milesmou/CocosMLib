import { Button, Node, _decorator } from "cc";
import { CCUtils } from "../../../utils/CCUtil";
import { GenProperty } from "../property/GenProperty";
import { UIBase } from "./UIBase";
import { UIMessage } from "./UIMessage";

const { property, ccclass, requireComponent } = _decorator;

@ccclass("UIContainer")
export class UIContainer extends GenProperty {
    private _ui: UIBase;
    /** 获取UI元素所在的UI界面 */
    protected get ui() {
        if (!this._ui?.isValid) {
            this._ui = CCUtils.getComponentInParent(this.node, UIBase);
        }
        return this._ui;
    }

    protected message: UIMessage;

    protected onLoad(): void {
        this.message = new UIMessage(this.node);
        this.getComponentsInChildren(Button).forEach(v => {
            let root = CCUtils.getComponentInParent(v.node, GenProperty);
            if (root != this) return;//忽略其它UI组件所在节点下的按钮
            v.node.on(Button.EventType.CLICK, this.onClickButton.bind(this, v.node.name))
        });
    }

    protected onClickButton(btnName: string) {

    }
}

