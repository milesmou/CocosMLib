import { _decorator } from "cc";
import { CCUtils } from "../../../utils/CCUtil";
import { UIBase } from "./UIBase";
import { UIComponent } from "./UIComponent";

const { property, ccclass, requireComponent } = _decorator;

@ccclass("UIContainer")
export class UIContainer extends UIComponent {
    private _ui: UIBase;
    /** 获取UI元素所在的UI界面 */
    protected get ui() {
        if (!this._ui?.isValid) {
            this._ui = CCUtils.getComponentInParent(this.node, UIBase);
        }
        return this._ui;
    }
}

