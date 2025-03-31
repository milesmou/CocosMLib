import { _decorator, Label, Tween, tween, UIOpacity } from 'cc';
import { UIComponent } from 'db://assets/mlib/module/ui/manager/UIComponent';
const { ccclass, property } = _decorator;

@ccclass('TipMsgTip')
export class TipMsgTip extends UIComponent {

    private get content() { return this.rc.get("content", Label); }

    private _uiOpacity: UIOpacity;

    protected onLoad(): void {
        this._uiOpacity = this.node.ensureComponent(UIOpacity);
        this._uiOpacity.opacity = 0;
    }

    public show(content: string) {
        this.content.string = content;
        Tween.stopAllByTarget(this._uiOpacity);
        this._uiOpacity.opacity = 255;
        tween(this._uiOpacity)
            .delay(1.2)
            .to(0.2, { opacity: 0 })
            .start();
    }
}


