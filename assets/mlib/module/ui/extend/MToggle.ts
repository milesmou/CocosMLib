import { Node, Toggle, _decorator } from 'cc';
import { MEvent } from '../../event/MEvent';

const { ccclass, property } = _decorator;

@ccclass('MToggle')
export class MToggle extends Toggle {

    @property({
        type: Node,
        displayName: "Background",
        tooltip: "isChecked=true隐藏此节点"
    })
    private m_Background: Node = null;

    private _onValueChange: MEvent = new MEvent();
    public get onValueChange() { return this._onValueChange; }

    protected onLoad(): void {
        this.node.on(Toggle.EventType.TOGGLE, this.onToggleValueChange, this);
        this.onToggleValueChange(this);
    }

    private onToggleValueChange(toggle: MToggle) {
        this.onValueChange.dispatch();
        if (this.m_Background) this.m_Background.active = !toggle.isChecked;
    }
}