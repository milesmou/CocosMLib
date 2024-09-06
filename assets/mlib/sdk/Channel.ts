import { _decorator, sys } from 'cc';
import { StroageValue } from '../module/stroage/StroageValue';
import { MCloudDataSDK } from '../sdk/MCloudDataSDK';
import { Utils } from '../utils/Utils';
import { IReportEvent } from './IReportEvent';
import { EIAPResult, ELoginResult, ENativeBridgeKey, EReawrdedAdResult, GameDataArgs, LoginArgs, MSDKWrapper, RequestIAPArgs, SDKCallback, ShowRewardedAdArgs } from './MSDKWrapper';
const { ccclass } = _decorator;

@ccclass("Channel")
export class Channel {

    /** 用户id */
    public userId: string;

    /** 设备震动开关 */
    public vibrateEnable = new StroageValue("VibrateEnable", true);

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
    public getGameData(args: GameDataArgs) {
        mLogger.debug("getGameData", args.userId);
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
        mLogger.debug("uploadGameData", args.userId);
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
    public reportEvent(event: IReportEvent, args?: { [key: string]: any }) {
        if (!event.enable || !event.name) return;
        if (event.tag) return;//忽略需要特殊处理的事件
        let paramStr = args ? Object.values(args).join("|") : "";
        MCloudDataSDK.reportEvent(event.name, paramStr);
    }

    /** 上报事件 每天一次(本地存档卸载失效)*/
    public reportEventDaily(event: IReportEvent, args?: { [key: string]: any }) {
        if (Channel.isValidDailyEvent(event)) this.reportEvent(event, args,);
    }

    /** 上报事件 终生一次(本地存档卸载失效)*/
    public reportEventLifetime(event: IReportEvent, args?: { [key: string]: any }) {
        if (Channel.isValidLifetimeEvent(event)) this.reportEvent(event, args);
    }

    /** 上报数值累加事件(仅用于自己的打点系统) */
    public reportSumEvent(event: IReportEvent, num: number, args?: { [key: string]: any }) {
        let paramStr = args ? Object.values(args).join("|") : "";
        MCloudDataSDK.reportEvent(event.name, paramStr, num);
    }

    /** 使设备发生震动 */
    public vibrate(duration?: "short" | "medium" | "long") {

    }

    /** 额外的方法 用于一些特殊的处理 */
    public extraMethod(arg0?: string, arg1?: string, arg2?: string, arg3?: string): void {

    }

    protected static getEventName(event: IReportEvent) {
        let key = event.name
        let today = Utils.getDate();
        let i = parseFloat(sys.localStorage.getItem(key));
        if (isNaN(i) || i < today) {
            sys.localStorage.setItem(key, today.toString())
            return true;
        }
        return false;
    }

    protected static isValidDailyEvent(event: IReportEvent) {
        let key = event.name + event.tag ? `_${event.tag}` : "";
        let today = Utils.getDate();
        let i = parseFloat(sys.localStorage.getItem(key));
        if (isNaN(i) || i < today) {
            sys.localStorage.setItem(key, today.toString())
            return true;
        }
        return false;
    }

    protected static isValidLifetimeEvent(event: IReportEvent) {
        let key = event.name + event.tag ? `_${event.tag}` : "";
        let today = Utils.getDate();
        let i = parseFloat(sys.localStorage.getItem(key));
        if (isNaN(i)) {
            sys.localStorage.setItem(key, today.toString())
            return true;
        }
        return false;
    }


}
