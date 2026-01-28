import { game, Game } from "cc";
import { GetGameDataResult, LoginResult, PayResult, RewardedVideo, SDKCallback, SDKTemp } from "./SDKCallback";

game.on(Game.EVENT_RESTART, () => {
    SDKCallback.callback.clear();
});

/** 
 * SDK的回调处理
 */
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
                SDKTemp.saveGameDataParams?.success?.();
            } else {
                SDKTemp.saveGameDataParams?.fail?.();
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
        SDKCallback.onInitPay?.();
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
                    SDKTemp.rewardedVideoParams?.success?.(adId);
                    SDKCallback.rewardedVideoListener?.onRewardedVideSuccess?.(adId);
                    break;
                case 1:
                    SDKTemp.rewardedVideoParams?.fail?.(adId);
                    SDKCallback.rewardedVideoListener?.onRewardedVideFail?.(adId);
                    break;
                case 2:
                    SDKCallback.rewardedVideoListener?.onRewardedVideError?.(adId, obj.msg);
                    break;
                case 3:
                    SDKCallback.rewardedVideoListener?.onRewardedVideoStart?.(adId);
                    break;
                case 4:
                    SDKCallback.rewardedVideoListener?.onRewardedVideShow?.(adId);
                    break;
                case 5:
                    if (SDKCallback.rewardedVideoListener?.onRewardedVideClose)
                        SDKCallback.rewardedVideoListener.onRewardedVideClose(adId);
                    break;
                case 6:
                    SDKCallback.rewardedVideoListener?.onRewardedVideClick?.(adId);
                    break;
                case 7:
                    SDKCallback.rewardedVideoListener?.onRewardedVideRevenue?.(adId, obj.revenue);
                    break;

            }
        } catch (error) {
            console.error(error);
        }
    }
}