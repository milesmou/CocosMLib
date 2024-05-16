import { Animation, Label, _decorator, sp } from 'cc';
import { TimerAnimation } from '../../../../mlib/module/timer/TimerAnimation';
import { TimerSpine } from '../../../../mlib/module/timer/TimerSpine';
import { MSlider } from '../../../../mlib/module/ui/extend/MSlider';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';
import { tween } from 'cc';
import { TimerTween } from '../../../../mlib/module/timer/TimerTween';
import { macro } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UITimerTest')
export class UITimerTest extends UIBase {
    private _slider: MSlider;
    private _timeScale: Label;
    private _spine: TimerSpine;
    private _anim: TimerAnimation;
    private _schedule: Label;
    private _tween: Label;


    private _timeS = 0;

    private _scheduleNum = 0;
    private _tweenNum = 0;

    onLoad() {
        this._slider = this.rc.get("Slider", MSlider);
        this._timeScale = this.rc.get("TimeScale", Label);
        this._spine = new TimerSpine(this.rc.get("Spine", sp.Skeleton));
        this._anim = new TimerAnimation(this.rc.get("Anim", Animation));

        this._schedule = this.rc.get("Schedule", Label);
        this._tween = this.rc.get("Tween", Label);

        this._slider.onSlider.addListener(this.onSliderChange, this);
        this.onSliderChange();
    }


    start() {
        this.timer.add(this._spine);
        this.timer.add(this._anim);
        this.timer.scheduleM(() => {
            this._scheduleNum++;
            this._schedule.string = this._scheduleNum.toString();
        }, this, 1);
        let ttt = tween(this).repeat(macro.REPEAT_FOREVER, tween(this).call(() => {
            this._tweenNum++;
            this._tween.string = this._tweenNum.toString();
        }).delay(1)).start();
        let tw = new TimerTween(ttt);
        this.timer.add(tw);
    }


    private onSliderChange() {
        this._timeS = this._slider.progress * 5;
        this._timeScale.string = "TimeScale:" + this._timeS.toFixed(1);
        this.timer.setTimeScale(this._timeS);
    }

}


