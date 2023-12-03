import { Animation, macro, sp } from "cc";
import { MLogger } from "../logger/MLogger";

interface ScheduleKey {
    callback: Function,
    thisObj: object
}

export class Timer {
    constructor(name: string) {
        this._name = name;
    }
    private _name: string;
    public get name() { return this._name; }

    private _timeScale = 1;
    public get timeScale() { return this._pause ? 0 : this._timeScale; };
    public set timeScale(val) {
        this._timeScale = val;
        this.animations.forEach(anim => {
            if (!anim?.isValid) {
                this.animations.delete(anim);
                return;
            }
            let clips = anim.clips;
            let info = this.originInfos.get(anim)
            let oTimeScale = info.oTimeScale;
            let sTimeScale = info.sTimeScale;
            for (let i = 0; i < clips.length; i++) {
                let state = anim.getState(clips[i].name);
                state.speed = this.timeScale * oTimeScale * sTimeScale[i];
            }
        });
        this.skeletons.forEach(sk => {
            if (!sk?.isValid) {
                this.skeletons.delete(sk);
                return;
            }
            let info = this.originInfos.get(sk);
            sk.timeScale = this.timeScale * info.oTimeScale * info.sTimeScale[0];
        });
    };

    private _pause = false;
    public get pause() { return this._pause; }
    public set pause(val) {
        this._pause = val;
        this.timeScale = this._timeScale;
    }

    /** 播放速度由3个值一起控制  Timer的TimeScale*对象的TimeScale*对象动作的TimeScale (oTimeScale:对象TimeScale sTimeScale:动作TimeScale)*/
    private originInfos: Map<object, { oTimeScale: number, sTimeScale: number[] }> = new Map();
    private scheduleCallbacks: Map<ScheduleKey, { callback: (dt: number) => void, thisObj: object, interval: number, delay: number, repeat: number, totalDt: number }> = new Map();
    private animations: Set<Animation> = new Set();
    private skeletons: Set<sp.Skeleton> = new Set();

    /** 添加对象到Timer 管理动作播放速度 */
    public add(obj: Animation | sp.Skeleton, oTimeScale: number = 1) {
        if (!obj?.isValid) return;
        if (obj instanceof Animation) {
            let timeScales: number[] = [];
            this.animations.add(obj);
            let clips = obj.clips;
            clips.forEach(v => {
                let state = obj.getState(v.name);
                timeScales.push(state.speed);
                state.speed = this.timeScale * oTimeScale * state.speed;
            });
            this.originInfos.set(obj, { oTimeScale: oTimeScale, sTimeScale: timeScales });
        } else if (obj instanceof sp.Skeleton) {
            this.skeletons.add(obj)
            this.originInfos.set(obj, { oTimeScale: oTimeScale, sTimeScale: [obj.timeScale] });
            obj.timeScale *= this.timeScale;
        }
    }

    /** 从Timer移除对象 */
    public delete(obj: Animation | sp.Skeleton) {
        if (obj instanceof Animation) {
            this.animations.delete(obj);
        } else if (obj instanceof sp.Skeleton) {
            this.skeletons.delete(obj)
        }
        this.originInfos.delete(obj);
    }

    /** 修改对象的TimeScale */
    public set(obj: Animation | sp.Skeleton, oTimeScale: number) {
        if (!obj?.isValid) return;
        let o = this.originInfos.get(obj);
        if (o) {
            if (obj instanceof Animation) {
                let timeScales: number[] = [];
                let clips = obj.clips;
                clips.forEach(v => {
                    let state = obj.getState(v.name);
                    timeScales.push(oTimeScale);
                    state.speed = oTimeScale * this.timeScale;
                });
                o.sTimeScale = timeScales;
            } else if (obj instanceof sp.Skeleton) {
                o.sTimeScale = [oTimeScale];
                obj.timeScale = oTimeScale * this.timeScale;
            }
        } else {
            MLogger.error(`对象不存在`);
        }
    }

    public update(dt: number) {
        if (this.pause) return;
        this.scheduleCallbacks.forEach((v, k) => {
            let realDt = dt * this.timeScale;
            v.delay -= realDt;
            v.totalDt += realDt;
            if (v.delay <= 0) {
                v.callback.call(v.thisObj, v.totalDt);
                v.delay = v.interval;
                v.repeat -= 1;
                v.totalDt = 0;
                if (v.repeat <= 0) this.scheduleCallbacks.delete(k);
            }
        });
    }


    /** 延迟指定时间(单位秒) */
    public delay(duration = 0) {
        let p = new Promise<void>((resolve, reject) => {
            this.scheduleOnce(() => {
                resolve();
            }, this, duration);
        });
        return p;
    }

    /** 延迟执行方法(单位秒) */
    public delayCall(action: () => void, duration = 0) {
        this.scheduleOnce(action, this, duration);
    }

    public scheduleOnce(callback: () => void, thisObj: object, delay?: number) {
        this.schedule(callback, thisObj, delay, 1, false);
    }

    public schedule(callback: (dt: number) => void, thisObj: object, interval = 0, repeat = macro.REPEAT_FOREVER, execImmediate = true) {
        let key: ScheduleKey = { callback: callback, thisObj: thisObj };
        this.scheduleCallbacks.set(key, { callback: callback, thisObj: thisObj, interval: interval, repeat: repeat, delay: execImmediate ? 0 : interval, totalDt: 0 });
    }

    public unSchedule(callback: (dt: number) => void, thisObj: object) {
        let iter = this.scheduleCallbacks.keys();
        for (let i = iter.next(); !i.done; i = iter.next()) {
            const v = i.value as ScheduleKey;
            if (v.callback == callback && v.thisObj == thisObj) {
                this.scheduleCallbacks.delete(v);
                break;
            }
        }
    }

}
