import { game, Game } from "cc";
import { GetGameDataResult, LoginResult, PayResult, SDKCallback, SDKTemp } from "./SDKCallback";

game.on(Game.EVENT_RESTART, () => {
    SDKCallback.callback.clear();
});

/** 原生平台激励视频回调参数 */
interface RewardedVideo extends ResultParam {
    /** 0成功 1失败 2错误 3请求广告 4展示 5关闭 6点击 7产生收益 */
    code: number;
    /** 激励视频收入 */
    revenue?: number;
}


export class SDKListener {

    /** 未独立处理的回调会走到这 */
    public static onCallback(key: string, args: string) {
        mLogger.debug("[SDKListener.onCallback]", key, args);
        if (SDKCallback.callback.has(key)) {
            SDKCallback.callback.get(key).call(this, args);
        } else {
            mLogger.error(`[SDKListener.onCallback] 未注册的回调 ${key}`)
        }
    }

    /** 登录回调处理 */
    public static onLogin(args: string | LoginResult) {
        if (!SDKCallback.onLogin) return;
        try {
            let obj = typeof args === "string" ? JSON.parse(args) : args;
            SDKCallback.onLogin(obj);
        } catch (error) {
            mLogger.error("[SDKListener.onLogin]", error);
        }
    }

    /** 获取玩家存档回调处理 */
    public static onGetGameData(args: string | GetGameDataResult) {
        if (!SDKCallback.onGetGameData) return;
        try {
            let obj = typeof args === "string" ? JSON.parse(args) : args;
            SDKCallback.onGetGameData(obj);
        } catch (error) {
            mLogger.error("[SDKListener.onGetGameData]", error);
        }
    }

    /** 上传玩家存档回调处理 */
    public static onSaveGameData(args: string | ResultParam) {
        if (!SDKTemp.saveGameDataParams) return;
        try {
            let obj: ResultParam = typeof args === "string" ? JSON.parse(args) : args;
            if (obj.code == 0) {
                SDKTemp.saveGameDataParams.success && SDKTemp.saveGameDataParams.success();
            } else {
                SDKTemp.saveGameDataParams.fail && SDKTemp.saveGameDataParams.fail();
            }
        } catch (error) {
            mLogger.error("[SDKListener.onSaveGameData]", error);
        }
    }

    /** 商品信息结果回调 */
    public static onGetProducts(args: string) {
        if (!SDKCallback.payListener?.onGetProducts) return;
        SDKCallback.payListener.onGetProducts(args);
    }

    /** 内购初始化 */
    public static onInitPay() {
        if (!SDKCallback.onInitPay) return;
        SDKCallback.onInitPay();
    }

    /** 内购开始回调 */
    public static onStartPay() {
        if (!SDKTemp.payParams) {
            mLogger.error("SDKTemp.payParams未赋值");
            return;
        }
        if (!SDKCallback.payListener?.onStartPay) return;
        SDKCallback.payListener.onStartPay(SDKTemp.payParams);
    }

    /** 内购结果回调 */
    public static onPay(args: string | PayResult) {
        if (!SDKCallback.payListener?.onPayResult) return;
        try {
            let obj = typeof args === "string" ? JSON.parse(args) : args;
            if (SDKTemp.payParams?.onPayResult) {
                SDKTemp.payParams?.onPayResult(obj);
            }
            SDKCallback.payListener.onPayResult(obj);
        } catch (error) {
            mLogger.error("[SDKListener.onPay]", error);
        }
    }

    /** 激励视频回调 */
    public static onRewardedVideo(args: string | RewardedVideo) {
        if (!SDKTemp.rewardedVideoParams) {
            mLogger.error("SDKTemp.rewardedVideoParams未赋值");
            return;
        }
        try {
            let obj = typeof args === "string" ? JSON.parse(args) : args;
            let adId = SDKTemp.rewardedVideoParams.adId;
            switch (obj.code) {
                case 0:
                    if (SDKTemp.rewardedVideoParams.success)
                        SDKTemp.rewardedVideoParams.success(adId);
                    if (SDKCallback.rewardedVideoListener?.onRewardedVideSuccess)
                        SDKCallback.rewardedVideoListener.onRewardedVideSuccess(adId);
                    break;
                case 1:
                    if (SDKTemp.rewardedVideoParams.fail)
                        SDKTemp.rewardedVideoParams.fail(adId);
                    if (SDKCallback.rewardedVideoListener?.onRewardedVideFail)
                        SDKCallback.rewardedVideoListener.onRewardedVideFail(adId);
                    break;
                case 2:
                    if (SDKCallback.rewardedVideoListener.onRewardedVideError)
                        SDKCallback.rewardedVideoListener.onRewardedVideError(adId, obj.msg);
                    break;
                case 3:
                    if (SDKCallback.rewardedVideoListener?.onRewardedVideoStart)
                        SDKCallback.rewardedVideoListener.onRewardedVideoStart(adId);
                    break;
                case 4:
                    if (SDKCallback.rewardedVideoListener?.onRewardedVideShow)
                        SDKCallback.rewardedVideoListener.onRewardedVideShow(adId);
                    break;
                case 5:
                    if (SDKCallback.rewardedVideoListener?.onRewardedVideClose)
                        SDKCallback.rewardedVideoListener.onRewardedVideClose(adId);
                    break;
                case 6:
                    if (SDKCallback.rewardedVideoListener?.onRewardedVideClick)
                        SDKCallback.rewardedVideoListener.onRewardedVideClick(adId);
                    break;
                case 7:
                    if (SDKCallback.rewardedVideoListener?.onRewardedVideRevenue)
                        SDKCallback.rewardedVideoListener.onRewardedVideRevenue(adId, obj.revenue);
                    break;

            }
        } catch (error) {
            console.error(error);
        }
    }
}