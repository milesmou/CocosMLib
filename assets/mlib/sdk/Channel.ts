import { _decorator, sys } from 'cc';
import { StroageValue } from '../module/stroage/StroageValue';
import { MCloudDataSDK } from '../sdk/MCloudDataSDK';
import { Utils } from '../utils/Utils';
import { EIAPResult, ELoginResult, ENativeBridgeKey, EReawrdedAdResult, GameDataArgs, LoginArgs, RequestIAPArgs, SDKCallback, ShowRewardedAdArgs } from './MSDKWrapper';
const { ccclass } = _decorator;

@ccclass("Channel")
export class Channel {

    /** 用户id */
    public userId: string;


    /** 环境 开发版 体验版 正式版*/
    public env: 'develop' | 'trial' | 'release';

    /** 设备震动开关 */
    public vibrateEnable = new StroageValue("VibrateEnable", true);

    /** 初始化SDK */
    public initSDK() {
        this.initEvent();
        this.reportEvent("initSDK")
    }

    /** 初始化SDK相关的事件 */
    public initEvent() {
    }

    /** 初始化内购 */
    public initIAP() {
        SDKCallback.initInAppPurchase && SDKCallback.initInAppPurchase();
    }

    /** 登录 */
    public login(args: LoginArgs) {
        let userId = sys.localStorage.getItem("userId");
        if (!userId) {
            userId = Utils.genUUID();
            sys.localStorage.setItem("userId", userId);
        }
        SDKCallback.login = args;
        onNativeCall(ENativeBridgeKey.Login, ELoginResult.Success.toString(), userId)
    }

    /** 获取玩家存档 */
    public getGameData(args: GameDataArgs) {
        logger.debug("getGameData", args.userId);
        SDKCallback.getGameData = args;
        MCloudDataSDK.getGameData(args.userId).then(v => {
            if (v) {
                args.success && args.success(v);
            } else {
                args.fail && args.fail();
            }
        });
    }

    /** 上传玩家存档 */
    public uploadGameData(args: GameDataArgs) {
        logger.debug("uploadGameData", args.userId);
        SDKCallback.uploadGameData = args;
        MCloudDataSDK.saveGameData(args.userId, args.userGameData).then(v => {
            if (v) {
                args.success && args.success(v);
            } else {
                args.fail && args.fail();
            }
        });
    }

    /** 展示激励视频广告 */
    public showRewardedAd(args: ShowRewardedAdArgs) {
        SDKCallback.rewardedAd = args;
        SDKCallback.onStartRewardedAd && SDKCallback.onStartRewardedAd(args.extParam);
        onNativeCall(ENativeBridgeKey.ShowRewardedVideo, EReawrdedAdResult.Show.toString());//测试直接成功
        onNativeCall(ENativeBridgeKey.ShowRewardedVideo, EReawrdedAdResult.Success.toString());//测试直接成功
    }

    /** 展示插屏广告 */
    public showInterstitial(...args: any[]) {

    }

    /** 展示横幅广告 */
    public showbanner(...args: any[]) {

    }

    /** 分享 */
    public share(...args: any[]) {

    }

    /** 获取所有商品的详情信息 商品id之间用|隔开 */
    public reqProductDetails(productIds: string) {
        onNativeCall(ENativeBridgeKey.ReqProductDetails, EIAPResult.ProductDetail.toString(), "default")//测试直接成功
    }

    /** 发起内购 */
    public requestIAP(args: RequestIAPArgs) {
        SDKCallback.onStartInAppPurchase && SDKCallback.onStartInAppPurchase(args.productId);
        setTimeout(() => {
            onNativeCall(ENativeBridgeKey.RequestIAP, EIAPResult.Success.toString(), args.productId)//测试直接成功
        }, 1000);
    }

    /** 恢复内购(订阅或漏单) */
    public restoreIAP() {

    }

    /** 上报事件 (若需针对不同打点平台特殊处理,可在参数中添加_tag字段)*/
    public reportEvent(eventName: string, args?: { [key: string]: any }) {
        if (args && args["_tag"]) return;//忽略需要特殊处理的事件
        let paramStr = args ? Object.values(args).join("|") : "";
        MCloudDataSDK.reportEvent(eventName, 0, paramStr);
    }

    /** 上报事件 每天一次(本地存档卸载失效)*/
    public reportEventDaily(eventName: string, args?: { [key: string]: any }) {
        if (Channel.isValidDailyEvent(eventName)) this.reportEvent(eventName, args);
    }

    /** 上报事件 终生一次(本地存档卸载失效)*/
    public reportEventLifetime(eventName: string, args?: { [key: string]: any }) {
        if (Channel.isValidLifetimeEvent(eventName)) this.reportEvent(eventName, args);
    }

    /** 上报数值累加事件 */
    public reportSumEvent(eventName: string, num: number, args?: { [key: string]: any }) {
        let paramStr = args ? Object.values(args).join("|") : "";
        MCloudDataSDK.reportEvent(eventName, num, paramStr);
    }

    /** 使设备发生震动 */
    public vibrate(duration: "short" | "medium" | "long" = "short") {

    }

    /** 额外的方法 用于一些特殊的处理 */
    public extraMethod(key: string, ...args: any[]): void {

    }

    public static getEventParamJsonStr(args?: { [key: string]: any }) {
        if (!args) return "";
        return JSON.stringify(args);
    }

    public static isValidDailyEvent(key: string) {
        let today = Utils.getDate();
        let i = parseFloat(sys.localStorage.getItem(key));
        if (isNaN(i) || i < today) {
            sys.localStorage.setItem(key, today.toString())
            return true;
        }
        return false;
    }

    public static isValidLifetimeEvent(key: string) {
        let today = Utils.getDate();
        let i = parseFloat(sys.localStorage.getItem(key));
        if (isNaN(i)) {
            sys.localStorage.setItem(key, today.toString())
            return true;
        }
        return false;
    }
}
