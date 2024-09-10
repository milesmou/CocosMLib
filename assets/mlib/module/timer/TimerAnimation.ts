import { Animation } from "cc";
import { TimerObject } from "./TimerObject";

export class TimerAnimation extends TimerObject<Animation> {

    private _selfTimeScaleMap: Map<string, number> = new Map();//保存Animation中每个AnimationState的TimeScale

    public constructor(anim: Animation) {
        super();
        this._target = anim;
        this.initSelfTimeScale();
        this.groupTimeScale = 1;
    }

    public isValid(): boolean {
        return this._target?.isValid;
    }

    private initSelfTimeScale() {
        for (const clip of this._target.clips) {
            let state = this._target.getState(clip.name);
            if (state) {
                this._selfTimeScaleMap.set(state.name, state.speed);
            }
        }
    }

    public setSelfTimeScale(value: number, animName?: string): void {
        if (animName) {
            this._selfTimeScaleMap.set(animName, value);
        } else {
            this._selfTimeScaleMap.forEach((v, k) => this._selfTimeScaleMap.set(k, value));
        }
        this.updateTimeScale();
    }

    protected updateTimeScale(): void {
        for (const clip of this._target.clips) {
            let state = this._target.getState(clip.name);
            if (state) {
                if (!this._selfTimeScaleMap.has(state.name)) {
                    this._selfTimeScaleMap.set(state.name, state.speed);
                }
                let selfTimeScale = this._selfTimeScaleMap.get(state.name);
                state.speed = selfTimeScale * this.groupTimeScale;
            } else {
                this._target.scheduleOnce(this.updateTimeScale.bind(this));
                return;
            }
        }
    }

}