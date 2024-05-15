import { Animation, Label, _decorator, sp } from 'cc';
import { MSlider } from '../../../../mlib/module/ui/extend/MSlider';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';
const { ccclass, property } = _decorator;

@ccclass('UITimerTest')
export class UITimerTest extends UIBase {
    private _slider: MSlider;
    private _timeScale: Label;
    private _spine: sp.Skeleton;
    private _anim: Animation;


    private _timeS = 0;

    onLoad() {
        this._slider = this.rc.get("Slider", MSlider);
        this._timeScale = this.rc.get("TimeScale", Label);
        this._spine = this.rc.get("Spine", sp.Skeleton);
        this._anim = this.rc.get("Anim", Animation);

        this._slider.onSlider.addListener(this.onSliderChange, this);
        this.onSliderChange();
    }


    start() {
        console.log(this.timer);
        
        this.timer.add(this._spine);
        this.timer.add(this._anim);
    }


    private onSliderChange() {
        this._timeS = this._slider.progress * 5;
        this._timeScale.string = "TimeScale:" + this._timeS.toFixed(1);
        this.timer.setTimeScale(this._timeS);
    }

}


