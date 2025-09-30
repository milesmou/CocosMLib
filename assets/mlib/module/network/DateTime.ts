import { _decorator, Component, game, Game, sys } from "cc";
import { HttpMisc } from "../../sdk/GameWeb/Misc/HttpMisc";
import { persistNode } from "../core/Decorator";
import { HttpRequest } from "./HttpRequest";

const { ccclass, property } = _decorator;

interface IDateTime {
    /** 当前时间戳 */
    now(): number;
    /** 当前时间戳(秒)  */
    nowS(): number;
    /** 当前时间对象 */
    get date(): Date;
}

@persistNode
@ccclass("DateTime")
export class DateTime extends Component implements IDateTime {

    //网络获取的时间戳(毫秒)
    private _networkTimeMS = 0;
    //同步网络时间后过了多久(秒)
    private _totalDeltaTimeS = 0;

    /** 当前时间戳 */
    public now() {
        if (this._networkTimeMS > 0) return this._networkTimeMS + Math.floor(this._totalDeltaTimeS * 1000);
        else return Date.now();
    }

    /** 当前时间戳(秒) */
    public nowS() {
        return Math.floor(this.now() / 1000);
    }

    /** 当前时间对象 */
    public get date() {
        return new Date(this.now());
    }

    protected onLoad() {
        //@ts-ignore
        globalThis.mTime = this;
        this.syncTime();
        this.schedule(this.syncTime, 120);
        game.on(Game.EVENT_SHOW, this.syncTime, this);
    }

    protected update(dt: number) {
        this._totalDeltaTimeS += dt;
    }

    private async syncTime() {
        if (sys.isNative) {
            this.syncTimeNative();
        } else {
            this.syncTimeWeb();
        }
    }

    private setNetworkTimeMS(timeMS: number) {
        this._networkTimeMS = timeMS;
        this._totalDeltaTimeS = 0;
    }

    /** 无法跨域 仅原生平台生效 */
    private async syncTimeNative() {
        let urls = ["https://www.baidu.com", "https://www.bing.com", "https://www.google.com"];
        for (const url of urls) {
            let xhr = await HttpRequest.request(url, { method: "GET" });
            if (xhr) {
                let date = xhr.getResponseHeader("date");
                if (date) {
                    this.setNetworkTimeMS(new Date(date).getTime());
                    return;
                }
            }
        }
        this.syncTimeWeb()
    }

    /** 可跨域 适用于web和小游戏 */
    private async syncTimeWeb() {
        let time = await HttpMisc.time();
        if (time) {
            this.setNetworkTimeMS(time);
        }
    }
}

declare global {
    /** 当前时间对象 */
    const mTime: IDateTime;
}