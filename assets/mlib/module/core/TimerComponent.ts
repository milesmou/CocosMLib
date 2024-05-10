import { _decorator, Animation, AnimationManager, AnimationState, Component, director, macro, sp } from "cc";

const { ccclass, property } = _decorator;

interface ScheduleValue {
    callback: (dt: number) => void;
    thisObj: object;
    interval: number;
    delay: number;
    repeat: number;
    totalDt: number;
}

/**
 * 一个时间管理组件 可以控制schedule、animation、spine的速度
 * schedule：自定义了一套scheduler方法
 * animation：通过修改animation的AnimationManager为自定义的AnimationManager来控制
 * spine：通过置空spine原来的update方法，然后使用本组件来驱动spine的update
 */
@ccclass
export class TimerComponent extends Component {
    private _timeScale: number = 1;
    private _pause: boolean = false;

    private _schedules: Set<ScheduleValue> = new Set();

    private _animationManager: AnimationManager;

    private _animations: Set<Animation> = new Set();
    private _skeletons: Set<sp.Skeleton> = new Set();
    private _updateName = "update";
    private _manualUpdateName = "manualUpdate";

    protected onLoad(): void {
        this._animationManager = new AnimationManager();
    }

    public setTimeScale(timeScale: number) {
        this._timeScale = timeScale;
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

    /** 获取animation的所有AnimationState */
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

    /** 切换animation的AnimationManager */
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

    /** 切换spine的update方法 */
    private swapUpdateFunction(obj: Component) {
        let manualUpdate = obj[this._manualUpdateName] || this.noneUpdate;
        let update = obj[this._updateName];
        obj[this._manualUpdateName] = update;
        obj[this._updateName] = manualUpdate;
    }

    public scheduleM(callback: (dt: number) => void, thisObj: object, interval = 0, repeat = macro.REPEAT_FOREVER, execImmediate = true) {
        let value: ScheduleValue = { callback: callback, thisObj: thisObj, interval: interval, repeat: repeat, delay: execImmediate ? 0 : interval, totalDt: 0 };
        this._schedules.add(value);
    }

    public scheduleOnceM(callback: () => void, thisObj: object, delay?: number) {
        this.scheduleM(callback, thisObj, delay, 1, false);
    }

    public unScheduleM(callback: (dt: number) => void, thisObj: object) {
        let iter = this._schedules.values();
        for (let i = iter.next(); !i.done; i = iter.next()) {
            const v = i.value as ScheduleValue;
            if (v.callback == callback && v.thisObj == thisObj) {
                this._schedules.delete(v);
                break;
            }
        }
    }

    public dealy(delay?: number) {
        let p = new Promise<void>((resolve, reject) => {
            this.scheduleOnceM(() => {
                resolve();
            }, this, delay || 0);
        });
        return p;
    }

    public update(dt: number): void {
        if (this._pause) return;
        this._schedules.forEach(v => {
            let realDt = dt * this._timeScale;
            v.delay -= realDt;
            v.totalDt += realDt;
            if (v.delay <= 0) {
                v.callback.call(v.thisObj, v.totalDt);
                v.delay = v.interval;
                v.repeat -= 1;
                v.totalDt = 0;
                if (v.repeat < 0) this._schedules.delete(v);
            }
        });

        if (this._animationManager) {
            this._animationManager.update(dt * this._timeScale);
        }

        if (this._skeletons.size > 0) {
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
        //空的update方法 用于屏蔽引擎引擎对spine的驱动
    }
}
