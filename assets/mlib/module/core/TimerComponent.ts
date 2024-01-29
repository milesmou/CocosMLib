import { _decorator, Animation, Component, Scheduler, sp } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export class TimerComponent extends Component {
    private _scheduler: Scheduler;
    private _pause: boolean = false;
    private _animations: Set<Animation> = new Set();
    private _skeletons: Set<sp.Skeleton> = new Set();
    private _updateName = "update";
    private _manualUpdateName = "manualUpdate";

    protected onLoad(): void {
        this._scheduler = new Scheduler();
    }

    public setTimeScale(timeScale: number) {
        if (this._scheduler) this._scheduler.setTimeScale(timeScale);
    }

    public getTimeScale() {
        if (this._scheduler) return this._scheduler.getTimeScale();
        return 0;
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
        } else if (obj instanceof sp.Skeleton) {
            if (this._skeletons.has(obj)) return;
            this._skeletons.add(obj)
        }
        this.swapUpdateFunction(obj);
    }

    /** 移除对象 改为由引擎管理播放速度 */
    public delete(obj: Animation | sp.Skeleton) {
        let result = false;
        if (obj instanceof Animation) {
            result = this._animations.delete(obj);
        } else if (obj instanceof sp.Skeleton) {
            result = this._skeletons.delete(obj);
        }
        if (result) this.swapUpdateFunction(obj);
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
            this._animations.forEach(v => {
                if (v?.isValid) {
                    let func: Function = v[this._manualUpdateName];
                    if (typeof func === "function") {
                        func.call(v, dt * this._scheduler.getTimeScale());
                    }
                } else {
                    this._animations.delete(v);
                }
            });
            this._skeletons.forEach(v => {
                if (v?.isValid) {
                    let func: Function = v[this._manualUpdateName];
                    if (typeof func === "function") {
                        func.call(v, dt * this._scheduler.getTimeScale());
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
