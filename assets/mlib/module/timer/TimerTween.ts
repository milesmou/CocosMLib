import { Tween, TweenAction } from "cc";
import { TimerObject } from "./TimerObject";

export class TimerTween<T = any> extends TimerObject<Tween<T>> {

    private _finalAction: TweenAction;

    public constructor(tween: Tween<T>) {
        super();
        this._target = tween;
        this._target.start();
        this._finalAction = this._target['_finalAction'];
        this.selfTimeScale = this._finalAction.getSpeed();
        this.groupTimeScale = 1;
    }

    public isValid() {
        return this._finalAction.isDone();
    }

    protected updateTimeScale(): void {
        this._finalAction.setSpeed(this.selfTimeScale * this.groupTimeScale);
    }

}