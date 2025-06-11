import { PREVIEW } from "cc/env";
import { HttpRequest } from "../module/network/HttpRequest";
import { Leaderboard, MResponse, ReqDYSceneCheck, ReqWXBizData, ReqWxMediaSecCheck, ReqWxMsgSecCheck, RspAnnouncement, RspEmail, RspGameData, RspGmData, RspPlayerGameData, RspUnusedOrderInfo, RspWXBizData, RspWxSecCheck, RsqWxLogin } from "./MResponse";

export class MCloudDataSDK {

    private static get GameDataUrl() { return `${mGameSetting.serverUrl}/gamedata`; }
    private static get PurchaseUrl() { return `${mGameSetting.serverUrl}/${mGameSetting.gameCode}/purchasenew`; }
    private static get GmDataUrl() { return `${mGameSetting.serverUrl}/gmdata`; }
    private static get EmailUrl() { return `${mGameSetting.serverUrl}/email`; }
    private static get EventUrl() { return `${mGameSetting.serverUrl}/gameevent/reportevt`; }

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
        let result = await HttpRequest.requestObject(url, { method: "POST", data: body }) as MResponse<RspGameData>;
        return result;
    }

    /** 上传完成存档数据 */
    public static async savePlayerGameData(uid: string, data: string) {
        return await this.saveGameData(uid, data, this.playerGameDataCloudSaveKey);
    }

    /** 获取玩家存档数据 */
    public static async getPlayerGameData(uid: string) {
        let result: RspPlayerGameData = { updateTimeMS: 0, data: null };
        let res = await this.getGameData(uid, this.playerGameDataCloudSaveKey);
        if (res.code == 0 && res.data) {
            result.updateTimeMS = res.data.updateTime * 1000;
            result.data = res.data.data;
        }
        return result;
    }

    /** 
     * 查询支付订单是否存在
     * @param pollingDur 轮询时长 默认为0只查询一次
     */
    public static async queryOrder(uid: string, orderId: string, pollingDur = 0) {
        let url = this.PurchaseUrl + `/queryorder?uid=${uid}&orderId=${orderId}`;
        if (pollingDur > 0) {
            let result = await HttpRequest.requesObjectUntil<MResponse<boolean>>(url, v => v.data, pollingDur, { method: "POST" });
            return result?.data;
        } else {
            let result = await HttpRequest.requestObject(url, { method: "POST" }) as MResponse<boolean>;
            return result?.data;
        }

    }

    /** 查询所有未完成的订单(返回商品id数组) */
    public static async queryUnusedOrder(uid: string) {
        let url = this.PurchaseUrl + `/queryunusedorder?uid=${uid}`;
        let result = await HttpRequest.requestObject(url, { method: "POST" }) as MResponse<RspUnusedOrderInfo[]>;
        if (result?.code == 0) {
            return result.data;
        }
        return null;
    }

    /** 
     * 完成指定未完成的订单
     * @param orderId 订单id 填all表示完成所有未完成订单
     */
    public static async finishOrder(uid: string, orderId: string) {
        let url = this.PurchaseUrl + `/finishorder?uid=${uid}&orderId=${orderId}`;
        await HttpRequest.requestObject(url, { method: "POST" }) as MResponse;
    }

    /** 获取玩家所有的邮件 */
    public static async getEmails(uid: string) {
        let url = this.EmailUrl + `/${mGameSetting.gameCode}/get_emails?uid=${uid}`;
        let result = await HttpRequest.requestObject(url, { method: "POST" }) as MResponse<RspEmail[]>;
        if (result?.code == 0) {
            return result.data;
        } else {
            mLogger.error(result);
            return null;
        }
    }

    /** 获取最新公告 */
    public static async getAnnouncement() {
        let url = mGameSetting.serverUrl + `/announcement/${mGameSetting.gameCode}/get_announcement`;
        let result = await HttpRequest.requestObject(url, { method: "POST" }) as MResponse<RspAnnouncement>;
        if (result?.code == 0) {
            return result.data;
        } else {
            mLogger.error(result);
            return null;
        }
    }

    /** 更新排行榜分数 */
    public static async updateLeaderboard(leaderboardName: string, leaderboard: Leaderboard) {
        let url = mGameSetting.serverUrl + `/leaderboard/${mGameSetting.gameCode}/update_leaderboard?leaderboardName=${leaderboardName}`;
        let result = await HttpRequest.requestObject(url, { method: "POST", data: leaderboard }) as MResponse;
        if (result?.code == 0) {
            return true;
        } else {
            mLogger.error(result);
            return false;
        }
    }

    /** 获取排行榜 */
    public static async getLeaderboards(leaderboardName: string, count: number) {
        let url = mGameSetting.serverUrl + `/leaderboard/${mGameSetting.gameCode}/get_leaderboards?leaderboardName=${leaderboardName}&count=${count}`;
        let result = await HttpRequest.requestObject(url, { method: "POST" }) as MResponse<Leaderboard[]>;
        if (result?.code == 0) {
            return result.data;
        } else {
            mLogger.error(result);
            return null;
        }
    }

    /** 兑换码校验 (code: 0成功 -1失败不存在 501未到兑换时间 502已过期) (data: 兑换成功后的奖励) */
    public static async verifyRedeemcode(redeemCode: string) {
        let url = mGameSetting.serverUrl + `/redeemcode/${mGameSetting.gameCode}/verify_redeemcode?redeemCode=${redeemCode}`;
        let result = await HttpRequest.requestObject(url, { method: "POST" }) as MResponse<string>;
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
        let result = await HttpRequest.requestObject(url, { method: "POST" }) as MResponse<RspGmData[]>;
        if (result?.code == 0) {
            return result.data;
        } else {
            mLogger.error(result);
            return null;
        }
    }

    //#region 微信小游戏接口

    /** 微信小游戏敏感词检测 */
    public static async wxMsgSecCheck(reqData: ReqWxMsgSecCheck) {
        let url = mGameSetting.serverUrl + `/wechatgame/msg_sec_check?gameCode=${mGameSetting.gameCode}`;
        let result = await HttpRequest.requestObject(url, { method: "POST", data: reqData }) as MResponse<RspWxSecCheck>;
        if (result?.code == 0) {
            return result.data;
        } else {
            mLogger.error(result);
            return null;
        }
    }

    /** 微信小游戏图片检测 */
    public static async wxMediaSecCheck(reqData: ReqWxMediaSecCheck) {
        let url = mGameSetting.serverUrl + `/wechatgame/media_sec_check?gameCode=${mGameSetting.gameCode}`;
        let result = await HttpRequest.requestObject(url, { method: "POST", data: reqData }) as MResponse<RspWxSecCheck>;
        if (result?.code == 0) {
            return result.data;
        } else {
            mLogger.error(result);
            return null;
        }
    }

    /** 
     * 微信小游戏登录
     * @param code wx.login获取的code
     */
    public static async wxLogin(code: string) {
        let url = mGameSetting.serverUrl + `/wechatgame/login?gameCode=${mGameSetting.gameCode}&code=${code}`;
        let result = await HttpRequest.requestObject(url, { method: "POST" }) as MResponse<RsqWxLogin>;
        if (result?.code == 0) {
            return result.data;
        } else {
            mLogger.error(result);
            return null;
        }
    }

    /** 
     * 微信小游戏解密敏感数据
     */
    public static async wxDecryptBizdata(reqData: ReqWXBizData) {
        let url = mGameSetting.serverUrl + `/wechatgame/decrypt_bizdata?gameCode=${mGameSetting.gameCode}`;
        let result = await HttpRequest.requestObject(url, { method: "POST", data: reqData }) as MResponse<RspWXBizData>;
        if (result?.code == 0) {
            return result.data;
        } else {
            mLogger.error(result);
            return null;
        }
    }

    //#endregion


    //#region 抖音小游戏接口

    /** 
     * 抖音小游戏添加场景值检测
     */
    public static async dyAddSceneCheck(reqData: ReqDYSceneCheck) {
        let url = mGameSetting.serverUrl + `/douyingame/${mGameSetting.gameCode}/add_scene_check`;
        let result = await HttpRequest.requestObject(url, { method: "POST", data: reqData }) as MResponse;
        if (result?.code == 0) {
            return true;
        } else {
            mLogger.error(result);
            return false;
        }
    }

    public static async dyDelSceneCheck(openId: string) {
        let url = mGameSetting.serverUrl + `/douyingame/${mGameSetting.gameCode}/del_scene_check?openId=${openId}`;
        let result = await HttpRequest.requestObject(url, { method: "POST" }) as MResponse;
        if (result?.code == 0) {
            return true;
        } else {
            mLogger.error(result);
            return false;
        }
    }

    //#endregion



}