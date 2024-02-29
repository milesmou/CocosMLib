import { Button, _decorator } from "cc";
import { CCUtils } from "../../../utils/CCUtil";
import { MComponent } from "../../core/MComponent";
import { ReferenceCollector } from "../../core/ReferenceCollector";

const { ccclass, requireComponent } = _decorator;

@ccclass("UIComponent")
@requireComponent(ReferenceCollector)
export class UIComponent extends MComponent {

    protected __preload(): void {
        super.__preload();
        this.getComponentsInChildren(Button).forEach(v => {
            let root = CCUtils.getComponentInParent(v.node, UIComponent, true);
            if (root != this) return;//忽略其它UI组件所在节点下的按钮
            v.node.on(Button.EventType.CLICK, this.onClickButton.bind(this, v.node.name, v));
        });
    }

    /** 向父节点第一个UIBase组件发送消息 */
    protected sendToUI(methodName: string, ...args: any[]) {
        this.sendMessageUpwards("UIBase", methodName, ...args);
    }

    /** 向父节点第一个UIComponent组件发送消息 */
    public sendToUIComponent(methodName: string, ...args: any[]) {
        this.sendMessageUpwards("UIComponent", methodName, ...args);
    }

    protected onClickButton(btnName: string, btn: Button) {

    }
}

