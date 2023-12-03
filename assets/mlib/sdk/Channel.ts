import { MLogger } from '../module/logger/MLogger';
import { MCloudDataSDK } from '../sdk/MCloudDataSDK';
import { EIAPResult, ELoginResult, EReawrdedAdResult, GameDataArgs, LoginArgs, MSDKWrapper, RequestIAPArgs, SDKCallback, ShowRewardedAdArgs } from './MSDKWrapper';
import { Utils } from '../utils/Utils';
import { ShopUtil } from '../../scripts/base/ShopUtil';
import { sys } from 'cc';

export class Channel {

    /** 游戏名_渠道名 */
    public gameCode: string;

    /** 用户id */
    public userId: string;

    /** 环境 开发版 体验版 正式版*/
    public env: 'develop' | 'trial' | 'release';

    /** 用户数据云存档保存Key */
    public userDataCloudSaveKey = "UserDataSaveKey";

    /** 初始化SDK */
    public initSDK() {
        this.initEvent();
        this.reportEvent("initSDK")
    }

    /** 初始化SDK相关的事件 */
    initEvent() {
        MCloudDataSDK.GameCode = this.gameCode;
    }

    /** 初始化内购 */
    initIAP() {
        ShopUtil.initPurchase();
    }

    /** 登录 */
    login(args: LoginArgs) {
        let userId = sys.localStorage.getItem("userId");
        if (!userId) {
            userId = Utils.genUUID();
            sys.localStorage.setItem("userId", userId);
        }
        SDKCallback.login = args;
        MSDKWrapper.onLogin(ELoginResult.Success + "|" + userId)
    }

    /** 获取玩家存档 */
    getGameData(args: GameDataArgs) {
        MLogger.debug("getGameData", args.userId);
        SDKCallback.getGameData = args;
        MCloudDataSDK.getGameData(args.userId, this.userDataCloudSaveKey).then(v => {
            if (v) {
                args.success && args.success(v);
            } else {
                args.fail && args.fail();
            }
        });
    }

    /** 上传玩家存档 */
    uploadGameData(args: GameDataArgs) {
        MLogger.debug("uploadGameData", args.userId);
        SDKCallback.uploadGameData = args;
        MCloudDataSDK.saveGameData(args.userId, this.userDataCloudSaveKey, args.userGameData).then(v => {
            if (v) {
                args.success && args.success(v);
            } else {
                args.fail && args.fail();
            }
        });
    }

    /** 设置默认激励视频回调 */
    public setRewardVideoDefaultCallback(args: ShowRewardedAdArgs) {
        SDKCallback.rewardedAdDefault = args;
    }

    /** 展示激励视频广告 */
    showRewardedAd(args: ShowRewardedAdArgs) {
        SDKCallback.rewardedAd = args;
        SDKCallback.onStartRewardedAd && SDKCallback.onStartRewardedAd(args.extParam);
        MSDKWrapper.onShowRewardedAd(EReawrdedAdResult.Success.toString());//测试直接成功
    }

    /** 展示插屏广告 */
    showInterstitial(...args: any[]) {

    }

    /** 展示横幅广告 */
    showbanner(...args: any[]) {

    }

    /** 分享 */
    share(...args: any[]) {

    }

    /** 获取所有商品的详情信息 商品id之间用|隔开 */
    reqProductDetails(productIds: string) {
        MSDKWrapper.onInAppPurchase(EIAPResult.ProductDetail + "|default");//测试直接成功
    }

    /** 发起内购 */
    requestIAP(args: RequestIAPArgs) {
        SDKCallback.onStartInAppPurchase && SDKCallback.onStartInAppPurchase(args.productId);
        setTimeout(() => {
            MSDKWrapper.onInAppPurchase(EIAPResult.Success + "|" + args.productId);//测试直接成功
        }, 1000);
    }

    /** 恢复内购(订阅或漏单) */
    restoreIAP() {

    }

    /** 上报事件 (若需针对不同打点平台特殊处理,可在参数中添加_tag字段)*/
    reportEvent(eventName: string, args?: { [key: string]: any }) {
        if (args && args["_tag"]) return;//忽略需要特殊处理的事件
        let paramStr = args ? Object.values(args).join("|") : "";
        MCloudDataSDK.reportEvent(eventName, 0, paramStr);
    }

    /** 上报事件 每天一次(本地存档卸载失效)*/
    reportEventDaily(eventName: string, args?: { [key: string]: any }) {
        if (Channel.isValidDailyEvent(eventName)) this.reportEvent(eventName, args);
    }

    /** 上报事件 终生一次(本地存档卸载失效)*/
    reportEventLifetime(eventName: string, args?: { [key: string]: any }) {
        if (Channel.isValidLifetimeEvent(eventName)) this.reportEvent(eventName, args);
    }

    /** 上报数值累加事件 */
    reportSumEvent(eventName: string, num: number, args?: { [key: string]: any }) {
        let paramStr = args ? Object.values(args).join("|") : "";
        MCloudDataSDK.reportEvent(eventName, num, paramStr);
    }

    /** 额外的方法 用于一些特殊的处理 */
    extraMethod(key: string, ...args: any[]): void {

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
