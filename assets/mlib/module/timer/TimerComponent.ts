import { _decorator, Animation, Component, macro, sp, Tween } from "cc";
import { TimerAnimation } from "./TimerAnimation";
import { TimerObject } from "./TimerObject";
import { TimerSpine } from "./TimerSpine";
import { TimerTween } from "./TimerTween";

const { ccclass, property } = _decorator;

interface ScheduleValue {
    callback: (dt: number) => void;
    thisObj: object;
    interval: number;
    delay: number;
    repeat: number;
    totalDt: number;
}

interface OnceScheduleValue {
    callback: (dt: number) => void;
    thisObj: object;
    delay: number;
    onRatio: (ratio: number) => void;
    totalDt: number;
}

/**
 * 一个时间管理组件 可以控制schedule、tween、animation、spine的速度
 * schedule：自定义了一套scheduler方法
 * tween animation spine：通过使用TimerObject进行包装来控制速度
 */
@ccclass
export class TimerComponent extends Component {
    private _timeScale: number = 1;
    private _pause: boolean = false;

    private _schedules: Set<ScheduleValue> = new Set();
    private _onceSchedules: Set<OnceScheduleValue> = new Set();
    private _timerObjs: Set<TimerObject> = new Set();

    public setTimeScale(timeScale: number) {
        this._timeScale = timeScale;
        this.refresh();
    }

    public getTimeScale() {
        return this._timeScale;
    }

    public pause() {
        this._pause = true;
        this.refresh();

    }

    public resume() {
        this._pause = false;
        this.refresh();
    }

    /** 
     * 添加对象 管理动作播放速度
     * 
     * 添加到统一管理后，请通过返回值的setSelfTimeScale方法调整自身速度
     */
    public add<T extends object = any>(target: Tween<T>): TimerTween<T>;
    public add(target: Animation): TimerAnimation;
    public add(target: sp.Skeleton): TimerSpine;
    public add<T extends object = any>(target: Tween<T> | Animation | sp.Skeleton) {
        if (!target) return;
        let timerObject: TimerObject;
        if (target instanceof Tween) {
            timerObject = new TimerTween(target);
        } else if (target.isValid) {
            if (target instanceof Animation) {
                timerObject = new TimerAnimation(target);
            } else if (target instanceof sp.Skeleton) {
                timerObject = new TimerSpine(target);
            }
        }
        if (timerObject) {
            this._timerObjs.add(timerObject);
            this.changeSpeed(timerObject);
        }
        return timerObject;
    }

    /** 
     * 移除对象 还原为播放速度
     */
    public deleteByTarget<T extends object = any>(obj: Tween<T> | Animation | sp.Skeleton) {
        if (!obj) return;
        for (const timerObj of this._timerObjs) {
            if (timerObj.target == obj) {
                this.delete(timerObj);
                break;
            }
        }
    }

    /** 
     * 移除对象 还原为播放速度
     */
    public delete(obj: TimerObject) {
        if (!obj) return;
        this._timerObjs.delete(obj);
        this.revertSpeed(obj);
    }

    private refresh() {
        if (!this.isValid) return;
        this._timerObjs.forEach(v => {
            if (v.isValid()) {
                this.changeSpeed(v);
            } else {
                this._timerObjs.delete(v);
            }
        });
    }

    private changeSpeed(obj: TimerObject) {
        let speed = this._pause ? 0 : this._timeScale;
        obj.setGroupTimeScale(speed);
    }

    private revertSpeed(obj: TimerObject) {
        obj.setGroupTimeScale(1);
    }

    /** 
     * @deprecated 请使用scheduleM替代此方法
     */
    public schedule(callback: any, interval?: number, repeat?: number, delay?: number) { }
    public scheduleM(callback: (dt: number) => void, thisObj: object, interval = 0, repeat = -1, execImmediate = true) {
        let value: ScheduleValue = {
            callback: callback, thisObj: thisObj, interval: interval, repeat: repeat > 0 ? repeat : macro.REPEAT_FOREVER,
            delay: execImmediate ? 0 : interval, totalDt: 0
        };
        this._schedules.add(value);
    }

    /** 
     * @deprecated 请使用scheduleOnceM替代此方法
     */
    public scheduleOnce(callback: any, delay?: number) { }
    public scheduleOnceM(callback: () => void, thisObj: object, delay?: number, onRatio?: (ratio: number) => void) {
        onRatio && onRatio(0);
        let value: OnceScheduleValue = {
            callback: callback, thisObj: thisObj, delay: delay || 0, onRatio: onRatio, totalDt: 0
        };
        this._onceSchedules.add(value);
    }

    /** 
     * @deprecated 请使用unschedule替代此方法
     */
    public unschedule(callback: any) { }
    public unScheduleM(callback: (dt: number) => void, thisObj: object) {
        for (const v of this._schedules.values()) {
            if (v.callback == callback && v.thisObj == thisObj) {
                this._schedules.delete(v);
                break;
            }
        }
        for (const v of this._onceSchedules.values()) {
            if (v.callback == callback && v.thisObj == thisObj) {
                this._onceSchedules.delete(v);
                break;
            }
        }
    }

    /** 
    * @deprecated 请使用unscheduleAllCallbacks替代此方法
    */
    public unscheduleAllCallbacks() { }
    public unscheduleAllCallbacksM() {
        this._schedules.clear();
    }

    public hasCallback(callback: (dt: number) => void, thisObj: object): boolean {
        for (const v of this._schedules.values()) {
            if (v.callback == callback && v.thisObj == thisObj) {
                return true;
            }
        }
        for (const v of this._onceSchedules.values()) {
            if (v.callback == callback && v.thisObj == thisObj) {
                return true;
            }
        }
        return false;
    }

    public dealy(delay?: number, onRatio?: (ratio: number) => void) {
        let p = new Promise<void>((resolve, reject) => {
            this.scheduleOnceM(() => {
                resolve();
            }, this, delay, onRatio);
        });
        return p;
    }

    protected update(dt: number): void {
        if (this._pause) return;

        let realDt = dt * this._timeScale;
        //Scheduler
        this._schedules.forEach(v => {
            v.delay -= realDt;
            v.totalDt += realDt;
            if (v.delay <= 0) {
                v.callback.call(v.thisObj, v.totalDt);
                v.delay = v.interval;
                v.repeat -= 1;
                v.totalDt = 0;
                if (v.repeat <= 0) this._schedules.delete(v);
            }
        });
        //OnceScheduler
        this._onceSchedules.forEach(v => {
            v.totalDt += realDt;
            v.onRatio && v.onRatio(v.totalDt / v.delay);
            if (v.totalDt >= v.delay) {
                v.callback.call(v.thisObj, v.totalDt);
                this._onceSchedules.delete(v);
            }
        });
    }
}

