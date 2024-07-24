import { _decorator, Component, Prefab } from "cc";
import { AssetMgr } from "../../../mlib/module/asset/AssetMgr";
import { persistNode } from "../../../mlib/module/core/Decorator";
import { EventKey } from "../GameEnum";
import { UIPreloadCfg } from "./UIPreloadCfg";
const { ccclass, property } = _decorator;

@persistNode
@ccclass("UIPreloadListener")
export class UIPreloadListener extends Component {

    private _loadedList: string[] = [];//已经预加载完成的UI
    private _waitList: string[];//等待预加载的UI
    private _isLoading = false;//是否正在加载UI

    protected onLoad(): void {
        app.event.on(EventKey.OnUIShow, this.checkPreload, this);
        app.event.on(EventKey.OnUIHide, this.checkPreload, this);
    }

    private checkPreload() {
        let topUI = app.ui.topUI;
        if (!topUI) return;
        let list = UIPreloadCfg[topUI.uiName]?.filter(v => !this._loadedList.includes(v));
        if (list?.length > 0) {
            this._waitList = list;
            this.unscheduleAllCallbacks();
            this.preload();
        }
    }

    private preload() {
        if (!this._waitList?.length) return;
        if (this._isLoading) return;
        if (AssetMgr.loadingCount > 0) {//空闲时才进行预加载
            this.scheduleOnce(() => {
                this.scheduleOnce(this.preload, 0.5);
            });
            return;
        }
        this._isLoading = true;
        let uiName = this._waitList.shift();
        AssetMgr.preloadAsset(uiName, Prefab).then(() => {
            if (!this.isValid) return;
            this._loadedList.push(uiName);
            this._isLoading = false;
            this.preload();
        });

    }
}