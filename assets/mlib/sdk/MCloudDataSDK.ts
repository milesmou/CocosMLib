import { PREVIEW } from "cc/env";
import { HttpRequest } from "../module/network/HttpRequest";
import { MResponse, RespEmailData, RespGameData, RespGmData, RespPlayerGameData } from "./MResponse";

export class MCloudDataSDK {


    private static readonly Host = "https://zq.zqygame.com/gweb";

    private static readonly GameDataUrl = `${MCloudDataSDK.Host}/gamedata`;
    private static readonly GmDataUrl = `${MCloudDataSDK.Host}/gmdata`;
    private static readonly EmailUrl = `${MCloudDataSDK.Host}/email`;
    private static readonly EventUrl = `${MCloudDataSDK.Host}/gameevent/reportevt`;

    /** 用户数据云存档保存Key */
    private static readonly playerGameDataCloudSaveKey = "UserGameData";

    /** 上传游戏数据 */
    public static async saveGameData(uid: string, data: string, key: string) {
        let url = this.GameDataUrl + `/${mGameSetting.gameCode}/save_gamedata`;
        let body = {
            "uid": uid,
            "key": key,
            "data": data,
        }
        let result = await HttpRequest.requestObject(url, { method: "POST", data: body }) as MResponse;
        return result;
    }

    /** 删除游戏数据 */
    public static async delGameData(uid: string, key: string) {
        let url = this.GameDataUrl + `/${mGameSetting.gameCode}/del_gamedata`;
        let body = {
            "uid": uid,
            "key": key
        }
        let result = await HttpRequest.requestObject(url, { method: "POST", data: body }) as MResponse;
        return result;
    }

    /** 获取游戏数据 */
    public static async getGameData(uid: string, key: string) {
        let url = this.GameDataUrl + `/${mGameSetting.gameCode}/get_gamedata`;
        let body = {
            "uid": uid,
            "key": key
        }
        let result = await HttpRequest.requestObject(url, { method: "POST", data: body }) as MResponse<RespGameData>;
        return result;
    }

    /** 上传完成存档数据 */
    public static async savePlayerGameData(uid: string, data: string) {
        return await this.saveGameData(uid, data, this.playerGameDataCloudSaveKey);
    }

    /** 获取玩家存档数据 */
    public static async getPlayerGameData(uid: string) {
        let result: RespPlayerGameData = { updateTimeMS: 0, data: null };
        let res = await this.getGameData(uid, this.playerGameDataCloudSaveKey);
        if (res.code == 0 && res.data) {
            result.updateTimeMS = res.data.updateTime * 1000;
            result.data = res.data.data;
        }
        return result;
    }

    /** 上传GM存档 */
    public static async saveGmData(data: string, commit: string) {
        let url = this.GmDataUrl + `/${mGameSetting.gameName}/save_gmdata`;
        let body = {
            "data": data,
            "commit": commit,
        }
        let result = await HttpRequest.requestObject(url, { method: "POST", data: body }) as MResponse;
        return result;
    }

    /** 删除GM存档 */
    public static async delGmData(id: string) {
        let url = this.GmDataUrl + `/${mGameSetting.gameName}/del_gmdata/${id}`;
        let result = await HttpRequest.requestObject(url, { method: "POST" }) as MResponse;
        return result;
    }

    /** 获取所有的GM存档 */
    public static async getGmDatas() {
        let url = this.GmDataUrl + `/${mGameSetting.gameName}/get_gmdatas`;
        let result = await HttpRequest.requestObject(url, { method: "POST" }) as MResponse<RespGmData[]>;
        if (result?.code == 0) {
            return result.data;
        } else {
            mLogger.error(result);
            return null;
        }
    }

    /** 获取玩家所有的邮件 */
    public static async getEmails(uid: string) {
        let url = this.EmailUrl + `/${mGameSetting.gameCode}/get_emails?uid=${uid}`;
        let result = await HttpRequest.requestObject(url, { method: "POST" }) as MResponse<RespEmailData[]>;
        if (result?.code == 0) {
            return result.data;
        } else {
            mLogger.error(result);
            return null;
        }
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