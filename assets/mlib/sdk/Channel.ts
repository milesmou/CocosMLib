import { _decorator, game, sys } from 'cc';
import { PREVIEW } from 'cc/env';
import { StroageMap } from '../module/stroage/StroageMap';
import { Utils } from '../utils/Utils';
import { HttpGameData } from './GameWeb/GameData/HttpGameData';
import { HttpEvent } from './GameWeb/HttpEvent';
import { IReportEvent } from './IReportEvent';
import { GetGameDataParams, PayParams, RewardedVideoParams, SaveGameDataParams, SDKCallback, SDKTemp } from './SDKWrapper/SDKCallback';
import { SDKListener } from './SDKWrapper/SDKListener';
const { ccclass } = _decorator;

@ccclass("Channel")
export class Channel {

    /**
     * 返回基于游戏视图坐标系的手机屏幕安全区域（设计分辨率为单位），如果不是异形屏将默认返回一个和 visibleSize 一样大的 Rect。
     */
    public getSafeAreaRect() {
        return sys.getSafeAreaRect();
    }

    /** 退出游戏 */
    public exitGame() {
        if (sys.isBrowser) {
            location.href = 'about:blank';
        } else {
            console.warn("未实现游戏退出接口");
        }
    }

    /** 重启游戏 */
    public restartGame() {
        if (sys.isBrowser) {
            location.reload();
        } else {
            game.restart();
        }
    }

    /** 初始化SDK */
    public initSDK() {
        this.initEvent();
    }

    /** 初始化SDK相关的事件 */
    public initEvent() {
    }

    /** 初始化内购 */
    public initIAP() {
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
            if (v) {
                SDKListener.onGetGameData({ code: 0, data: v.data, updateTime: v.updateTime });
            } else {
                SDKListener.onGetGameData({ code: 1 })
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

    /** 展示激励视频广告 */
    public showRewardedAd(args: RewardedVideoParams) {
        SDKTemp.rewardedVideoParams = args;
        SDKListener.onRewardedVideo({ code: 3 })
        SDKListener.onRewardedVideo({ code: 4 })
        SDKListener.onRewardedVideo({ code: 0 })
    }

    /** 展示插屏广告 */
    public showInterstitial(...args: any[]) {

    }

    /** 展示横幅广告 */
    public showbanner(...args: any[]) {

    }

    /** 分享 */
    public shareAppMessage(opts?: { args?: any[], success?: () => void, fail?: () => void }) {

    }

    /** 获取所有商品的详情信息 商品id之间用|隔开 */
    public reqProductDetails(productIds: string) {
        SDKListener.onGetProducts("default");
    }

    /** 发起内购 */
    public requestIAP(args: PayParams) {
        SDKTemp.payParams = args;
        SDKListener.onStartPay();
        SDKListener.onPay({ code: 0, productId: args.productId });
    }

    /** 恢复内购(订阅或漏单) */
    public restoreIAP() {

    }

    /** 请求用户授权 */
    public authorize(scope: string, result: ResultCallback) {

    }

    /** 使设备发生震动 */
    public vibrate(type?: "short" | "long") {

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
    public callChanneAsync(key: string, args: string, callback: (res: string) => void) {
        SDKCallback.callback.set(key, callback);
        // 逻辑处理完成后，通过SDKListener.onCallback 触发回调
        // SDKListener.onCallback(key, "");
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
        HttpEvent.reportEvent({ eventName: eventName, param: paramStr });
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
        HttpEvent.reportEvent({ eventName: eventName, param: paramStr, sum: num });
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


