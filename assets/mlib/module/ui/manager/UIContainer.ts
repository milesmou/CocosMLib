import { _decorator } from "cc";
import { CCUtils } from "../../../utils/CCUtil";
import { AssetHandler } from "../../asset/AssetHandler";
import { UIBase } from "./UIBase";
import { UIComponent } from "./UIComponent";

const { property, ccclass, requireComponent } = _decorator;

@ccclass("UIContainer")
export class UIContainer extends UIComponent {

    private _ui: UIBase;
    public get ui() {
        if (!this._ui) {
            this._ui = CCUtils.getComponentInParent(this.node, UIBase);
        }
        return this._ui;
    }
    
    private _asset: AssetHandler;
    public get asset() { return this._asset; }

    protected __preload(): void {
        super.__preload();
        this._asset = new AssetHandler(this.node);
    }
}

