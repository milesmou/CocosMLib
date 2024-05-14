import { PREVIEW } from "cc/env";
import { HttpRequest } from "../module/network/HttpRequest";
import { MResponse } from "./MResponse";
import { GameSetting } from "../GameSetting";

export class MCloudDataSDK {

    private static readonly EventHost = "https://zq.zqygame.com/gevent/reportevt";
    private static readonly DataHost = "https://zq.zqygame.com/gdata/gamedata";

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
            gameCode: GameSetting.Inst.gameCode,
            eventName: eventName,
            param: paramStr,
            sum: num
        };
        // HttpRequest.requestText(this.EventHost, { method: "POST", data: body });
    }


}