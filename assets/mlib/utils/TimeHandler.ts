import { Component, Director, director, Node, Tween, tween } from "cc";
import { EDITOR } from "cc/env";
import { HttpRequest } from "../network/HttpRequest";

export class TimerGroup {

    constructor(name: string) {
        this._name = name;
    }

    private _name = "";
    public get name() { return this._name; }

    public timeScale = 1;

    private _pause = false;
    public get pause() { return this._pause; }
    public set pause(val) { this._pause = val; }

    public callbacks: ((dt: number) => void)[] = [];
}

export class TimeHandler extends Component {

    public static Inst: TimeHandler;

    public static addToScene() {
        if (EDITOR) return;
        let nodeName = "[TimeHandler]";
        let scene = director.getScene();
        if (!scene) return;
        let node = scene.getChildByName(nodeName);
        if (!node) {
            node = new Node(nodeName);
            scene.addChild(node);
            node.addComponent(TimeHandler);
            director.addPersistRootNode(node);
        }
    }

    private urls = ["https://www.baidu.com", "https://www.microsoft.com"];
    private networkTimeMS = 0;
    private localTimeMS = 0;


    private timerGroups: TimerGroup[] = [];

    onLoad() {
        TimeHandler.Inst = this;
        this.syncTime();
    }


    update(dt: number) {
        for (const timerGroup of this.timerGroups) {
            if (timerGroup.pause) continue;
            for (const callback of timerGroup.callbacks) {
                callback(dt * timerGroup.timeScale);
            }
        }
    }

    private async syncTime() {
        console.log("hahah1");
        let xhr = await HttpRequest.request(this.urls[0]);
        console.log("hahah2");
        console.log(xhr.getResponseHeader("date"));
    }

    public createTimerGroup(name: string) {
        let timerGroup = this.timerGroups.find(v => v.name == name);
        if (timerGroup) {
            console.warn("TimerGroup已存在 " + name);
        } else {
            timerGroup = new TimerGroup(name);
        }
        return timerGroup;
    }

    public destroyTimerGroup(name: string) {
        let index = this.timerGroups.findIndex(v => v.name == name);
        if (index > -1) {
            this.timerGroups[index].pause = true;
            this.timerGroups.splice(index, 1);
        }
    }

}

director.on(Director.EVENT_AFTER_SCENE_LAUNCH, TimeHandler.addToScene);