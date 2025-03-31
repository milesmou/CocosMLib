import { Node, size, sys, view } from "cc";
import { WECHAT } from "cc/env";

class WechatTools {
    public readonly sysInfo: WechatMinigame.SystemInfo;

    public constructor() {
        this.sysInfo = wx.getSystemInfoSync();
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
}

 //@ts-ignore
 let isKS = typeof KSGameGlobal != 'undefined';
 //@ts-ignore
 globalThis.isWechat = sys.platform == sys.Platform.WECHAT_GAME && !isKS;
 if (isWechat) {
     let wxTools = new WechatTools();
     //@ts-ignore
     globalThis.wxTools = wxTools;
 }

declare global {
    /** 是否微信渠道 */
    const isWechat: boolean;
    /** 微信平台工具类 */
    const wxTools: WechatTools;
}