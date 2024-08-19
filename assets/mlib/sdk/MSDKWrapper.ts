import { native, sys } from "cc";
import { JSB } from "cc/env";
import { invokeOnLoad } from "../module/core/Decorator";

/** 原生和JS交互的Key */
export enum ENativeBridgeKey {
    /** 登录 */
    Login = 1,
    /** 横幅广告 */
    ShowBanner,
    /** 插屏广告 */
    ShowInterstitial,
    /** 激励视频广告 */
    ShowRewardedVideo,
    /** 分享 */
    Share,
    /** 商品详情 */
    ReqProductDetails,
    /** 发起内购 */
    RequestIAP,
    /** 恢复内购(补单或订阅) */
    RestoreIAP,
    /** 事件上报 */
    ReportEvent,
    /** 震动 */
    Vibrate,
    /** 执行额外的方法 */
    ExtraMethod,
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
}

/** 处理与SDK的交互 */
export class MSDKWrapper {

    @invokeOnLoad
    private static init() {
        globalThis.onNativeCall = this.onNativeCall.bind(this);
    }

    /** 原生层发回来的消息 key使用ENativeBridgeKey中的值 */
    private static onNativeCall(key: ENativeBridgeKey, arg0?: string, arg1?: string, arg2?: string, arg3?: string) {
        switch (key) {
            case ENativeBridgeKey.Login:
                this.onLogin(arg0, arg1);
                break;
            case ENativeBridgeKey.RequestIAP:
                this.onInAppPurchase(arg0, arg1);
                break;
            case ENativeBridgeKey.ShowRewardedVideo:
                this.onShowRewardedAd(arg0);
                break;
        }
    }

    /** 发送消息给原生层 key使用ENativeBridgeKey中的值*/
    public static sendToNative(key: ENativeBridgeKey, arg0 = "", arg1 = "", arg2 = "", arg3 = "") {
        if (JSB) {
            if (sys.platform == sys.Platform.ANDROID) {
                native.reflection.callStaticMethod("com/cocos/game/MSDKWrapper", "onJsCall", "(ILjava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", key, arg0, arg1, arg2, arg3);
            } else if (sys.platform == sys.Platform.IOS) {
                native.reflection.callStaticMethod("MSDKWrapper", "onJsCall", key as any, arg0, arg1, arg2, arg3);
            } else {
                console.error("sendToNative 暂未处理的原生平台");
            }
        }
    }


    /** 登录回调处理 */
    private static onLogin(strCode: string, arg: string) {
        let code: ELoginResult = parseInt(strCode);
        switch (code) {
            case ELoginResult.Success:
                SDKCallback.login?.success && SDKCallback.login.success(arg);
                break;
            case ELoginResult.Fail:
                SDKCallback.login?.fail && SDKCallback.login.fail(arg);
                break;
        }
    }

    /** 内购回调 */
    private static onInAppPurchase(strCode: string, arg: string) {
        let code: EIAPResult = parseInt(strCode);
        SDKCallback.inAppPurchase(code, arg);
    }

    /** 看视频广告回调 */
    private static onShowRewardedAd(strCode: string) {
        let code = parseInt(strCode);
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

/** 发起登录请求参数 */
export interface LoginArgs {
    /** 登录成功 */
    success?: StringCallback;
    /** 登录失败 */
    fail?: StringCallback;
    /** 扩展参数 */
    extParam?: string;
}

/** 上传或下载存档参数 */
export interface GameDataArgs {
    /** 用户id */
    userId: string;
    /** 成功 */
    success?: ObjectCallback;
    /** 失败 */
    fail?: NoneCallback;
    /** 存档数据 上传专用 */
    userGameData?: string;
    /** 扩展参数 */
    extParam?: string;
}

/** 发起激励视频请求参数 */
export interface ShowRewardedAdArgs {
    /** 观看视频完成 */
    success: StringCallback;
    /** 未完整观看视频 */
    fail?: StringCallback;
    /** 视频开始展示 */
    show?: StringCallback;
    /** 视频关闭 */
    close?: StringCallback;
    /** 点击视频 */
    click?: StringCallback;
    /** 加载视频失败 */
    error?: StringCallback;
    /** 扩展参数 */
    extParam?: string;
}

/** 发起内购请求参数 */
export interface RequestIAPArgs {
    /** 产品id */
    productId: string;
    /** 价格 */
    price?: number;
    /** 产品名字 */
    name?: string;
    /** 产品描述 */
    desc?: string;
    /** 是否订阅 */
    isSub?: boolean;
    /** 扩展参数 */
    extParam?: string;
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

declare global {
    /** 原生平台向JS层发送消息的回调方法 */
    var onNativeCall: (key: ENativeBridgeKey, arg0?: string, arg1?: string, arg2?: string, arg3?: string) => void;
}