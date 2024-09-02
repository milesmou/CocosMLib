import { sp } from "cc";
import { TimerObject } from "./TimerObject";

export class TimerSpine extends TimerObject<sp.Skeleton> {


    public constructor(spine: sp.Skeleton) {
        super();
        this._target = spine;
        this.selfTimeScale = spine.timeScale;
        this.groupTimeScale = 1;
    }

    public isValid(): boolean {
        return this._target?.isValid;
    }

    protected updateTimeScale(): void {
        this._target.timeScale = this.selfTimeScale * this.groupTimeScale;
    }

}