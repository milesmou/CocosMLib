// 官方文档地址：https://open.kuaishou.com/miniGameDocs/gameDev/api/api.html

interface CallbackOpt { success?: () => void, fail?: () => void, complete?: () => void }

/** 快手小游戏API声明 */
declare namespace ks {
    export const SDKVersion: string;
    export function login(opt?: CallbackOpt);
    export function getAccountInfoSync(): any;
    export function getSystemInfoSync(opt?: CallbackOpt): SystemInfo;
    export function getLaunchOptionsSync();
    export function vibrateShort(opt?: any);
    export function vibrateLong(opt?: any);
    export function requestSubscribeMessage(opt?: any);
    export function createRewardedVideoAd(opt: any);
    export function shareAppMessage(opt?: CallbackOpt);
    export function onShow(callback: (params: any) => void);
    export function offShow(callback?: (params: any) => void);
    export function requestGamePayment(opt?: any);
    export function addShortcut(opt?: any);
    export function checkShortcut(opt?: any);
    export function isLaunchFromShortcut(): boolean;
    export function setClipboard(opt: { text: string, success?: () => void, fail?: (errMsg: string) => void, complete?: () => void })
    export function getClipboard(opt?: { success?: (data: string) => void, fail?: (errMsg: string) => void, complete?: () => void })
    export function showModal(opt?: any);
    export function showToast(opt: {
        content: string, duration?: number, type?: string
        success?: () => void, fail?: (errMsg: string) => void, complete?: () => void
    });

    export interface SystemInfo {
        brand: string;
        model: string;
        pixelRatio: number;
        screenWidth: number;
        screenHeight: number;
        windowWidth: number;
        windowHeight: number;
        statusBarHeight: number;
        language: string;
        version: string;
        system: string;
        platform: string;
        safeArea: SafeArea;
        host: { appId: string, env: string, gameVersion: string };
    }

    export interface SafeArea {
        left: number;
        right: number;
        top: number;
        bottom: number;
        width: number;
        height: number;
    }
}

