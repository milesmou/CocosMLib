import { native } from "cc";
import { JSB } from "cc/env";

export enum ECallNativeKey {
    /** 登录 */
    Login,
    /** 商品详情 */
    ReqProductDetails,
    /** 发起内购 */
    RequestIAP,
    /** 恢复内购(补单或订阅) */
    RestoreIAP,
    /** 激励视频广告 */
    ShowRewardedAd,
    /** 事件上报 */
    ReportEvent,
    /** 获取用户来源 */
    ReqUserSource,
}

export enum ELoginResult {
    /** 登录成功 */
    Success,
    /** 登录失败 */
    Fail
}

export enum EIAPResult {
    /** 支付环境错误 */
    NoEnv,
    /** 商品不存在 */
    NoProduct,
    /** 支付成功 */
    Success,
    /** 延时到账 补单成功 */
    DelaySuccess,
    /** 支付失败 */
    Fail,
    /** 订单验证失败 可能延时到账 */
    VerifyFail,
    /** 获取商品详情 */
    ProductDetail,
}

export enum EReawrdedAdResult {
    /** 播放成功且获取奖励 */
    Success,
    /** 放成功但未获取奖励 */
    Fail,
    /** 开始播放广告 */
    Show,
    /** 广告关闭 */
    Close,
    /** 点击广告 */
    Click,
    /** 广告播放失败 */
    Error,
}

/** SDK相关的所有回调 */
export class SDKCallback {
    /** 登录回调 */
    public static login: LoginArgs;
    /** 获取玩家存档回调 */
    public static getGameData: GameDataArgs;
    /** 上传玩家存档回调 */
    public static uploadGameData: GameDataArgs;
    /** 准备请求激励视频回调 */
    public static onStartRewardedAd: StringCallback;
    /** 本次激励视频回调 */
    public static rewardedAd: ShowRewardedAdArgs;
    /** 默认激励视频回调,每次都会调用 */
    public static rewardedAdDefault: ShowRewardedAdArgs;
    /** 初始化内购 */
    public static initInAppPurchase: NoneCallback;
    /** 准备发起内购回调 */
    public static onStartInAppPurchase: StringCallback;
    /** 内购结果回调 */
    public static inAppPurchase: (code: EIAPResult, arg: string) => void;
    /** 请求用户来源完成回调 */
    public static onUserSource: StringCallback;
}

/** 处理与SDK的交互 */
export class MSDKWrapper {

    private static isInit = false;

    private static init() {
        if (this.isInit) return;
        this.isInit = true;
        native.bridge.onNative = this.onNativeCall.bind(this);
    }

    /** 原生层发回来的消息 key使用NativeKey中的值 */
    private static onNativeCall(key: string, arg: string) {
        let kk = ECallNativeKey[key];
        arg = arg || "";
        switch (kk) {
            case ECallNativeKey.Login:
                this.onLogin(arg);
                break;
            case ECallNativeKey.RequestIAP:
                this.onInAppPurchase(arg);
                break;
            case ECallNativeKey.ShowRewardedAd:
                this.onShowRewardedAd(arg);
                break;
            case ECallNativeKey.ReqUserSource:
                SDKCallback.onUserSource(arg);
                break;
        }
    }

    /** 发送消息给原生层 key使用NativeKey中的值*/
    public static sendToNative(key: ECallNativeKey, arg?: string) {
        this.init();
        // native.bridge.sendToNative(arg0, arg1);
        arg = arg || ""
        if (JSB) {
            native.bridge.sendToNative(ECallNativeKey[key], arg);
        }
    }


    /** 登录回调处理 */
    public static onLogin(arg: string) {
        let arr = arg.split("|");
        let code: ELoginResult = parseInt(arr[0]);
        switch (code) {
            case ELoginResult.Success:
                SDKCallback.login?.success && SDKCallback.login.success(arr[1]);
                break;
            case ELoginResult.Fail:
                SDKCallback.login?.fail && SDKCallback.login.fail(arr[1]);
                break;
        }
    }

    /** 内购回调 */
    public static onInAppPurchase(arg: string) {
        let arr = arg.split("|");
        let code: EIAPResult = parseInt(arr[0]);
        SDKCallback.inAppPurchase(code, arr[1]);
    }

    /** 看视频广告回调 */
    public static onShowRewardedAd(arg: string) {
        let code = parseInt(arg);
        let key = SDKCallback.rewardedAd?.extParam;
        switch (code) {
            case EReawrdedAdResult.Success:
                SDKCallback.rewardedAd?.success && SDKCallback.rewardedAd.success(key);
                SDKCallback.rewardedAdDefault?.success && SDKCallback.rewardedAdDefault.success(key);
                break;
            case EReawrdedAdResult.Fail:
                SDKCallback.rewardedAd?.fail && SDKCallback.rewardedAd.fail(key);
                SDKCallback.rewardedAdDefault?.fail && SDKCallback.rewardedAdDefault.fail(key);
                break;
            case EReawrdedAdResult.Show:
                SDKCallback.rewardedAd?.show && SDKCallback.rewardedAd.show(key);
                SDKCallback.rewardedAdDefault?.show && SDKCallback.rewardedAdDefault.show(key);
                break;
            case EReawrdedAdResult.Close:
                SDKCallback.rewardedAd?.close && SDKCallback.rewardedAd.close(key);
                SDKCallback.rewardedAdDefault?.close && SDKCallback.rewardedAdDefault.close(key);
                break;
            case EReawrdedAdResult.Click:
                SDKCallback.rewardedAd?.click && SDKCallback.rewardedAd.click(key);
                SDKCallback.rewardedAdDefault?.click && SDKCallback.rewardedAdDefault.click(key);
                break;
            case EReawrdedAdResult.Error:
                SDKCallback.rewardedAd?.error && SDKCallback.rewardedAd.error(key);
                SDKCallback.rewardedAdDefault?.error && SDKCallback.rewardedAdDefault.error(key);
                break;
        }
    }

}

type NoneCallback = () => void;
type StringCallback = (str?: string) => void;
type NumberCallback = (num?: number) => void;
type ObjectCallback = (obj?: object) => void;

export class LoginArgs {
    success?: StringCallback;
    fail?: StringCallback;
    extParam?: string;
}

export class GameDataArgs {
    /** 用户id */
    userId: string;
    /** 成功 */
    success?: ObjectCallback;
    /** 失败 */
    fail?: NoneCallback;
    /** 存档数据 上传专用 */
    userGameData?: string;
    extParam?: string;
}

export class ShowRewardedAdArgs {
    success: StringCallback;
    fail?: StringCallback;
    show?: StringCallback;
    close?: StringCallback;
    click?: StringCallback;
    error?: StringCallback;
    extParam?: string;
}

export class RequestIAPArgs {
    productId: string;
    price?: number;
    name?: string;
    desc?: string;
    isSub?: boolean;
    extParam?: string;
}

