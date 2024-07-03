import { Animation } from "cc";
import { TimerObject } from "./TimerObject";

export class TimerAnimation extends TimerObject {
    private _anim: Animation;
    public get anim() { return this._anim; }

    private _selfTimeScaleMap: Map<string, number> = new Map();//保存每个Animation中每个AnimationState的TimeScale

    public constructor(anim: Animation) {
        super();
        this._anim = anim;
        this.initSelfTimeScale();
        this.groupTimeScale = 1;
    }

    public isValid(): boolean {
        return this.valid && this._anim?.isValid;
    }

    private initSelfTimeScale() {
        for (const clip of this._anim.clips) {
            let state = this._anim.getState(clip.name);
            if (state) {
                this._selfTimeScaleMap.set(state.name, state.speed);
            }
        }
    }

    public setSelfTimeScale(value: number, animName: string): void {
        this._selfTimeScaleMap.set(animName, value);
        this.updateTimeScale();
    }

    protected updateTimeScale(): void {
        for (const clip of this._anim.clips) {
            let state = this._anim.getState(clip.name);
            if (state) {
                if (!this._selfTimeScaleMap.has(state.name)) {
                    this._selfTimeScaleMap.set(state.name, state.speed);
                }
                let selfTimeScale = this._selfTimeScaleMap.get(state.name);
                state.speed = selfTimeScale * this.groupTimeScale;
            } else {
                this.anim.scheduleOnce(this.updateTimeScale.bind(this));
                return;
            }
        }
    }

}