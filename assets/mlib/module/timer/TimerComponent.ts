import { _decorator, Component, macro } from "cc";
import { TimerObject } from "./TimerObject";

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
 * 一个时间管理组件 可以控制tween、schedule、animation、spine的速度
 * schedule：自定义了一套scheduler方法
 * tween animation spine：通过使用TimerObject进行包装来控制速度
 */
@ccclass
export class TimerComponent extends Component {
    private _timeScale: number = 1;
    private _pause: boolean = false;

    private _schedules: Set<ScheduleValue> = new Set();
    private _timerObjs: Set<TimerObject> = new Set();

    protected start(): void {
        this.schedule(this.checkValid, 3);
    }

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
     * tween在添加时会自动开始
     */
    public add(obj: TimerObject) {
        if (!obj) return;
        this._timerObjs.add(obj);
        this.changeTimerObjectSpeed(obj, true);
    }

    /** 移除对象 还原为播放速度 */
    public delete(obj: TimerObject) {
        if (!obj) return;
        this._timerObjs.delete(obj);
        this.changeTimerObjectSpeed(obj, false);
    }

    private refresh() {
        this._timerObjs.forEach(v => {
            if (v.isValid()) {
                this.changeTimerObjectSpeed(v, true);
            } else {
                this._timerObjs.delete(v);
            }
        });
    }

    private changeTimerObjectSpeed(obj: TimerObject, add: boolean) {
        let speed = add ? this._timeScale : 1;
        if (this._pause && add) speed = 0;
        obj.setGroupTimeScale(speed);
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
        for (const v of iter) {
            if (v.callback == callback && v.thisObj == thisObj) {
                this._schedules.delete(v);
                break;
            }
        }
    }

    public unscheduleAllCallbacksM() {
        this._schedules.clear();
    }

    public dealy(delay?: number) {
        let p = new Promise<void>((resolve, reject) => {
            this.scheduleOnceM(() => {
                resolve();
            }, this, delay || 0);
        });
        return p;
    }

    /** 检测并移除无效的TimerObject */
    private checkValid() {
        this._timerObjs.forEach(v => {
            if (!v.isValid) {
                this._timerObjs.delete(v);
            }
        });
    }

    public update(dt: number): void {
        if (this._pause) return;

        //Scheduler
        this._schedules.forEach(v => {
            let realDt = dt * this._timeScale;
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
    }
}
