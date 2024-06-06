import { _decorator, Component, Director, director, game, Game, Node, sys } from "cc";
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

    //网络获取的时间戳(毫秒)
    private _networkTimeMS = 0;
    //同步网络时间后过了多久(秒)
    private _totalDeltaTimeS = 0;

    //当前时间戳
    public get now() {
        if (this._networkTimeMS > 0) return this._networkTimeMS + Math.floor(this._totalDeltaTimeS * 1000);
        else return Date.now();
    }

    //当前时间对象
    public get date() {
        return new Date(this.now);
    }

    /** 当前日期(格式:20220101) */
    public get today() {
        let lt10 = (v: number) => {
            return v < 10 ? "0" + v : "" + v;
        }
        let date = new Date(this.now);
        let str = date.getFullYear() + lt10(date.getMonth() + 1) + lt10(date.getDate());
        return parseInt(str);
    }


    protected onLoad() {
        NetworkTime.Inst = this;
        this.syncTime();
        game.on(Game.EVENT_SHOW, this.syncTime, this);
    }

    protected update(dt: number) {
        this._totalDeltaTimeS += dt;
    }

    private async syncTime() {
        if (sys.isNative) {
            if (await this.syncTime1()) return;
        }
        if (await this.syncTime2()) return;
    }

    private setNetworkTimeMS(timeMS: number) {
        this._networkTimeMS = timeMS;
        this._totalDeltaTimeS = 0;
        logger.debug("网络时间同步成功", this._networkTimeMS);
    }

    /** 无法跨域 仅原生平台生效 */
    private async syncTime1() {
        let urls = ["https://www.baidu.com", "https://www.bing.com", "https://www.google.com"];
        for (const url of urls) {
            let xhr = await this.requestXHR(url);
            if (xhr) {
                let date = xhr.getResponseHeader("date");
                if (date) {
                    this.setNetworkTimeMS(new Date(date).getTime());
                    return true;
                }
            }
        }
        return false;
    }

    /** 可跨域 H5和原生平台均可使用 */
    private async syncTime2() {
        let url = "https://worldtimeapi.org/api/ip";
        let xhr = await this.requestXHR(url);
        try {
            let obj = JSON.parse(xhr.responseText);
            this.setNetworkTimeMS(new Date(obj.datetime).getTime());
            return true;
        } catch (error) {

        }
        return false;
    }

    /** 获取客户端的ip */
    public async getIP() {
        let url = "https://worldtimeapi.org/api/ip";
        let xhr = await this.requestXHR(url);
        try {
            let obj = JSON.parse(xhr.responseText);
            return obj.client_ip;
        } catch (error) {

        }
        return "";
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