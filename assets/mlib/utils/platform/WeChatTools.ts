import { Component, director, Node, size, view } from "cc";
import { WECHAT } from "cc/env";

class WeChatTools {

    public readonly sysInfo: WechatMinigame.SystemInfo;

    public get gameEnv(): GameEnv {
        if (!WECHAT) return;
        ///微信正式版的envVersion好像也是develop，所以只在开发工具上返回develop，上传的非体验版包都视为正式版
        if (this.sysInfo.platform == "devtools") return "develop";
        let env = wx.getAccountInfoSync().miniProgram.envVersion;
        if (env == "trial") return env;
        return "release";
    }

    public constructor() {
        if (!WECHAT) return;
        this.sysInfo = wx.getSystemInfoSync();
        console.log("SystemInfo", this.sysInfo);
    }

    /** 分享 (微信无法检测分享结果 1秒后默认成功) */
    public shareAppMessage(opts: WechatMinigame.ShareAppMessageOption, result: ResultCallback) {
        if (!WECHAT) return;
        wx.shareAppMessage(opts);
        director.getScene().getComponentInChildren(Component).scheduleOnce(() => {
            result({ code: 0 });
        }, 1);
    }

    /** 观看激励视频广告 */
    public watchRewardedAd(opts: { adUnitId: string, [k: string]: any }, result: ResultCallback) {
        if (!WECHAT) return;
        let rewardedAd = wx.createRewardedVideoAd({
            adUnitId: opts.adUnitId
        });
        rewardedAd.offError();
        rewardedAd.offClose();
        rewardedAd.onError(err => {
            console.warn("watchRewardedAd", err);
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

    /** 创建游戏圈按钮（根据传入的节点位置和大小创建） */
    public createGameClubButton(target: Node) {
        if (!WECHAT) return;
        let rect = this.getStyleRect(target);
        return wx.createGameClubButton({
            type: "text",
            text: "前往游戏圈",
            icon: "white",
            style: {
                ...rect,
                fontSize: 16,
                textAlign: "center",
                color: "#ffffff00",
                lineHeight: rect.height,
                backgroundColor: "#ffffff00",
                borderColor: "#ffffff00",
                borderWidth: 0,
                borderRadius: 0
            }
        });
    }

    /** 通过传入一个目标节点 获取在小游戏平台原生的坐标和大小 */
    public getStyleRect(target: Node) {
        if (!WECHAT) return;
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
}

//@ts-ignore
globalThis.isKuaiShou = typeof KSGameGlobal != 'undefined';
//@ts-ignore
globalThis.isWechat = WECHAT && !isKuaiShou;
if (isWechat) {
    let wxTools = new WeChatTools();
    //@ts-ignore
    globalThis.wxTools = wxTools;
}

declare global {
    /** 是否微信平台 */
    const isWechat: boolean;
    /** 是否快手平台 (快手平台兼容微信API，直接使用wxTools) */
    const isKuaiShou: boolean;
    /** 微信平台工具类 (发布后生效) */
    const wxTools: WeChatTools;
}