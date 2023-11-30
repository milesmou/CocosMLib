import { Component, Director, Node, director, game, macro, sys } from "cc";
import { MLogger } from "../module/logger/MLogger";
import { HttpRequest } from "../module/network/HttpRequest";
import { EDITOR } from "cc/env";

interface ScheduleKey {
    callback: Function,
    thisObj: object
}

export class TimerGroup {

    constructor(name: string) {
        this._name = name;
    }

    private _name = "";
    public get name() { return this._name; }

    // private _timeScale = 1;
    // public get timeScale() { return this._pause ? 0 : this._timeScale; };
    // public set timeScale(val) {
    //     this._timeScale = val;
    //     this.animations.forEach(anim => {
    //         let clips = anim.getClips();
    //         let info = this.originInfos.get(anim)
    //         let oTimeScale = info.oTimeScale;
    //         let sTimeScale = info.sTimeScale;
    //         for (let i = 0; i < clips.length; i++) {
    //             let state = anim.getAnimationState(clips[i].name);
    //             state.speed = this.timeScale * oTimeScale * sTimeScale[i];
    //         }
    //     });
    //     this.skeletons.forEach(sk => {
    //         let info = this.originInfos.get(sk);
    //         sk.timeScale = this.timeScale * info.oTimeScale * info.sTimeScale[0];
    //     });
    // };

    // private _pause = false;
    // public get pause() { return this._pause; }
    // public set pause(val) {
    //     this._pause = val;
    //     this.timeScale = this._timeScale;
    // }

    // /** 播放速度由3个值一起控制  TimerGroup的TimeScale*对象的TimeScale*对象动作的TimeScale (oTimeScale:对象TimeScale sTimeScale:动作TimeScale)*/
    // private originInfos: Map<object, { oTimeScale: number, sTimeScale: number[] }> = new Map();
    // private scheduleCallbacks: Map<ScheduleKey, { callback: (dt: number) => void, thisObj: object, interval: number, delay: number, repeat: number, totalDt: number }> = new Map();
    // private animations: Set<Animation> = new Set();
    // private skeletons: Set<sp.Skeleton> = new Set();

    // /** 添加对象到TimerGroup 管理动作播放速度 */
    // public add(obj: Animation | sp.Skeleton, oTimeScale: number = 1) {
    //     if (obj instanceof Animation) {
    //         let timeScales: number[] = [];
    //         this.animations.add(obj);
    //         let clips = obj.getClips();
    //         clips.forEach(v => {
    //             let state = obj.getAnimationState(v.name);
    //             timeScales.push(state.speed);
    //             state.speed = this.timeScale * oTimeScale * state.speed;
    //         });
    //         this.originInfos.set(obj, { oTimeScale: oTimeScale, sTimeScale: timeScales });
    //     } else if (obj instanceof sp.Skeleton) {
    //         this.skeletons.add(obj)
    //         this.originInfos.set(obj, { oTimeScale: oTimeScale, sTimeScale: [obj.timeScale] });
    //         obj.timeScale *= this.timeScale;
    //     }
    // }


    // public delete(obj: Animation | sp.Skeleton) {
    //     if (obj instanceof Animation) {
    //         this.animations.delete(obj);
    //     } else if (obj instanceof sp.Skeleton) {
    //         this.skeletons.delete(obj)
    //     }
    //     this.originInfos.delete(obj);
    // }

    // /** 修改对象的TimeScale */
    // public set(obj: Animation | sp.Skeleton, oTimeScale: number) {
    //     let o = this.originInfos.get(obj);
    //     if (o) {
    //         if (obj instanceof Animation) {
    //             let timeScales: number[] = [];
    //             let clips = obj.getClips();
    //             clips.forEach(v => {
    //                 let state = obj.getAnimationState(v.name);
    //                 timeScales.push(oTimeScale);
    //                 state.speed = oTimeScale * this.timeScale;
    //             });
    //             o.sTimeScale = timeScales;
    //         } else if (obj instanceof sp.Skeleton) {
    //             o.sTimeScale = [oTimeScale];
    //             obj.timeScale = oTimeScale * this.timeScale;
    //         }
    //     } else {
    //         error(`对象不存在`);
    //     }
    // }

    public update(dt: number) {
        //     if (this.pause) return;
        //     this.scheduleCallbacks.forEach((v, k) => {
        //         let realDt = dt * this.timeScale;
        //         v.delay -= realDt;
        //         v.totalDt += realDt;
        //         if (v.delay <= 0) {
        //             v.callback.call(v.thisObj, v.totalDt);
        //             v.delay = v.interval;
        //             v.repeat -= 1;
        //             v.totalDt = 0;
        //             if (v.repeat <= 0) this.scheduleCallbacks.delete(k);
        //         }
        //     });
    }

    // public scheduleOnce(callback: () => void, thisObj: object, delay?: number) {
    //     this.schedule(callback, thisObj, delay, 1, false);
    // }

    // public schedule(callback: (dt: number) => void, thisObj: object, interval = 0, repeat = macro.REPEAT_FOREVER, execImmediate = true) {
    //     let key: ScheduleKey = { callback: callback, thisObj: thisObj };
    //     this.scheduleCallbacks.set(key, { callback: callback, thisObj: thisObj, interval: interval, repeat: repeat, delay: execImmediate ? 0 : interval, totalDt: 0 });
    // }

    // public unSchedule(callback: (dt: number) => void, thisObj: object) {
    //     let iter = this.scheduleCallbacks.keys();
    //     for (let i = iter.next(); !i.done; i = iter.next()) {
    //         const v = i.value as ScheduleKey;
    //         if (v.callback == callback && v.thisObj == thisObj) {
    //             this.scheduleCallbacks.delete(v);
    //             break;
    //         }
    //     }
    // }

}

export class TimeMgr extends Component {

    public static Inst: TimeMgr;

    public static addToScene() {
        if (EDITOR || sys.isBrowser) return;
        let nodeName = "[TimeMgr]";
        let scene = director.getScene();
        if (!scene) return;
        let node = scene.getChildByName(nodeName);
        if (!node) {
            node = new Node(nodeName);
            scene.addChild(node);
            node.addComponent(TimeMgr);
            director.addPersistRootNode(node);
        }
    }

    //定时器组
    private timerGroups: Map<string, TimerGroup> = new Map();

    ///网络时间获取
    //获取网络时间的URL,获取响应头的date属性
    private urls = ["https://www.baidu.com", "https://www.bing.com", "https://www.google.com"];
    private urlIndex = 0;
    //网络获取的时间戳(毫秒)
    private networkTimeMS = 0;
    //同步网络时间后过了多久(秒)
    private totalDeltaTimeS = 0;

    //获取当前时间戳
    public get now() {
        if (this.networkTimeMS > 0) return this.networkTimeMS + Math.floor(this.totalDeltaTimeS * 1000);
        else return Date.now();
    }

    //获取当前时间对象
    public get date() {
        return new Date(this.now);;
    }

    /** 获取当前日期(格式:20220101) */
    public get today() {
        let lt10 = (v: number) => {
            return v < 10 ? "0" + v : "" + v;
        }
        let date = new Date(this.now);
        let str = date.getFullYear() + lt10(date.getMonth() + 1) + lt10(date.getDate());
        return parseInt(str);
    }


    /** 延迟指定时间(单位秒) */
    public delay(duration = 0) {
        let p = new Promise<void>((resolve, reject) => {
            this.scheduleOnce(() => {
                resolve();
            }, duration);
        });
        return p;
    }

    /** 延迟执行方法(单位秒) */
    public delayCall(action: () => void, duration = 0) {
        this.scheduleOnce(action, duration);
    }


    onLoad() {
        TimeMgr.Inst = this;
        if (!sys.isBrowser) {
            this.syncTime();
            this.schedule(this.syncTime, 10, macro.REPEAT_FOREVER);
        }
    }

    public createTimerGroup(name: string) {
        let timerGroup = this.timerGroups.get(name);
        if (timerGroup) {
            MLogger.warn("TimerGroup已存在 " + name);
        } else {
            timerGroup = new TimerGroup(name);
            this.timerGroups.set(name, timerGroup);
        }
        return timerGroup;
    }

    public destroyTimerGroup(nameOrGroup: string | TimerGroup) {
        let groupName: string;
        if (typeof nameOrGroup === "string") {
            groupName = nameOrGroup;
        } else {
            groupName = nameOrGroup.name;
        }
        if (this.timerGroups.has(groupName)) this.timerGroups.delete(groupName);
    }

    update(dt: number) {
        this.totalDeltaTimeS += dt;
        this.timerGroups.forEach(timerGroup => {
            timerGroup.update(dt);
        });
    }

    private async syncTime() {
        this.urlIndex %= this.urls.length;
        let url = this.urls[this.urlIndex];
        let xhr = await HttpRequest.requestXHR(url);
        if (xhr == null) {
            this.urlIndex++;
            this.syncTime();
        } else {
            let date = xhr.getResponseHeader("date");
            if (date) {
                this.networkTimeMS = new Date(date).getTime();
                this.totalDeltaTimeS = 0;
            } else {
                this.urlIndex++;
                this.syncTime();
            }
        }
    }

}

director.on(Director.EVENT_AFTER_SCENE_LAUNCH, TimeMgr.addToScene);