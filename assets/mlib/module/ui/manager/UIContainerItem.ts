import { _decorator } from "cc";
import { CCUtils } from "../../../utils/CCUtil";
import { AssetHandler } from "../../asset/AssetHandler";
import { UIBase } from "./UIBase";
import { UIComponent } from "./UIComponent";
import { UIContainer } from "./UIContainer";

const { property, ccclass, requireComponent } = _decorator;

@ccclass("UIContainerItem")
export class UIContainerItem extends UIComponent {

    private _ui: UIBase;
    public get ui() {
        if (!this._ui) {
            this._ui = CCUtils.getComponentInParent(this.node, UIBase);
        }
        return this._ui;
    }

    private _asset: AssetHandler;
    public get asset() {
        if (!this._asset) {
            let container = CCUtils.getComponentInParent(this.node, UIContainer);
            if (container) {
                this._asset = container.asset;
            } else if (this.ui) {
                this._asset = this.ui.asset;
            }
        }
        return this._asset;
    }

}

