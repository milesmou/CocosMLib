import { native } from "cc";
import { JSB } from "cc/env";
import { SDKListener } from "./SDKListener";

type StringCallback = (args: string) => void;

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
        native.bridge.sendToNative(fKey, fArgs);
    }

}






