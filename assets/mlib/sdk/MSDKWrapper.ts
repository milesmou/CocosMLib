import { native } from "cc";

export const NativeKey = {
    Login: "Login",
    ShowRewardVideo: "ShowRewardVideo",
    RequestIAP: "RequestIAP",
    ReportEvent: "ReportEvent",
}

export enum EIAPResult {
    Success,
    Fail,
    Cancel,
    VerifyFail
}

/** SDK相关的所有回调 */
export class SDKCallback {
    /** 登录回调 */
    public static login: LoginArgs;
    /** 本次激励视频回调 */
    public static rewardVideo: ShowRewardVideoArgs;
    /** 每次激励视频回调 */
    public static rewardVideoDefault: ShowRewardVideoArgs;
    /** 内购回调 */
    public static inAppPurchase: { success: StringCallback, fail: NumberCallback };

}

/** 处理与SDK的交互 */
export class MSDKWrapper {

    private static isInit = false;

    /** 原生层发回来的消息 arg0使用NativeKey中的值 */
    private static onNativeCall(arg0: string, arg1?: string) {
        switch (arg0) {
            case NativeKey.Login:
                this.onLoginEnded(arg1);
                break;
            case NativeKey.ShowRewardVideo:
                this.onShowRewardVideoEnded(arg1);
                break;
        }
    }

    /** 发送消息给原生层 args0使用NativeKey中的值*/
    public static sendToNative(arg0: string, arg1?: string) {
        if (!this.isInit) {
            this.isInit = true;
            native.bridge.onNative = this.onNativeCall;
        }
        native.bridge.sendToNative(arg0, arg1);
    }


    /** 登录回调处理 */
    private static onLoginEnded(arg: string) {
        if (!arg) {
            SDKCallback.login?.fail && SDKCallback.login.fail();
        } else {
            SDKCallback.login?.success && SDKCallback.login.success(arg);
        }
    }

    /** 看视频广告回调处理 */
    private static onShowRewardVideoEnded(arg: string) {

    }

    /** 内购回调处理 */
    private static onRequestIAPEnded(arg: string) {

    }

}



type StringCallback = (str?: string) => void;
type NumberCallback = (num?: number) => void;

export class LoginArgs {
    success: StringCallback;
    fail: StringCallback;
    extParam?: string;
}

export class ShowRewardVideoArgs {
    success?: StringCallback;
    fail?: StringCallback;
    show?: StringCallback;
    close?: StringCallback;
    error?: StringCallback;
    extParam?: string;
}

export class RequestIAPArgs {
    id: string;
    price?: number;
    name?: string;
    desc?: string;
    isSub?: boolean;
    extParam?: string;
}

