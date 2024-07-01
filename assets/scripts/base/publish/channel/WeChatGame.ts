/** 微信小游戏平台相关方法的实现 */
import { Game, _decorator, game } from "cc";
import { MLogger } from "../../../../mlib/module/logger/MLogger";
import { Channel } from "../../../../mlib/sdk/Channel";
import { EIAPResult, ELoginResult, EReawrdedAdResult, LoginArgs, MSDKWrapper, RequestIAPArgs, SDKCallback, ShowRewardedAdArgs } from "../../../../mlib/sdk/MSDKWrapper";

const { ccclass } = _decorator;

const skipAdAndIap = false;//用于测试 跳过广告和内购

interface SharePlan {
    title: string;
    imageUrl: string;
    imageUrlId: string;
}

@ccclass("WeChatGame")
export class WeChatGame extends Channel {

    private _systemInfo: WechatMinigame.SystemInfo = null;//系统信息
    private _launchInfo: WechatMinigame.LaunchOptionsGame = null;//启动游戏信息

    /** 分享方案 */
    private _sharePlans: SharePlan[] = [
        {
            title: "男子重生竟变成亿万富翁？",
            imageUrl: "https://mmocgame.qpic.cn/wechatgame/hnpuxW0mukibfPmiag3gkbsumB6M4nQKeIWorArbcsGtndJIh4ib40LbpCDEIcibjpcl/0",
            imageUrlId: "LmIF4BagREaxP3QarGoAgg=="
        },
        {
            title: "男子重生竟变成亿万富翁？",
            imageUrl: "https://mmocgame.qpic.cn/wechatgame/y91iaUGFWqjjdmdy3ib8Cv5Y3zXgCN2mIGBsiaSUCM8cOCG8HgTYcDQsibzJQ03mEXQe/0",
            imageUrlId: "mtPPJ/+6RMmeo/Ki9UH6Ew=="
        }
    ];

    public constructor() {
        super();
        this._systemInfo = wx.getSystemInfoSync();
        this._launchInfo = wx.getLaunchOptionsSync();
        this.showShareMenu();
        this.checkUpdate();
        game.on(Game.EVENT_HIDE, this.shareResult, this);
    }


    login(args: LoginArgs) {
        SDKCallback.login = args;
        wx.login({
            success: loginRes => {
                MSDKWrapper.onLogin(ELoginResult.Success + "|" + loginRes.code);
            },
            fail: loginRes => {
                MSDKWrapper.onLogin(ELoginResult.Fail + "|" + loginRes.errMsg);
            }
        });
    }

    /**
     * 请求授权
     * @param obj.scope 授权权限 例: scope.userLocation
     */
    authorize(obj: { scope: string, suss?: Function, fail?: Function }) {
        // wx.getSetting({
        //     success: settingRes => {
        //         let authSetting = settingRes.authSetting;
        //         if (authSetting[obj.scope]) {
        //             if (obj.scope != "scope.userInfo") {
        //                 obj.success && obj.success();
        //             } else {
        //                 wx.getUserInfo({
        //                     withCredentials: true,
        //                     lang: "zh_CN",
        //                     success: userRes => {
        //                         obj.success && obj.success(userRes);
        //                     }
        //                 });
        //             }
        //         } else {
        //             if (obj.scope != "scope.userInfo") {
        //                 wx.authorize({
        //                     scope: obj.scope,
        //                     success: () => {
        //                         obj.success && obj.success();
        //                     },
        //                     fail: () => {
        //                         obj.fail && obj.fail();
        //                     }
        //                 });
        //             } else {//获取用户信息必须创建授权按钮
        //                 if (!this.compareVersion("2.0.6")) {
        //                     wx.showModal({
        //                         title: "温馨提示",
        //                         content: "当前微信版本过低，请升级到最新版微信后重试!",
        //                     });
        //                 } else {
        //                     let button = wx.createUserInfoButton({
        //                         withCredentials: true, type: 'text', text: "",
        //                         style: {
        //                             left: 0, top: 0, width: cc.winSize.width, height: cc.winSize.height, backgroundColor: '#00000000',
        //                             fontSize: 16, lineHeight: 20, color: '#000000', textAlign: 'center', borderRadius: 0
        //                         }
        //                     });
        //                     let emitTap = true;
        //                     button.onTap(authRes => {
        //                         if (authRes.userInfo) {
        //                             cc.log("用户授权");
        //                             button.destroy();
        //                             if (emitTap) {
        //                                 emitTap = false;
        //                                 obj.success && obj.success(authRes);
        //                             }
        //                         } else {
        //                             cc.log("拒绝授权用户信息");
        //                         }
        //                     });
        //                 }
        //             }
        //         }
        //     },
        //     fail: () => {
        //         cc.log("wx.getSetting fail");
        //         obj.fail && obj.fail();
        //     }
        // });
    }
    // 分享相关
    private _shareTime: number = 0;
    private _shareSuccess: Function = null;
    private _shareFail: Function = null;
    private _shareComplete: Function = null;
    /**
     * 主动拉起转发，给好友分享信息
     */
    shareAppMessage(obj?: { title?: string, imageUrl?: string, query?: string, suss?: Function, fail?: Function, complete?: Function }) {
        // this._shareTime = Date.now();
        // this._shareSuccess = obj?.success;
        // this._shareFail = obj?.fail;
        // this._shareComplete = obj?.complete;
        // obj.title = obj?.title || this?.shareTitle;
        // obj.imageUrl = obj.imageUrl;
        // wx.shareAppMessage({
        //     title: obj.title,
        //     imageUrl: obj.imageUrl,
        //     query: obj.query
        // });
    }
    /**
     * 分享结果判断
     */
    shareResult() {
        let now = Date.now();
        if (now - this._shareTime > 3500) {//3.5s伪分享检测
            this._shareSuccess && this._shareSuccess();
        } else {
            this._shareFail && this._shareFail();
        }
        this._shareComplete && this._shareComplete();
        this._shareTime = 0;
        this._shareSuccess = null;
        this._shareFail = null;
        this._shareComplete = null;
    }


    /**
     * 显示右上角菜单里的转发按钮
     */
    showShareMenu(sharePlan?: SharePlan) {
        let option: WechatMinigame.ShowShareMenuOption = {};
        wx.showShareMenu(option);
        wx.onShareAppMessage(() => {
            if (!sharePlan) {
                sharePlan = this._sharePlans[Math.floor(Math.random() * this._sharePlans.length)];
            }
            return sharePlan;
        });
    }

    // 广告相关
    bannerCache = {};//缓存banner及其显示次数
    /**
     * 添加banner
     * @param id  广告位id
     * @param posNode 跟随的节点 默认居中置底
     * @param width 宽度 默认300
     * @param sCnt 展示次数
     * @param preload 预加载banner 默认false直接展示banner
     */
    showBanner(obj: any) {
        //let { id, posNode, width, sCnt, preload } = obj;
        //let adUnitId = this.adCfg["Banner"][id];
        //width = cc.misc.clampf(width, 300, this.systemInfo.screenHeight);
        //sCnt = obj.sCnt || 2;
        //this.hideAllBanner();
        //let resetTop = banner => {
        //if (posNode) {
        //banner.style.top = this.systemInfo.screenHeight * (1 - posNode.getBoundingBoxToWorld().yMin / cc.winSize.height);
        //} else {
        //banner.style.top = this.systemInfo.screenHeight - Math.ceil(banner.style.realHeight) - 2;
        //}
        //};
        //if (!this.bannerCache[adUnitId] || this.bannerCache[adUnitId].sCnt <= 0) {//banner不存在或剩余显示次数为0
        //this.bannerCache[adUnitId] && this.bannerCache[adUnitId].banner.destroy();
        //let left = (this.systemInfo.screenWidth - width) / 2;
        //let banner = wx.createBannerAd({
        //adUnitId: adUnitId,
        //style: {
        //left: left,
        //top: this.systemInfo.screenHeight,
        //width: width
        //}
        //});
        //banner.onError(err => {
        //cc.log(err);
        //});
        //banner.onResize(() => {
        //resetTop(banner);
        //});
        //this.bannerCache[adUnitId] = { banner: banner, sCnt: sCnt };
        //} else {
        //resetTop(this.bannerCache[adUnitId].banner);
        //}
        //if (!preload) {
        //this.bannerCache[adUnitId].banner.show();
        //this.bannerCache[adUnitId].sCnt -= 1;
        //}
    }
    /**
     * 隐藏所有banner
     */
    hideAllBanner() {
        //for (let bannerId in this.bannerCache) {
        //let banner = this.bannerCache[bannerId].banner;
        //banner.hide();
        //}
    }




    private _isLoadingRewardedAd = false;
    private _onRewardedAdClose: (res) => void;
    private _onRewardedAdError: (error) => void;

    /** 展示激励视频广告 */
    showRewardedAd(args: ShowRewardedAdArgs) {

        if (this._isLoadingRewardedAd) return;
        SDKCallback.rewardedAd = args;
        SDKCallback.onStartRewardedAd && SDKCallback.onStartRewardedAd(args.extParam);

        if (skipAdAndIap) {
            MSDKWrapper.onShowRewardedAd(EReawrdedAdResult.Show.toString());
            MSDKWrapper.onShowRewardedAd(EReawrdedAdResult.Success.toString());
            return;
        }

        if (!this._onRewardedAdClose) {
            this._onRewardedAdClose = (res) => {
                this._isLoadingRewardedAd = false;
                if (res.isEnded) {
                    MSDKWrapper.onShowRewardedAd(EReawrdedAdResult.Success.toString());
                } else {
                    MSDKWrapper.onShowRewardedAd(EReawrdedAdResult.Fail.toString());
                }
            }
            this._onRewardedAdError = (err) => {
                this._isLoadingRewardedAd = false;
                MLogger.error(err);
            }
        }

        let video = wx.createRewardedVideoAd({
            adUnitId: "adunit-f8a7c86612727889"
        });
        video.offClose(this._onRewardedAdClose);
        video.offError(this._onRewardedAdError);
        video.onClose(this._onRewardedAdClose);
        video.onError(this._onRewardedAdError);
        video.load().then(() => {
            video.show().then(() => {
                MSDKWrapper.onShowRewardedAd(EReawrdedAdResult.Show.toString());
            });
        });
    }

    interstitial = null;//插屏广告

    /** 展示插屏广告 */
    showInterstitial(...args: any[]) {
        let adUnitId = "";
        if (this.compareVersion("2.6.0")) {
            if (!this.interstitial) {
                this.interstitial = wx.createInterstitialAd({ adUnitId: adUnitId });
            }
            this.interstitial.load()
                .then(() => {
                    this.interstitial.show();
                })
                .catch(err => {
                    MLogger.error(err);
                });
        }
    }

    /** 发起内购 */
    requestIAP(args: RequestIAPArgs) {
        if (skipAdAndIap) {
            MSDKWrapper.onInAppPurchase(EIAPResult.Success + "|" + args.productId);
            return;
        }
        wx.requestMidasPayment({
            offerId: "",
            currencyType: "CNY",
            mode: "game",
            outTradeNo: "",
            success: res => {
                MSDKWrapper.onInAppPurchase(EIAPResult.Success + "|" + args.productId);
            },
            fail: err => {
                MSDKWrapper.onInAppPurchase(EIAPResult.Fail + "|" + args.productId);
            }
        });
    }


    public reportEvent(eventName: string, args?: { [key: string]: any; }): void {
        super.reportEvent(eventName, args);
        if (args) {
            eventName = eventName + "_" + Object.values(args).join("_");
        }
    }

    public vibrate(...args: any[]): void {
        if (!this.vibrateEnable) return;
        if (args.length > 0 && args[0]) {
            wx.vibrateLong();
        } else {
            wx.vibrateShort({ type: "light" });
        }
    }

    /**
     *  判断系统SDK版本是否符合最低版本要求
     * @ver 最低SDK版本要求 格式：1.0.0
     */
    private compareVersion(ver: string): boolean {
        let sdkVer = this._systemInfo!.SDKVersion;
        let pat = /\d+.\d+.\d+/;
        if (!pat.test(ver) || !pat.test(sdkVer)) {
            MLogger.warn("SDKVersion取值异常");
            return false;
        }
        let arr1 = sdkVer.split(".");
        let arr2 = ver.split(".");
        for (let i = 0; i < 3; i++) {
            let v1 = parseInt(arr1[i]);
            let v2 = parseInt(arr2[i]);
            if (v1 > v2) {
                return true;
            } else if (v1 < v2) {
                return false;
            }
        }
        return true;
    }
    /**
     * 开启版本更新检测
     */
    private checkUpdate() {
        let updateManager = wx.getUpdateManager();
        updateManager.onUpdateReady(() => {
            wx.showModal({
                title: "更新提示",
                content: "新版本已准备好，是否重启应用？",
                success: res => {
                    if (res.confirm) {
                        updateManager.applyUpdate();
                    }
                }
            })
        })
    }



}