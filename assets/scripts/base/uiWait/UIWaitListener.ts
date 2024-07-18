import { _decorator, Component } from 'cc';
import { persistNode } from '../../../mlib/module/core/Decorator';
import { UIConstant } from '../../gen/UIConstant';
import { EWaitShowType, UIWaitCfg } from './UIWaitCfg';
import { EventKey } from '../GameEnum';
import { UIForm } from '../../../mlib/module/ui/manager/UIForm';
const { ccclass, property } = _decorator;


@persistNode
@ccclass("UIWaitListener")
export class UIWaitListener extends Component {

    /** 当前在显示等待界面的UI */
    private _showWaitUI: Map<string, number> = new Map();

    protected onLoad(): void {
        app.event.on(EventKey.OnUIInitBegin, this.checkShowWait, this);
        app.event.on(EventKey.OnUIShowBegin, this.checkHideWait, this);
    }

    private checkShowWait(uiName: string, visible: boolean) {
        if (!visible) return;
        if (!this._showWaitUI.get(uiName)) {
            let waitCfgInfo = UIWaitCfg[uiName];
            if (!waitCfgInfo) return;
            if (waitCfgInfo.showType == EWaitShowType.None) {
                return;
            } else if (waitCfgInfo.showType == EWaitShowType.Always) {
                this._showWaitUI.set(uiName, Date.now());
                app.ui.showHigher(UIConstant.UIWait);
            } else {
                let ui = app.ui.getUI(uiName);
                if (!ui || !ui.isValid) {
                    if (waitCfgInfo.showType == EWaitShowType.First) {
                        this._showWaitUI.set(uiName, Date.now());
                        app.ui.showHigher(UIConstant.UIWait);
                    }
                } else {
                    if (waitCfgInfo.showType == EWaitShowType.ExceptFirst) {
                        this._showWaitUI.set(uiName, Date.now());
                        app.ui.showHigher(UIConstant.UIWait);
                    }
                }
            }
        }
    }

    private checkHideWait(ui: UIForm) {
        let uiName = ui.uiName;
        if (this._showWaitUI.has(uiName)) {
            let waitCfgInfo = UIWaitCfg[uiName];
            let timeMS = this._showWaitUI.get(uiName);
            let dur = Math.max(0.15, waitCfgInfo.showDuration - (Date.now() - timeMS) / 1000);
            this._showWaitUI.delete(uiName);
            if (this._showWaitUI.size == 0) {
                this.scheduleOnce(() => {
                    app.ui.hideHigher(UIConstant.UIWait);
                }, dur);
            }
        }
    }

}