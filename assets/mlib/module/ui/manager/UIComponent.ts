import { Button, _decorator, js } from "cc";
import { CCUtils } from "../../../utils/CCUtil";
import { GenProperty } from "../property/GenProperty";
import { PropertyBase } from "../property/PropertyBase";
import { UIMessage } from "./UIMessage";

const { property, ccclass, requireComponent } = _decorator;

@ccclass("UIComponent")
export class UIComponent extends GenProperty {

    protected property: PropertyBase;
    protected message: UIMessage;

    protected onLoad(): void {
        let propertyClassName = js.getClassName(this) + "Property";
        let propertyClass = js.getClassByName(propertyClassName);
        if (propertyClass) {
            this.property = new propertyClass(this.node) as PropertyBase;
        }
        this.message = new UIMessage(this.node);
        this.getComponentsInChildren(Button).forEach(v => {
            let root = CCUtils.getComponentInParent(v.node, UIComponent);
            if (root != this) return;//忽略其它UI组件所在节点下的按钮
            v.node.on(Button.EventType.CLICK, this.onClickButton.bind(this, v.node.name))
        });
    }

    protected onClickButton(btnName: string) {

    }
}

