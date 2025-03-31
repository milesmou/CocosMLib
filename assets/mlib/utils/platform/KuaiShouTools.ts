import { Node, size, view } from "cc";

/** 快手平台工具类 */
class KuaiShouTools {
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
globalThis.isKuaiShou = typeof KSGameGlobal != 'undefined';
if (isKuaiShou) {
    let ksTools = new KuaiShouTools();
    //@ts-ignore
    globalThis.ksTools = ksTools;
}

declare global {
    /** 是否快手渠道 */
    const isKuaiShou: boolean;
    /** 快手平台工具类 */
    const ksTools: KuaiShouTools;
}