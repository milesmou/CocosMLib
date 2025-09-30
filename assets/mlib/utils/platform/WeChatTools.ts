import { Component, director, Node, size, sys, view } from "cc";

class WeChatTools {
    public readonly sysInfo: WechatMinigame.SystemInfo;

    public get env(): GameEnv {
        ///微信正式版的envVersion好像也是develop，所以只在开发工具上返回develop，上传的非体验版包都视为正式版
        if (this.sysInfo.platform == "devtools") return "develop";
        let env = wx.getAccountInfoSync().miniProgram.envVersion;
        if (env == "trial") return env;
        return "release";
    }

    public constructor() {
        wx.setKeepScreenOn({ keepScreenOn: true });
        this.sysInfo = wx.getSystemInfoSync();
        this.checkUpdate();
        this.showShareMenu();
        console.log("SystemInfo", this.sysInfo);
    }

    /** 安卓平台 */
    public get isAndroid() {
        return this.sysInfo.platform.indexOf("android") > -1;
    }

    /** IOS平台 */
    public get isIos() {
        return this.sysInfo.platform.indexOf("ios") > -1;
    }

    /** 分享 (微信无法检测分享结果 1秒后默认成功) */
    public shareAppMessage(opts: WechatMinigame.ShareAppMessageOption, result: ResultCallback) {
        wx.shareAppMessage(opts);
        director.getScene().getComponentInChildren(Component).scheduleOnce(() => {
            result({ code: 0 });
        }, 1);
    }

    /** 观看激励视频广告 */
    public watchRewardedAd(opts: { adUnitId: string, [k: string]: any }, result: ResultCallback) {
        let rewardedAd = wx.createRewardedVideoAd({
            adUnitId: opts.adUnitId
        });
        rewardedAd.offError();
        rewardedAd.offClose();
        rewardedAd.onError(err => {
            console.error("watchRewardedAd", err);
            result({ code: 2, msg: err.errCode + "---" + err.errMsg });
        });
        rewardedAd.onClose(res => {
            if (res.isEnded) {
                result({ code: 0 });
            } else {
                result({ code: 1 });
            }
        });

        rewardedAd.load().then(() => {
            rewardedAd.show().then(() => {
                result({ code: 4 });
            });
        });
    }

    /** 设置系统剪贴板的内容 */
    public setClipboardData(data: string, success?: () => void, fail?: (errMsg: string) => void): void {
        wx.setClipboardData({
            data: data,
            success: () => {
                success && success();
            },
            fail: (res) => {
                console.error("setClipboardData", res);
                fail && fail(res.errMsg);
            }
        });
    }

    /** 获取系统剪贴板的内容 */
    public getClipboardData(success?: (data: string) => void, fail?: (errMsg: string) => void): void {
        wx.getClipboardData({
            success: function (res) {
                success && success(res.data);
            },
            fail: (res) => {
                console.error("getClipboardData", res);
                fail && fail(res.errMsg);
            }
        });
    }

    /** 通过传入一个目标节点 获取在小游戏平台原生的坐标和大小 */
    public getMiniGameStyle(target: Node) {
        let result = { left: 0, top: 0, width: 0, height: 0 };
        let cSize = view.getVisibleSize();
        let mSize = size(this.sysInfo.screenWidth, this.sysInfo.screenHeight);
        let scale = mSize.width / cSize.width;

        let nodeRect = target.transform.getBoundingBoxToWorld();

        result.left = nodeRect.xMin * scale;
        result.top = mSize.height - nodeRect.yMax * scale;
        result.width = nodeRect.width * scale;
        result.height = nodeRect.width * scale;

        return result;
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

    /**
     * 显示右上角菜单里的转发按钮
     */
    private showShareMenu(cb?: () => void) {
        let option: WechatMinigame.ShowShareMenuOption = {
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline'],
            success: (res) => {
                console.log("显示分享菜单成功", res);
                cb && cb();
            }
        };
        wx.showShareMenu(option);
    }
}

//@ts-ignore
let isKS = typeof KSGameGlobal != 'undefined';
//@ts-ignore
globalThis.isWechat = sys.platform == sys.Platform.WECHAT_GAME && !isKS;
if (isWechat) {
    let wxTools = new WeChatTools();
    //@ts-ignore
    globalThis.wxTools = wxTools;
}

declare global {
    /** 是否微信平台 (发布后生效) */
    const isWechat: boolean;
    /** 微信平台工具类 (发布后生效) */
    const wxTools: WeChatTools;
}