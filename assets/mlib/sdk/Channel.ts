import { _decorator, game, sys } from 'cc';
import { PREVIEW } from 'cc/env';
import { StroageMap } from '../module/stroage/StroageMap';
import { Utils } from '../utils/Utils';
import { HttpGameData } from './GameWeb/GameData/HttpGameData';
import { HttpMulti } from './GameWeb/HttpMulti';
import { IReportEvent } from './IReportEvent';
import { ENativeBridgeKey, NativeBridge } from './SDKWrapper/NativeBridge';
import { GetGameDataParams, PayParams, RewardedVideoParams, SaveGameDataParams, SDKCallback, SDKTemp } from './SDKWrapper/SDKCallback';
import { SDKListener } from './SDKWrapper/SDKListener';
import { NativeTools } from './SDKWrapper/NativeTools';
const { ccclass } = _decorator;

if (sys.isBrowser) {
    game.restart = async () => { location.reload(); }
    game.exit = async () => { location.href = 'about:blank'; }
}

/** 上次展示激励视频广告的时间 */
let lastShowRewardedAdTime: number = 0;
/** 上次发起内购广告的时间 */
let lastPayTime: number = 0;

@ccclass("Channel")
export class Channel {

    /** 初始化SDK */
    public initSDK() {
        this.initEvent();
        NativeBridge.sendToNative("initSDK");
    }

    /** 初始化SDK相关的事件 */
    public initEvent() {
    }

    /** 初始化内购 */
    public initPay() {
        SDKListener.onInitPay();
    }

    /** 登录 */
    public login(args?: string) {
        let userId = sys.localStorage.getItem("userId");
        if (!userId) {
            userId = Utils.genUUID();
            sys.localStorage.setItem("userId", userId);
        }
        SDKListener.onLogin({ code: 0, userId: userId, userName: "游客" });
    }

    /** 获取玩家存档 */
    public getGameData(args: GetGameDataParams) {
        mLogger.debug("getGameData", args.userId);
        HttpGameData.getPlayerGameData({ userId: args.userId }).then(v => {
            if (v?.code == 0) {
                SDKListener.onGetGameData({ code: 0, data: v.data?.data, updateTime: v.data?.updateTime });
            } else {
                SDKListener.onGetGameData({ code: 1, msg: v?.msg })
            }
        });
    }

    /** 上传玩家存档 */
    public saveGameData(args: SaveGameDataParams) {
        mLogger.debug("uploadGameData", args.userId);
        SDKTemp.saveGameDataParams = args;
        HttpGameData.savePlayerGameData({ userId: args.userId, data: args.gameData }).then(v => {
            SDKListener.onSaveGameData({ code: v ? 0 : 1 });
        });
    }

    /**
     *  激励视频防盗刷检查
     * @param cd 冷却时间(秒) 两次请求小于cd秒则认为是盗刷 直接失败
     * @returns 是否通过检查 true通过 false直接触发失败逻辑
     */
    protected rewardedAdCheck(cd: number = 5) {
        const now = Date.now();
        if (now - lastShowRewardedAdTime < cd * 1000) {
            SDKListener.onRewardedVideo({ code: 2 });
            mLogger.warn("激励视频请求频率过快");
            return false;
        }
        lastShowRewardedAdTime = now;
        return true;
    }

    /** 展示激励视频广告 */
    public showRewardedAd(args: RewardedVideoParams) {
        SDKTemp.rewardedVideoParams = args;
        SDKListener.onRewardedVideo({ code: 3 });
        SDKListener.onRewardedVideo({ code: 4 });
        SDKListener.onRewardedVideo({ code: 0 });
    }

    /** 展示插屏广告 */
    public showInterstitial(...args: any[]) {

    }

    /** 展示横幅广告 */
    public showBanner(...args: any[]) {

    }

    /** 分享 */
    public shareAppMessage(opts?: { args?: any[], success?: () => void, fail?: () => void }) {

    }

    /**
     *  内购防盗刷检查
     * @param cd 冷却时间(秒) 两次请求小于cd秒则认为是盗刷 直接失败
     * @returns 是否通过检查 true通过 false直接触发失败逻辑
     */
    protected payCheck(cd: number = 5) {
        const now = Date.now();
        if (now - lastPayTime < cd * 1000) {
            SDKListener.onPay({ code: 1, productId: SDKTemp.payParams?.productId });
            mLogger.warn("内购请求频率过快");
            return false;
        }
        lastPayTime = now;
        return true;
    }

    /** 获取所有商品的详情信息 商品id之间用|隔开 */
    public reqProductDetails(productIds: string) {
        SDKListener.onGetProducts("default");
    }

    /** 发起内购 */
    public requestPay(args: PayParams) {
        SDKTemp.payParams = args;
        SDKListener.onStartPay();
        SDKListener.onPay({ code: 0, productId: args.productId, id: args.id });
    }

    /** 恢复内购(订阅或漏单) */
    public restorePay() {

    }

    /** 请求用户授权 */
    public authorize(scope: string, result: ResultCallback) {

    }

    /** 使设备发生震动 */
    public vibrate(type?: "light" | "medium" | "heavy") {

    }

    /**
    * 敏感词检测
    * @param content 待检测内容
    */
    public checkMsgSec(content: string, result: ResultCallback) {
        result({ code: 0 });
    }

    /**
    * 敏感图片检测
    * @param image 待检测的图片url
    */
    public checkImageSec(image: string, result: ResultCallback) {
        result({ code: 0 });
    }

    /** 设置系统剪贴板内容 */
    public setClipboard(data: string, result?: ResultCallback): void {
        if (!sys.isBrowser) return;
        navigator.clipboard.writeText(data).then((res) => {
            result && result({ code: 0 });
        }).catch((err) => {
            console.error("setClipboard", err);
            result && result({ code: 1, msg: err });
        });
    }

    /** 获取系统剪贴板内容 */
    public getClipboard(result: ResultCallback) {
        if (!sys.isBrowser) return;
        navigator.clipboard.readText().then((res) => {
            result && result({ code: 0, data: res });
        }).catch((err) => {
            console.error("getClipboard", err);
            result && result({ code: 1, msg: err });
        });
    }

    /** 扫码识别 code=10取消扫码 code=11拒绝授权 */
    public scanCode(opts: { onlyFromCamera?: boolean; scanType?: string[]; }, result: ResultCallback): void {
        result({ code: 1, msg: "未实现扫码功能" });
    }

    /** 调用渠道方法 无返回值 */
    public callChannelVoid(key: string, args?: string) {

    }

    /** 调用异步的渠道方法 需要传入一个回调 */
    public callChanneAsync(key: string, args?: string): Promise<string> {
        let p = new Promise<string>((resolve, reject) => {
            SDKCallback.callback.set(key, resolve);
            //逻辑处理完成后，通过SDKListener.onCallback 触发回调
            SDKListener.onCallback(key, key);
        });
        return p;
    }

    /** 
    * 原生平台基础事件 
    * @param event 事件名
    * @param args 事件参数
   */
    public nativeBaseEvent(event: string, args?: (string | number) | (string | number)[], tag?: string) {

    }

    /** 
     * 上报事件 
     * @param event 事件对象
     * @param args 事件参数
    */
    public reportEvent(event: IReportEvent, args?: { [key: string]: any }, tag?: string) {
        if (!event.enable || !event.name) return;
        let paramStr = args ? Object.values(args).join("|") : "";
        let eventName = PREVIEW ? "0_" + event.name : event.name;
        HttpMulti.reportEvent({ eventName: eventName, param: paramStr });
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
        let eventName = PREVIEW ? "0_" + event.name : event.name;
        HttpMulti.reportEvent({ eventName: eventName, param: paramStr, sum: num });
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

/** 原生渠道 */
@ccclass("NativeChannel")
export class NativeChannel extends Channel {
    public login(args?: string): void {
        NativeBridge.sendToNative(ENativeBridgeKey.Login);
    }

    public showRewardedAd(args: RewardedVideoParams): void {
        SDKTemp.rewardedVideoParams = args;
        if (!super.rewardedAdCheck()) return;
        SDKListener.onRewardedVideo({ code: 3 });
        NativeBridge.sendToNative(ENativeBridgeKey.ShowRewardedVideo, args.descEn);
    }

    public requestPay(args: PayParams): void {
        SDKTemp.payParams = args;
        if (!super.payCheck()) return;
        NativeBridge.sendToNative(ENativeBridgeKey.RequestPay, args);
    }

    public restorePay(): void {
        NativeBridge.sendToNative(ENativeBridgeKey.RestorePay);
    }

    public checkMsgSec(content: string, result: ResultCallback): void {
        SDKCallback.callback.set(ENativeBridgeKey.CheckMsgSec, res => {
            result({ code: res == "0" ? 0 : 1 });
        });
        NativeBridge.sendToNative(ENativeBridgeKey.CheckMsgSec, content);
    }

    public nativeBaseEvent(event: string, args?: (string | number) | (string | number)[], tag?: string): void {
        NativeTools.nativeBaseEvent(event, args, tag);
    }

    public vibrate(type?: "light" | "medium" | "heavy"): void {
        if (!app.vibrateEnable.value) return;
        NativeTools.vibrate(type);
    }

    public setClipboard(data: string, result?: ResultCallback): void {
        NativeTools.setClipboardData(data, (res) => {
            if (res.code == 0) {
                NativeTools.showToast("复制成功");
            }
            result({ code: res.code });
        });
    }

    public getClipboard(result: ResultCallback): void {
        NativeTools.getClipboardData(result);
    }

    public callChannelVoid(key: string, args?: string) {
        NativeBridge.sendToNative(key, args);
    }

    public callChanneAsync(key: string, args?: string): Promise<string> {
        let p = new Promise<string>((resolve, reject) => {
            SDKCallback.callback.set(key, resolve);
            NativeBridge.sendToNative(key, args);
        });
        return p;
    }
}

