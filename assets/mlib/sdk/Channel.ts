import { _decorator, game, sys } from 'cc';
import { StroageMap } from '../module/stroage/StroageMap';
import { StroageValue } from '../module/stroage/StroageValue';
import { MCloudDataSDK } from '../sdk/MCloudDataSDK';
import { Utils } from '../utils/Utils';
import { IReportEvent } from './IReportEvent';
import { EIAPResult, ELoginResult, ENativeBridgeKey, EReawrdedAdResult, GetGameDataArgs, LoginArgs, MSDKWrapper, RequestIAPArgs, SaveGameDataArgs, SDKCallback, ShowRewardedAdArgs, UserInfo } from './MSDKWrapper';
const { ccclass } = _decorator;

@ccclass("Channel")
export class Channel {

    /** 用户信息 包含用户id和名字*/
    public user: UserInfo = { id: "", name: "" };

    /** 设备震动开关 */
    public vibrateEnable = new StroageValue(mGameSetting.gameName + "_VibrateEnable", true);

    protected mEnv: "dev" | "trial" | "release" = null;

    /** 获取运行环境 */
    public get env(): "dev" | "trial" | "release" {
        return "dev";
    }

    /**
     * 返回基于游戏视图坐标系的手机屏幕安全区域（设计分辨率为单位），如果不是异形屏将默认返回一个和 visibleSize 一样大的 Rect。
     */
    public getSafeAreaRect() {
        return sys.getSafeAreaRect();
    }

    /** 重启游戏 */
    public restartGame() {
        game.restart();
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
        SDKCallback.initInAppPurchase && SDKCallback.initInAppPurchase();
    }

    /** 登录 */
    public login(args: LoginArgs) {
        let userId = sys.localStorage.getItem("userId");
        if (!userId) {
            userId = Utils.genUUID();
            sys.localStorage.setItem("userId", userId);
        }
        SDKCallback.login = args;
        MSDKWrapper.call(ENativeBridgeKey.Login, ELoginResult.Success.toString(), userId);
    }

    /** 获取玩家存档 */
    public getGameData(args: GetGameDataArgs) {
        mLogger.debug("getGameData", args.userId);
        SDKCallback.getGameData = args;
        MCloudDataSDK.getPlayerGameData(args.userId).then(v => {
            if (v) {
                args.success && args.success(v);
            } else {
                args.fail && args.fail();
            }
        });
    }

    /** 上传玩家存档 */
    public uploadGameData(args: SaveGameDataArgs) {
        mLogger.debug("uploadGameData", args.userId);
        SDKCallback.uploadGameData = args;
        MCloudDataSDK.savePlayerGameData(args.userId, args.gameData).then(v => {
            if (v) {
                args.success && args.success();
            } else {
                args.fail && args.fail();
            }
        });
    }

    /** 展示激励视频广告 */
    public showRewardedAd(args: ShowRewardedAdArgs) {
        SDKCallback.rewardedAd = args;
        SDKCallback.onStartRewardedAd && SDKCallback.onStartRewardedAd(args.extParam);
        MSDKWrapper.call(ENativeBridgeKey.ShowRewardedVideo, EReawrdedAdResult.Show.toString());//测试直接成功
        MSDKWrapper.call(ENativeBridgeKey.ShowRewardedVideo, EReawrdedAdResult.Success.toString());//测试直接成功
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
        MSDKWrapper.call(ENativeBridgeKey.ReqProductDetails, EIAPResult.ProductDetail.toString(), "default")//测试直接成功
    }

    /** 发起内购 */
    public requestIAP(args: RequestIAPArgs) {
        SDKCallback.onStartInAppPurchase && SDKCallback.onStartInAppPurchase(args.productId);
        MSDKWrapper.call(ENativeBridgeKey.RequestIAP, EIAPResult.Success.toString(), args.productId)//测试直接成功
    }

    /** 恢复内购(订阅或漏单) */
    public restoreIAP() {

    }

    /** 
     * 上报事件 
     * @param event 事件对象
     * @param args 事件参数
    */
    public reportEvent(event: IReportEvent, args?: { [key: string]: any }, tag?: string) {
        if (!event.enable || !event.name) return;
        let paramStr = args ? Object.values(args).join("|") : "";
        MCloudDataSDK.reportEvent(event.name, paramStr);
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
        MCloudDataSDK.reportEvent(event.name, paramStr, num);
    }

    /** 使设备发生震动 */
    public vibrate(duration?: "short" | "long") {

    }

    /**
    * 敏感词检测
    * @param content 待检测内容
    * @param callback 回调
    */
    public checkMessage(content: string, callback: (isPass: boolean) => void) {

    }

    /** 设置系统剪贴板内容 */
    public setClipboard(data: string, success?: () => void, fail?: (errMsg: string) => void) {
        if (!sys.isBrowser) return;
        let fn = () => {
            // 复制结果
            let copyResult = true;
            // 创建一个input元素
            //@ts-ignore
            let inputDom = document.createElement('textarea');
            // 设置为只读 防止移动端手机上弹出软键盘  
            inputDom.setAttribute('readonly', 'readonly');
            // 给input元素赋值
            inputDom.value = data;
            // 将创建的input添加到body
            //@ts-ignore
            document.body.appendChild(inputDom);
            // 选中input元素的内容
            inputDom.select();
            // 执行浏览器复制命令
            // 复制命令会将当前选中的内容复制到剪切板中（这里就是创建的input标签中的内容）
            // Input要在正常的编辑状态下原生复制方法才会生效
            //@ts-ignore
            const result = document.execCommand('copy');
            // 判断是否复制成功
            if (result) {
                success && success();
            }
            else {
                // mLogger.debug('复制失败');
                fail && fail("fail");
                copyResult = false;
            }
            // 复制操作后再将构造的标签 移除
            //@ts-ignore
            document.body.removeChild(inputDom);
            // 返回复制操作的最终结果
            return copyResult;
        };
        // 复制结果
        let copyResult = true;
        // 判断是否支持clipboard方式
        if (window.navigator.clipboard) {
            // 利用clipboard将文本写入剪贴板（这是一个异步promise）
            window.navigator.clipboard.writeText(data).then((res) => {
                success && success();
                return copyResult;
            }).catch((err) => {
                fn();
            });
        }
        else {
            fn();
        }
    }

    /** 获取系统剪贴板内容 */
    public getClipboard(success: (data: string) => void, fail?: (errMsg: string) => void) {

    }

    /** 额外的方法 用于一些特殊的处理 */
    public extraMethod<R = any, T1 = any, T2 = any, T3 = any, T4 = any>(key?: string, arg1?: T1, arg2?: T2, arg3?: T3, arg4?: T4): R {
        return;
    }

    /** 额外的方法 用于一些特殊的处理 异步接口*/
    public async extraMethodAsync<R = any, T1 = any, T2 = any, T3 = any, T4 = any>(key?: string, arg1?: T1, arg2?: T2, arg3?: T3, arg4?: T4): Promise<R> {
        return;
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


