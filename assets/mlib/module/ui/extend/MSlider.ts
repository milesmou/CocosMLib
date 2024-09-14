import { _decorator, Slider, Sprite, UITransform } from 'cc';
import { MEvent } from '../../event/MEvent';

const { ccclass, property, disallowMultiple, executeInEditMode } = _decorator;

@ccclass('MSlider')
@disallowMultiple
@executeInEditMode
export class MSlider extends Slider {
    @property({
        type: Sprite,
        displayName: "Bar Sprite",
        tooltip: "用于显示进度的精灵"
    })
    private m_BarSprite: Sprite;

    @property({
        displayName: "进度条长度",
        visible: function () { return (this as MSlider).m_BarSprite && (this as MSlider).m_BarSprite.type != Sprite.Type.FILLED; }
    })
    private m_TotalLength = 0;


    private _onSlider = new MEvent<MSlider>();
    public get onSlider() { return this._onSlider; }

    public __preload() {
        super.__preload();
        Object.defineProperty(this, "progress", {
            get() {
                return this._progress;
            },
            set(value: number) {
                if (this._progress === value) {
                    return;
                }

                this._progress = value;
                this._updateHandlePosition();
                this.onProgressChange();
            }
        })
        this.onProgressChange();
    }

    private onProgressChange() {
        if (this.m_BarSprite?.isValid) {
            if (this.m_BarSprite.type == Sprite.Type.FILLED) {
                this.m_BarSprite.fillRange = this.progress;
            } else {
                this.m_BarSprite.sizeMode = Sprite.SizeMode.CUSTOM;
                let trans = this.m_BarSprite.getComponent(UITransform);
                if (this.direction == Slider.Direction.Horizontal) {
                    trans.width = this.m_TotalLength * this.progress;
                } else {
                    trans.height = this.m_TotalLength * this.progress;
                }
            }
        }
        this.onSlider.dispatch(this);
    }
}