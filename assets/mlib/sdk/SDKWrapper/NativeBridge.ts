import { native } from "cc";
import { JSB } from "cc/env";
import { SDKListener } from "./SDKListener";

type StringCallback = (args: string) => void;

/** 常用的原生和JS交互的Key */
export enum ENativeBridgeKey {

    /** 登录 */
    Login = "login",
    /** 横幅广告 */
    ShowBanner = "showBanner",
    /** 插屏广告 */
    ShowInterstitial = "showInterstitial",
    /** 激励视频广告 */
    ShowRewardedVideo = "showRewardedVideo",
    /** 分享 */
    Share = "share",
    /** 请求商品信息 */
    ReqProductDetails = "reqProductDetails",
    /** 发起内购 */
    RequestPay = "requestPay",
    /** 恢复内购(补单或订阅) */
    RestorePay = "restorePay",
    /** 敏感词检测 */
    CheckMsgSec = "checkMsgSec",
    /** 敏感图片检测 */
    CheckImageSec = "checkImageSec",
    /** 事件上报 */
    ReportEvent = "reportEvent",
    /** 原生平台基础事件 */
    NativeBaseEvent = "nativeBaseEvent",
    /** 震动 */
    Vibrate = "vibrate",

    //#region 国内原生渠道常用


    /** 展示隐私协议 */
    ShowPrivacy = "showPrivacy",
    /** 实名认证 */
    RealNameCertification = "realNameCertification",

    //#region 
}


/** 处理与SDK的交互 */
export class NativeBridge {

    /** 脚本加载时自动执行 */
    protected static init = (() => {
        if (!JSB) return;
        if (!native?.bridge) return;
        native.bridge.onNative = NativeBridge.onNativeCall.bind(NativeBridge);
    })();

    /** 原生层发回来的消息 */
    private static onNativeCall(key: string, args: string) {
        mLogger.debug(`onNativeCall Key=${key} args=${args}`);
        let func: StringCallback = SDKListener[key];
        if (typeof func === "function") {
            func.call(SDKListener, args);
        } else {
            SDKListener.onCallback(key, args);
        }
    }

    /** 发送消息给原生层 */
    public static sendToNative(key: ENativeBridgeKey, args?: string | object);
    public static sendToNative(key: string, args?: string | object);
    public static sendToNative(key: string | number, args?: string | object) {
        if (!JSB) return;
        let fKey: string;
        let fArgs: string;
        fKey = typeof key === "number" ? ENativeBridgeKey[key] : key;
        if (!args) fArgs = "";
        else fArgs = typeof args === "object" ? JSON.stringify(args) : args;
        mLogger.debug(`sendToNative Key=${fKey} args=${fArgs}`);
        native?.bridge?.sendToNative(fKey, fArgs);
    }
}






