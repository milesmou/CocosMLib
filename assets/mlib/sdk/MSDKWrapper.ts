import { native } from "cc";
import { JSB } from "cc/env";
import { RspPlayerGameData } from "./MResponse";

/** 原生和JS交互的Key */
export enum ENativeBridgeKey {
    /** 登录 */
    Login,
    /** 横幅广告 */
    ShowBanner,
    /** 插屏广告 */
    ShowInterstitial,
    /** 激励视频广告 */
    ShowRewardedVideo,
    /** 分享 */
    Share,
    /** 请求商品信息 */
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
    public static getGameData: GetGameDataArgs;
    /** 上传玩家存档回调 */
    public static uploadGameData: SaveGameDataArgs;
    /** 准备请求激励视频回调 */
    public static onStartRewardedAd: StringCallback;
    /** 本次激励视频回调 */
    public static rewardedAd: ShowRewardedAdArgs;
    /** 默认激励视频回调,每次都会调用 */
    public static rewardedAdDefault: ShowRewardedAdArgs;
    /** 初始化内购回调 */
    public static initInAppPurchase: Action;
    /** 准备发起内购回调 */
    public static onStartInAppPurchase: StringCallback;
    /** 内购结果回调 */
    public static inAppPurchase: (code: EIAPResult, arg: string) => void;
}

/** 与原生交互时的参数分隔符 */
const ParamSeparator = "<-_->";

/** 处理与SDK的交互 */
export class MSDKWrapper {

    /** 脚本加载时自动执行 */
    private static init = (() => {
        if (!JSB) return;
        native.bridge.onNative = (key: string, args?: string) => {
            let [arg1, arg2, arg3, arg4] = args.split(ParamSeparator);
            this.onNativeCall(key, arg1, arg2, arg3, arg4);
        }
    })();

    /** 非原生环境触发回调 */
    public static call(key: ENativeBridgeKey, arg1?: string, arg2?: string, arg3?: string, arg4?: string) {
        this.onNativeCall(ENativeBridgeKey[key], arg1, arg2, arg3, arg4);
    }

    /** 原生层发回来的消息 strKey使用ENativeBridgeKey中的值 */
    private static onNativeCall(strKey: string, arg1?: string, arg2?: string, arg3?: string, arg4?: string) {
        let key = ENativeBridgeKey[strKey];
        switch (key) {
            case ENativeBridgeKey.Login:
                this.onLogin(arg1, arg2, arg3);
                break;
            case ENativeBridgeKey.RequestIAP:
                this.onInAppPurchase(arg1, arg2);
                break;
            case ENativeBridgeKey.ShowRewardedVideo:
                this.onShowRewardedAd(arg1);
                break;
        }
    }

    /** 发送消息给原生层 key使用ENativeBridgeKey中的值*/
    public static sendToNative(key: ENativeBridgeKey, arg1 = "null", arg2 = "null", arg3 = "null", arg4 = "null") {
        if (!JSB) return;
        let args = [arg1, arg2, arg3, arg4].join(ParamSeparator);
        native.bridge.sendToNative(ENativeBridgeKey[key], args);
    }


    /** 登录回调处理 */
    private static onLogin(strCode: string, arg1: string, arg2: string) {
        let code: ELoginResult = parseInt(strCode);
        switch (code) {
            case ELoginResult.Success:
                SDKCallback.login?.success && SDKCallback.login.success({ id: arg1, name: arg2 });
                break;
            case ELoginResult.Fail:
                SDKCallback.login?.fail && SDKCallback.login.fail(arg1);
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

type StringCallback = (str?: string) => void;

/** 用户信息 */
export interface UserInfo {
    /** 用户id */
    id: string;
    /** 用户名字 */
    name?: string;
}

/** 发起登录请求参数 */
export interface LoginArgs {
    /** 登录成功 */
    success?: (user: UserInfo) => void;
    /** 登录失败 */
    fail?: (errMsg: string) => void;
    /** 扩展参数 */
    extParam?: string;
}

/** 下载存档参数 */
export interface GetGameDataArgs {
    /** 用户id */
    userId: string;
    /** 成功 */
    success: (args: RspPlayerGameData) => void;
    /** 失败 */
    fail?: (errMsg?: string) => void;
    /** 扩展参数 */
    extParam?: string;
}

/** 上传存档参数 */
export interface SaveGameDataArgs {
    /** 用户id */
    userId: string;
    /** 存档数据  */
    gameData: string;
    /** 成功 */
    success?: () => void;
    /** 失败 */
    fail?: (errMsg?: string) => void;
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
    extParam?: any;
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