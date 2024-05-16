import { sp } from "cc";
import { TimerObject } from "./TimerObject";

export class TimerSpine extends TimerObject {
    private _spine: sp.Skeleton;
    public get spine() { return this._spine; }

    public constructor(spine: sp.Skeleton) {
        super();
        this._spine = spine;
        this.selfTimeScale = spine.timeScale;
        this.groupTimeScale = 1;
    }

    public isValid(): boolean {
        return this._spine?.isValid;
    }

    protected updateTimeScale(): void {
        this._spine.timeScale = this.selfTimeScale * this.groupTimeScale;
    }

}