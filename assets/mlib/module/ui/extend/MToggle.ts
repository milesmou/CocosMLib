import { EventHandler, EventTouch, Node, Toggle, _decorator } from 'cc';
import { App } from '../../../App';
import { MEvent } from '../../event/MEvent';

const { ccclass, property } = _decorator;

@ccclass('MToggle')
export class MToggle extends Toggle {
    public static DefaultClickAudio = "audio/test/click";
    @property({
        type: Node,
        displayName: "Background",
        tooltip: "isChecked=true隐藏此节点"
    })
    private m_Background: Node = null;
    @property({
        displayName: "默认音效"
    })
    private m_DefaultAudio = true;
    @property({
        displayName: "自定义音效",
        visible() { return !this.m_DefaultAudio; }
    })
    private m_CustomAudio = "";
    @property({
        displayName: "冷却时间",
        range: [0, 10],
    })
    private m_Cooldown = 0.2;


    /** 是否冷却中 */
    private _isCoolingDown = false;
    /** 是否ToggleContainer中的一个 */
    private _inToggleContainer = false;
    /** 上一次是否被选中 */
    private _lastIsChecked: boolean;

    private _onValueChange: MEvent = new MEvent();
    public get onValueChange() { return this._onValueChange; }

    private get clickAudio() {
        if (!this.m_DefaultAudio)
            return this.m_CustomAudio;
        return MToggle.DefaultClickAudio;
    }

    protected onLoad(): void {
        this._inToggleContainer = this.node.parent.getComponent('cc.ToggleContainer') as any;
        this._lastIsChecked = this.isChecked;
        this.node.on(Toggle.EventType.TOGGLE, this.onToggleValueChange, this);
        this.updateBackground();
    }

    private onToggleValueChange(toggle: MToggle) {
        if (this._inToggleContainer) {
            if (this.isChecked && this.isChecked != this._lastIsChecked) {
                if (this.clickAudio && App.audio) App.audio.playEffect(this.clickAudio);
            }
        } else {
            if (this.clickAudio && App.audio) App.audio.playEffect(this.clickAudio);
        }
        this.onValueChange.dispatch();
        this.updateBackground();
        this._lastIsChecked = this.isChecked;
    }

    private updateBackground() {
        if (this.m_Background) this.m_Background.active = !this.isChecked;
    }

    protected _onTouchEnded(event?: EventTouch): void {
        if (this._isCoolingDown) return;
        if (!this['_pressed']) return;

        super._onTouchEnded(event);

        if (this.m_Cooldown > 0) {
            this._isCoolingDown = true;
            this.scheduleOnce(() => {
                this._isCoolingDown = false;
            }, this.m_Cooldown)
        }
    }
}