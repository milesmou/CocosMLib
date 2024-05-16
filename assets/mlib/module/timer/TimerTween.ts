import { Tween, TweenAction } from "cc";
import { TimerObject } from "./TimerObject";

export class TimerTween<T = any> extends TimerObject {
    private _tween: Tween<T>;
    public get tween() { return this._tween; }

    private _finalAction: TweenAction;

    public constructor(tween: Tween<T>) {
        super();
        this._tween = tween;
        this._tween.call(() => {
            this._tween = undefined;
            this.onEnded && this.onEnded();
        }).start();
        this._finalAction = this._tween['_finalAction'];
        this.selfTimeScale = this._finalAction.getSpeed();
        this.groupTimeScale = 1;
    }

    public isValid(): boolean {
        return Boolean(this._tween);
    }

    protected updateTimeScale(): void {
        this._finalAction.setSpeed(this.selfTimeScale * this.groupTimeScale);
    }

}