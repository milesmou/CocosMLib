// 官方文档地址：https://opendocs.alipay.com/mini-game/08v6wc?pathHash=7a4f5ce9

interface CallbackOpt { success?: () => void, fail?: () => void, complete?: () => void }

/** 支付宝小游戏API声明 */
declare namespace zfb {
    export const SDKVersion: string;
    export function canIUse(func: string): boolean;
    export function getSystemInfoSync(opt?: CallbackOpt): SystemInfo;
    export function getAccountInfoSync(opt?: CallbackOpt): AccountInfo;
    export function getWindowInfo(opt?: CallbackOpt): WindowInfo;
    export function getLaunchOptionsSync();
    export function getUpdateManager();
    export function vibrateShort(opt?: any);
    export function vibrateLong(opt?: any);
    export function requestSubscribeMessage(opt?: any);
    export function createRewardedAd(opt: any);
    export function onShareAppMessage(opt?: any);
    export function showSharePanel(opt?: CallbackOpt);
    export function onShow(callback: (params: any) => void);
    export function offShow(callback?: (params: any) => void);
    export function requestGamePayment(opt?: any);
    export function setClipboard(opt: { text: string, success?: () => void, fail?: (errMsg: string) => void, complete?: () => void })
    export function getClipboard(opt?: { success?: (data: string) => void, fail?: (errMsg: string) => void, complete?: () => void })
    export function showToast(opt: {
        content: string, duration?: number, type?: string
        success?: () => void, fail?: (errMsg: string) => void, complete?: () => void
    });
    export function confirm(opt?: any);
    export function alert(opt?: any);

    export interface SystemInfo {
        pixelRatio: number;
        screenWidth: number;
        screenHeight: number;
        windowWidth: number;
        windowHeight: number;
        model: string;
        system: string;
        platform: string;
        language: string;
        version: string;
        isIphoneXSeries: boolean;
        pcPlatform: string;
    }

    export interface WindowInfo {
        pixelRatio: number;
        screenWidth: number;
        screenHeight: number;
        windowWidth: number;
        windowHeight: number;
        statusBarHeight: number;
        safeArea: SafeArea;
        screenTop: number;
    }

    export interface SafeArea {
        left: number;
        right: number;
        top: number;
        bottom: number;
        width: number;
        height: number;
    }

    export interface AccountInfo {
        miniProgram: {
            /** 小游戏版本号（如果是预览版本的小游戏，该值为 preview ） */
            version: string,
            /** 小游戏环境 */
            envVersion: "release" | "trial" | "develop",
            /** 小游戏 appId */
            appId: string,
        };
    }
}

