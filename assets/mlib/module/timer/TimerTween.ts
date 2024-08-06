import { Tween, TweenAction } from "cc";
import { TimerObject } from "./TimerObject";

export class TimerTween<T = any> extends TimerObject {

    private _valid: boolean;

    private _tween: Tween<T>;
    public get tween() { return this._tween; }


    private _finalAction: TweenAction;

    /** tween不要调用start方法，在被TimerTween包装时会自动调用 */
    public constructor(tween: Tween<T>) {
        super();
        this._tween = tween;
        this._tween.call(() => {
            this._valid = false;
        }).start();
        this._finalAction = this._tween['_finalAction'];
        this.selfTimeScale = this._finalAction.getSpeed();
        this.groupTimeScale = 1;
    }

    public isValid() {
        return this._valid;
    }

    protected updateTimeScale(): void {
        this._finalAction.setSpeed(this.selfTimeScale * this.groupTimeScale);
    }



}