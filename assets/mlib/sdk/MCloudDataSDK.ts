import { PREVIEW } from "cc/env";
import { HttpRequest } from "../module/network/HttpRequest";
import { MResponse, ResponseEmailData, ResponseGameData, ResponseGmData } from "./MResponse";

export class MCloudDataSDK {

    private static readonly EventUrl = "https://zq.zqygame.com/gweb/gameevent/reportevt";
    private static readonly DataUrl = "https://zq.zqygame.com/gweb/gamedata";

    /** 用户数据云存档保存Key */
    private static readonly userDataCloudSaveKey = "UserGameData";

    /** 上传游戏数据 */
    public static async saveGameData(uid: string, data: string, key = this.userDataCloudSaveKey) {
        let url = this.DataUrl + `/${mGameSetting.gameCode}/save_gamedata`;
        let body = {
            "uid": uid,
            "key": key,
            "data": data,
        }
        let result = await HttpRequest.requestObject(url, { method: "POST", data: body }) as MResponse;
        return result;
    }

    /** 删除游戏数据 */
    public static async delGameData(uid: string, key = this.userDataCloudSaveKey) {
        let url = this.DataUrl + `/${mGameSetting.gameCode}/del_gamedata`;
        let body = {
            "uid": uid,
            "key": key
        }
        let result = await HttpRequest.requestObject(url, { method: "POST", data: body }) as MResponse;
        return result;
    }

    /** 获取游戏数据 */
    public static async getGameData(uid: string, key = this.userDataCloudSaveKey) {
        let url = this.DataUrl + `/${mGameSetting.gameCode}/get_gamedata`;
        let body = {
            "uid": uid,
            "key": key
        }
        let result = await HttpRequest.requestObject(url, { method: "POST", data: body }) as MResponse<ResponseGameData>;
        return result;
    }

    /** 上传GM存档 */
    public static async saveGmData(data: string, commit: string) {
        let url = this.DataUrl + `/${mGameSetting.gameName}/save_gmdata`;
        let body = {
            "data": data,
            "commit": commit,
        }
        let result = await HttpRequest.requestObject(url, { method: "POST", data: body }) as MResponse;
        return result;
    }

    /** 删除GM存档 */
    public static async delGmData(id: string) {
        let url = this.DataUrl + `/${mGameSetting.gameName}/del_gmdata/${id}`;
        let result = await HttpRequest.requestObject(url, { method: "POST" }) as MResponse;
        return result;
    }

    /** 获取所有的GM存档 */
    public static async getGmDatas() {
        let url = this.DataUrl + `/${mGameSetting.gameName}/get_gmdatas`;
        let result = await HttpRequest.requestObject(url, { method: "POST" }) as MResponse<ResponseGmData[]>;
        return result;
    }

    /** 删除指定邮件 */
    public static async delEmailData(id: string) {
        let url = this.DataUrl + `/${mGameSetting.gameCode}/del_emaildata/${id}`;
        let result = await HttpRequest.requestObject(url, { method: "POST" }) as MResponse;
        return result;
    }

    /** 获取所有的邮件数据 */
    public static async getEmailDatas(uid: string) {
        let url = this.DataUrl + `/${mGameSetting.gameCode}/get_emaildatas`;
        let body = {
            "uid": uid,
        }
        let result = await HttpRequest.requestObject(url, { method: "POST", data: body }) as MResponse<ResponseEmailData[]>;
        return result;
    }


    /** 上报事件 */
    public static reportEvent(eventName: string, paramStr = "", num = 0) {
        eventName = PREVIEW ? "00_" + eventName : eventName;
        let body = {
            gameCode: mGameSetting.gameCode,
            eventName: eventName,
            param: paramStr,
            sum: num
        };
        HttpRequest.requestText(this.EventUrl, { method: "POST", data: body });
    }


}