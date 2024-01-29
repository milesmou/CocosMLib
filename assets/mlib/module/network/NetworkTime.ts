import { _decorator, Component, Director, director, macro, Node, sys } from "cc";
import { EDITOR } from "cc/env";

const { ccclass, property } = _decorator;

@ccclass
export class NetworkTime extends Component {

    public static Inst: NetworkTime;

    public static addToScene() {
        if (EDITOR) return;
        let nodeName = "[NetworkTime]";
        let scene = director.getScene();
        if (!scene) return;
        let node = scene.getChildByName(nodeName);
        if (!node) {
            node = new Node(nodeName);
            scene.addChild(node);
            node.addComponent(NetworkTime);
            director.addPersistRootNode(node);
        }
    }

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

    onLoad() {
        NetworkTime.Inst = this;
        if (sys.isNative) {
            this.syncTime();
            this.schedule(this.syncTime, 10, macro.REPEAT_FOREVER);
        }
    }

    update(dt: number) {
        this.totalDeltaTimeS += dt;
    }

    private async syncTime() {
        this.urlIndex %= this.urls.length;
        let url = this.urls[this.urlIndex];
        let xhr = await this.requestXHR(url);
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

    private async requestXHR(url: string) {
        let p = new Promise<XMLHttpRequest>((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.timeout = 3000;
            xhr.ontimeout = () => {
                resolve(null);
            };
            xhr.onabort = () => {
                resolve(null);
            };
            xhr.onerror = () => {
                resolve(null);
            };
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        resolve(xhr);
                    } else {
                        resolve(null);
                    }
                }
            }
            xhr.open("GET", url, true);
            xhr.send();
        });
        return p;
    }

}
director.on(Director.EVENT_AFTER_SCENE_LAUNCH, NetworkTime.addToScene);