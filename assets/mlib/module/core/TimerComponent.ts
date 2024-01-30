import { _decorator, Animation, AnimationManager, AnimationState, Component, director, Scheduler, sp } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export class TimerComponent extends Component {
    private _timeScale: number = 1;
    private _pause: boolean = false;
    private _scheduler: Scheduler;
    private _animationManager: AnimationManager;
    private _animations: Set<Animation> = new Set();
    private _skeletons: Set<sp.Skeleton> = new Set();
    private _updateName = "update";
    private _manualUpdateName = "manualUpdate";

    protected onLoad(): void {
        this._scheduler = new Scheduler();
        this._animationManager = new AnimationManager();
    }

    public setTimeScale(timeScale: number) {
        this._timeScale = timeScale;
        if (this._scheduler) this._scheduler.setTimeScale(timeScale);
    }

    public getTimeScale() {
        return this._timeScale;
    }

    public pause() {
        this._pause = true;
    }

    public resume() {
        this._pause = false;
    }

    /** 添加对象 管理动作播放速度 */
    public add(obj: Animation | sp.Skeleton) {
        if (!obj?.isValid) return;
        if (obj instanceof Animation) {
            if (this._animations.has(obj)) return;
            this._animations.add(obj);
            this.swapAnimationManager(obj, true);
        } else if (obj instanceof sp.Skeleton) {
            if (this._skeletons.has(obj)) return;
            this._skeletons.add(obj)
            this.swapUpdateFunction(obj);
        }
    }

    /** 移除对象 改为由引擎管理播放速度 */
    public delete(obj: Animation | sp.Skeleton) {
        if (obj instanceof Animation) {
            if (this._animations.delete(obj)) {
                this.swapAnimationManager(obj, false)
            }
        } else if (obj instanceof sp.Skeleton) {
            if (this._skeletons.delete(obj)) {
                this.swapUpdateFunction(obj);
            }
        }
    }

    private getAnimationStates(anim: Animation) {
        let states: AnimationState[] = [];
        for (const clip of anim.clips) {
            let state = anim.getState(clip.name);
            if (state) states.push(state);
        }
        if (anim.defaultClip) {
            let state = anim.getState(anim.defaultClip.name);
            if (!states.includes(state)) states.push(state);
        }
        return states;
    }

    private swapAnimationManager(anim: Animation, isAdd: boolean) {
        let sysAnimationManager = director.getSystem(AnimationManager.ID) as AnimationManager;
        let states = this.getAnimationStates(anim);
        for (const state of states) {
            if (isAdd) {
                sysAnimationManager.removeAnimation(state);
                this._animationManager.addAnimation(state);
            } else {
                sysAnimationManager.addAnimation(state);
                this._animationManager.removeAnimation(state);
            }
        }
    }

    private swapUpdateFunction(obj: Component) {
        let manualUpdate = obj[this._manualUpdateName] || this.noneUpdate;
        let update = obj[this._updateName];
        obj[this._manualUpdateName] = update;
        obj[this._updateName] = manualUpdate;
    }

    public schedule(callback: (dt?: number) => void, interval?: number, repeat?: number, delay?: number, target?: object): void {
        if (this._scheduler) this._scheduler.schedule(callback, target, interval, repeat, delay);
    }

    public scheduleOnce(callback: (dt?: number) => void, delay?: number, target?: object): void {
        if (this._scheduler) this._scheduler.schedule(callback, target, delay);
    }

    public unschedule(callback: (dt?: number) => void, target?: object): void {
        if (this._scheduler) this._scheduler.unschedule(callback, target);
    }

    public unscheduleAllCallbacks() {
        if (this._scheduler) this._scheduler.unscheduleAll();
    }

    protected update(dt: number): void {
        if (this._pause) return;
        if (this._scheduler) {
            this._scheduler.update(dt);
            this._animationManager.update(dt * this._timeScale);
            this._skeletons.forEach(v => {
                if (v?.isValid) {
                    let func: Function = v[this._manualUpdateName];
                    if (typeof func === "function") {
                        func.call(v, dt * this._timeScale);
                    }
                } else {
                    this._skeletons.delete(v);
                }
            });
        }
    }

    private noneUpdate(dt: number): void {

    }
}
