import { _decorator, sys } from 'cc';
import { StroageMap } from '../module/stroage/StroageMap';
import { StroageValue } from '../module/stroage/StroageValue';
import { MCloudDataSDK } from '../sdk/MCloudDataSDK';
import { Utils } from '../utils/Utils';
import { IReportEvent } from './IReportEvent';
import { EIAPResult, ELoginResult, ENativeBridgeKey, EReawrdedAdResult, GetGameDataArgs, LoginArgs, MSDKWrapper, RequestIAPArgs, SaveGameDataArgs, SDKCallback, ShowRewardedAdArgs } from './MSDKWrapper';
const { ccclass } = _decorator;

@ccclass("Channel")
export class Channel {

    /** 用户id */
    public userId: string;

    /** 设备震动开关 */
    public vibrateEnable = new StroageValue(mGameSetting.gameName + "_VibrateEnable", true);


    /** 初始化SDK */
    public initSDK() {
        this.initEvent();
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
        MSDKWrapper.call(ENativeBridgeKey.Login, ELoginResult.Success.toString(), userId);
    }

    /** 获取玩家存档 */
    public getGameData(args: GetGameDataArgs) {
        mLogger.debug("getGameData", args.userId);
        SDKCallback.getGameData = args;
        MCloudDataSDK.getPlayerGameData(args.userId).then(v => {
            if (v) {
                args.success && args.success(v);
            } else {
                args.fail && args.fail();
            }
        });
    }

    /** 上传玩家存档 */
    public uploadGameData(args: SaveGameDataArgs) {
        mLogger.debug("uploadGameData", args.userId);
        SDKCallback.uploadGameData = args;
        MCloudDataSDK.savePlayerGameData(args.userId, args.gameData).then(v => {
            if (v) {
                args.success && args.success();
            } else {
                args.fail && args.fail();
            }
        });
    }

    /** 展示激励视频广告 */
    public showRewardedAd(args: ShowRewardedAdArgs) {
        SDKCallback.rewardedAd = args;
        SDKCallback.onStartRewardedAd && SDKCallback.onStartRewardedAd(args.extParam);
        MSDKWrapper.call(ENativeBridgeKey.ShowRewardedVideo, EReawrdedAdResult.Show.toString());//测试直接成功
        MSDKWrapper.call(ENativeBridgeKey.ShowRewardedVideo, EReawrdedAdResult.Success.toString());//测试直接成功
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
        MSDKWrapper.call(ENativeBridgeKey.ReqProductDetails, EIAPResult.ProductDetail.toString(), "default")//测试直接成功
    }

    /** 发起内购 */
    public requestIAP(args: RequestIAPArgs) {
        SDKCallback.onStartInAppPurchase && SDKCallback.onStartInAppPurchase(args.productId);
        MSDKWrapper.call(ENativeBridgeKey.RequestIAP, EIAPResult.Success.toString(), args.productId)//测试直接成功
    }

    /** 恢复内购(订阅或漏单) */
    public restoreIAP() {

    }

    /** 
     * 上报事件 
     * @param event 事件对象
     * @param args 事件参数
    */
    public reportEvent(event: IReportEvent, args?: { [key: string]: any }, tag?: string) {
        if (!event.enable || !event.name) return;
        let paramStr = args ? Object.values(args).join("|") : "";
        MCloudDataSDK.reportEvent(event.name, paramStr);
    }

    /** 上报事件 每天一次(本地存档卸载失效)*/
    public reportEventDaily(event: IReportEvent, args?: { [key: string]: any }, tag?: string) {
        if (this.isValidDailyEvent(event, tag)) this.reportEvent(event, args, tag);
    }

    /** 上报事件 终生一次(本地存档卸载失效)*/
    public reportEventLifetime(event: IReportEvent, args?: { [key: string]: any }, tag?: string) {
        if (this.isValidLifetimeEvent(event, tag)) this.reportEvent(event, args, tag);
    }

    /** 上报数值累加事件(仅用于自己的打点系统) */
    public reportSumEvent(event: IReportEvent, num: number, args?: { [key: string]: any }) {
        let paramStr = args ? Object.values(args).join("|") : "";
        MCloudDataSDK.reportEvent(event.name, paramStr, num);
    }

    /** 使设备发生震动 */
    public vibrate(duration?: "short" | "long") {

    }

    /**
    * 敏感词检测
    * @param content 待检测内容
    * @param callback 回调
    */
    public checkMessage(content: string, callback: (isPass: boolean) => void) {

    }


    /** 额外的方法 用于一些特殊的处理 */
    public extraMethod<T1 = any, T2 = any, T3 = any, T4 = any>(key?: string, arg1?: T1, arg2?: T2, arg3?: T3, arg4?: T4): void {

    }

    private eventCache = new StroageMap(mGameSetting.gameName + "_ReportEvent", 0, true);

    protected isValidDailyEvent(event: IReportEvent, tag?: string) {
        let key = event.name + (tag ? `_${tag}` : "");
        let today = Utils.getDate();
        let i = this.eventCache.get(key);
        if (i < today) {
            this.eventCache.set(key, today)
            return true;
        }
        return false;
    }

    protected isValidLifetimeEvent(event: IReportEvent, tag?: string) {
        let key = event.name + (tag ? `_${tag}` : "");
        let today = Utils.getDate();
        let i = this.eventCache.get(key);
        if (!i) {
            this.eventCache.set(key, today);
            return true;
        }
        return false;
    }


}


