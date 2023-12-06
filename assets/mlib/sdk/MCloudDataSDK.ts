import { PREVIEW } from "cc/env";
import { App } from "../App";
import { HttpRequest } from "../module/network/HttpRequest";
import { MResponse } from "./MResponse";

export class MCloudDataSDK {

    private static readonly EventHost = "https://zeroplay.cn/gevent/reportevt";
    private static readonly DataHost = "https://zeroplay.cn/gdata/gamedata";

    private static GameCode: string;
    public static init(gameCode: string) {
        this.GameCode = gameCode;
    }

    /** 上传存档数据 */
    public static async saveGameData(uid: string, key: string, data: string, commit = "") {
        let url = this.DataHost + "/savedata";
        let body = {
            "uid": uid,
            "key": key,
            "data": data,
            "commit": commit
        }
        let result = await HttpRequest.requestObject(url, { method: "POST", data: body }) as MResponse;
        return result;
    }

    /** 删除存档数据 */
    public static async delGameData(uid: string, key: string) {
        let url = this.DataHost + "/deldata";
        let body = {
            "uid": uid,
            "key": key
        }
        let result = await HttpRequest.requestObject(url, { method: "POST", data: body }) as MResponse;
        return result;
    }

    /** 获取单条存档数据 */
    public static async getGameData(uid: string, key: string) {
        let url = this.DataHost + "/getdata";
        let body = {
            "uid": uid,
            "key": key
        }
        let result = await HttpRequest.requestObject(url, { method: "POST", data: body }) as MResponse;
        return result;
    }

    /** 获取多条存档数据 */
    public static async getGameDatas(uid: string) {
        let url = this.DataHost + "/getdatas";
        let body = {
            "uid": uid
        }
        let result = await HttpRequest.requestObject(url, { method: "POST", data: body }) as MResponse;
        return result;
    }

    /** 上报事件 */
    public static reportEvent(eventName: string, num: number, paramStr = "") {
        eventName = PREVIEW ? "00_" + eventName : eventName;
        let body = {
            gameCode: this.GameCode,
            eventName: eventName,
            param: paramStr,
            sum: num
        };
        HttpRequest.request(this.EventHost, { method: "POST", data: body });
    }


}