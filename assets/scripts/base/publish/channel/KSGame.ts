/** 快手小游戏平台相关方法的实现 */
import { Camera, Game, _decorator, game } from "cc";
import { Channel } from "../../../../mlib/sdk/Channel";
import { IReportEvent } from "../../../../mlib/sdk/IReportEvent";
import { EIAPResult, ELoginResult, ENativeBridgeKey, EReawrdedAdResult, LoginArgs, MSDKWrapper, RequestIAPArgs, SDKCallback, ShowRewardedAdArgs } from "../../../../mlib/sdk/MSDKWrapper";

const { ccclass } = _decorator;

const skipAdAndIap = false;//用于测试 跳过广告和内购

@ccclass("KSGame")
export class KSGame extends Channel {

    systemInfo: WechatMinigame.SystemInfo = null;//系统信息
    launchInfo: WechatMinigame.LaunchOptionsGame = null;//启动游戏信息
    shareTitle = "男子重生竟变成亿万富翁？";//默认分享标题
    shareImageUrl = "默认分享图片地址";//默认分享图片

    constructor() {
        super();
        this.systemInfo = wx.getSystemInfoSync();
        this.launchInfo = wx.getLaunchOptionsSync();
        game.on(Game.EVENT_HIDE, this.shareResult, this);
    }


    login(args: LoginArgs) {
        SDKCallback.login = args;
        wx.login({
            success: loginRes => {
                MSDKWrapper.call(ENativeBridgeKey.Login, ELoginResult.Success.toString(), loginRes.code)
            },
            fail: loginRes => {
                MSDKWrapper.call(ENativeBridgeKey.Login, ELoginResult.Fail.toString(), loginRes.errMsg)
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
    shareTime: number = 0;
    shareSuccess: Function = null;
    shareFail: Function = null;
    shareComplete: Function = null;
    /**
     * 主动拉起转发，给好友分享信息
     */
    async shareAppMessage(obj?: { title?: string, imageUrl?: string, query?: string, camera?: Camera, suss?: Function, fail?: Function, complete?: Function }) {
        //this.shareTime = Date.now();
        //this.shareSuccess = obj?.success;
        //this.shareFail = obj?.fail;
        //this.shareComplete = obj?.complete;
        //obj.title = obj?.title || this?.shareTitle;
        //判断分享方式
        //if (obj?.camera) {//分享传入的camera渲染的内容//普通分享
        //obj.imageUrl = this.getImageUrlByCamera(obj.camera);

        //} else if (obj?.imageUrl) {//分享屏幕正中间
        //obj.imageUrl = obj.imageUrl;
        //} else {
        //obj.imageUrl = this.getImageUrlFromCanvasCenter();
        //}
        wx.shareAppMessage({
            title: obj.title,
            imageUrl: obj.imageUrl,
            query: obj.query
        });
    }
    /**
     * 分享结果判断
     */
    shareResult() {
        let now = Date.now();
        if (now - this.shareTime > 3500) {//3.5s伪分享检测
            this.shareSuccess && this.shareSuccess();
        } else {
            this.shareFail && this.shareFail();
        }
        this.shareComplete && this.shareComplete();
        this.shareTime = 0;
        this.shareSuccess = null;
        this.shareFail = null;
        this.shareComplete = null;
    }
    /**
     * 获取屏幕正中间截屏图片URL 取屏幕正中间5:4区域,横屏适应屏幕高度,竖屏适应屏幕宽度
     */
    getImageUrlFromCanvasCenter() {
        //let context: any = cc.game.canvas.getContext("2d") || cc.game.canvas.getContext("webgl", { preserveDrawingBuffer: true });
        //let x, y, wid, hgt;
        //if (cc.winSize.width > cc.winSize.height) {//横屏
        //hgt = context.drawingBufferHeight;
        //wid = hgt / 4 * 5;
        //} else {//竖屏
        //wid = context.drawingBufferWidth;
        //hgt = wid / 5 * 4;
        //}
        //x = (context.drawingBufferWidth - wid) / 2;
        //y = (context.drawingBufferHeight - hgt) / 2;
        //return context.canvas.toTempFilePathSync({
        //x: x,
        //y: y,
        //width: wid,
        //height: hgt,
        //destWidth: 500,
        //destHeight: 400
        //});
    }
    /**
     * 通过摄像机获取截屏图片的URl
     * @param camera 
     */
    getImageUrlByCamera(camera: Camera) {
        //let texture = new cc.RenderTexture();
        //let gl = cc.game['_renderContext'];
        //texture.initWithSize(500, 400, gl.STENCIL_INDEX8);
        //camera.targetTexture = texture;
        //camera.render(null);
        //let data = texture.readPixels();

        //let canvas: any = document.createElement('canvas');
        //let ctx = canvas.getContext('2d');

        //let width = canvas.width = texture.width;
        //let height = canvas.height = texture.height;
        //canvas.width = texture.width;
        //canvas.height = texture.height;

        //let rowBytes = width * 4;
        //for (let row = 0; row < height; row++) {
        //let srow = height - 1 - row;
        //let imageData = ctx.createImageData(width, 1);
        //let start = srow * width * 4;
        //for (let i = 0; i < rowBytes; i++) {
        //imageData.data[i] = data[start + i];
        //}
        //ctx.putImageData(imageData, 0, row);
        //}
        //return canvas.toTempFilePathSync();
    }

    /**
     * 显示右上角菜单里的转发按钮
     */
    showShareMenu(obj?: { title?: string, imageUrl?: string }) {
        obj.title = obj?.title || this.shareTitle;
        obj.imageUrl = obj?.imageUrl || this.shareImageUrl;
        let option: WechatMinigame.ShowShareMenuOption = {};
        wx.showShareMenu(option);
        wx.onShareAppMessage(() => {
            let imgUrl = `https://zhiqu.zqygame.com/res/zhiqu/RebornMan/Resources/share/${Math.random() < 0.5 ? 1 : 2}.png`;
            return { title: obj.title, imageUrl: imgUrl };
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
    private _onRewardedAdClose: (res: any) => void;
    private _onRewardedAdError: (error: any) => void;

    /** 展示激励视频广告 */
    showRewardedAd(args: ShowRewardedAdArgs) {

        if (this._isLoadingRewardedAd) return;
        SDKCallback.rewardedAd = args;
        SDKCallback.onStartRewardedAd && SDKCallback.onStartRewardedAd(args.extParam);

        if (skipAdAndIap) {
            MSDKWrapper.call(ENativeBridgeKey.ShowRewardedVideo, EReawrdedAdResult.Show.toString());
            MSDKWrapper.call(ENativeBridgeKey.ShowRewardedVideo, EReawrdedAdResult.Success.toString());
            return;
        }

        if (!this._onRewardedAdClose) {
            this._onRewardedAdClose = (res) => {
                this._isLoadingRewardedAd = false;
                if (res.isEnded) {
                    MSDKWrapper.call(ENativeBridgeKey.ShowRewardedVideo, EReawrdedAdResult.Success.toString());
                } else {
                    MSDKWrapper.call(ENativeBridgeKey.ShowRewardedVideo, EReawrdedAdResult.Fail.toString());
                }
            }
            this._onRewardedAdError = (err) => {
                this._isLoadingRewardedAd = false;
                mLogger.error(err);
            }
        }

        let video = wx.createRewardedVideoAd({
            adUnitId: "2300006831_01"
        });
        video.offClose(this._onRewardedAdClose);
        video.offError(this._onRewardedAdError);
        video.onClose(this._onRewardedAdClose);
        video.onError(this._onRewardedAdError);
        video.load().then(() => {
            video.show();
            MSDKWrapper.call(ENativeBridgeKey.ShowRewardedVideo, EReawrdedAdResult.Show.toString());
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
                    mLogger.error(err);
                });
        }
    }

    /** 发起内购 */
    requestIAP(args: RequestIAPArgs) {
        if (skipAdAndIap) {
            MSDKWrapper.call(ENativeBridgeKey.RequestIAP, EIAPResult.Success.toString(), args.productId);
            return;
        }
        wx.requestMidasPayment({
            offerId: "",
            currencyType: "CNY",
            mode: "game",
            outTradeNo: "",
            success: res => {
                MSDKWrapper.call(ENativeBridgeKey.RequestIAP, EIAPResult.Success.toString(), args.productId);
            },
            fail: err => {
                MSDKWrapper.call(ENativeBridgeKey.RequestIAP, EIAPResult.Fail.toString(), args.productId);
            }
        });
    }


    public reportEvent(event: IReportEvent, args?: { [key: string]: any; }, tag?: string): void {
        super.reportEvent(event, args, tag);
    }

    public vibrate(duration?: "short" | "medium" | "long"): void {
        duration = duration || "short";
        if (!this.vibrateEnable) return;
        if (duration == "short") {
            wx.vibrateShort({ type: "light" });
        } else {
            wx.vibrateLong();
        }
    }

    /**
     *  判断系统SDK版本是否符合最低版本要求
     * @ver 最低SDK版本要求 格式：1.0.0
     */
    private compareVersion(ver: string): boolean {
        let sdkVer = this.systemInfo!.SDKVersion;
        let pat = /\d+.\d+.\d+/;
        if (!pat.test(ver) || !pat.test(sdkVer)) {
            mLogger.warn("SDKVersion取值异常");
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

}