import { Component, Director, Node, director, macro, sys } from "cc";
import { EDITOR_NOT_IN_PREVIEW } from "cc/env";
import { MLogger } from "../logger/MLogger";
import { Timer } from "./Timer";

interface ScheduleKey {
    callback: Function,
    thisObj: object
}


/** 定时器管理类 */
export class TimerMgr extends Component {

    public static Inst: TimerMgr;

    public static addToScene() {
        if (EDITOR_NOT_IN_PREVIEW) return;
        let nodeName = "[TimeMgr]";
        let scene = director.getScene();
        if (!scene) return;
        let node = scene.getChildByName(nodeName);
        if (!node) {
            node = new Node(nodeName);
            scene.addChild(node);
            node.addComponent(TimerMgr);
            director.addPersistRootNode(node);
        }
    }

    //定时器
    private _timers: Map<string, Timer> = new Map();

    protected onLoad(): void {
        TimerMgr.Inst = this;
    }

    public createTimer(name: string) {
        let timer = this._timers.get(name);
        if (timer) {
            MLogger.warn("TimerGroup已存在 " + name);
        } else {
            timer = new Timer(name);
            this._timers.set(name, timer);
        }
        return timer;
    }

    public destroyTimer(nameOrTimer: string | Timer) {
        let groupName: string;
        if (typeof nameOrTimer === "string") {
            groupName = nameOrTimer;
        } else {
            groupName = nameOrTimer.name;
        }
        if (this._timers.has(groupName)) this._timers.delete(groupName);
    }

    update(dt: number) {
        this._timers.forEach(timer => {
            timer.update(dt);
        });
    }

}

director.on(Director.EVENT_AFTER_SCENE_LAUNCH, TimerMgr.addToScene.bind(TimerMgr));