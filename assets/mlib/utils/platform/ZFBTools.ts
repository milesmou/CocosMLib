import { math, Node, size, sys, view } from "cc";

class ZFBTools {
    public readonly sysInfo: zfb.SystemInfo;

    public constructor() {
        this.sysInfo = zfb.getSystemInfoSync();
        console.log("SystemInfo", this.sysInfo);
    }

    /** 获取在cc下的安全区域范围 */
    public get safeAreaRect() {
        let windowInfo = zfb.getWindowInfo();
        let viewSize = view.getVisibleSize();

        let x = windowInfo.safeArea.left;
        let y = windowInfo.screenHeight - windowInfo.safeArea.top - windowInfo.safeArea.height;

        x = x / windowInfo.screenWidth * viewSize.width;
        y = y / windowInfo.screenHeight * viewSize.height;
        let width = windowInfo.safeArea.width / windowInfo.screenWidth * viewSize.width;
        let height = windowInfo.safeArea.height / windowInfo.screenHeight * viewSize.height;

        return new math.Rect(x, y, width, height);
    }

    /** 安卓平台 */
    public get isAndroid() {
        return this.sysInfo.platform.indexOf("Android") > -1;
    }

    /** IOS平台 */
    public get isIos() {
        return this.sysInfo.platform.indexOf("iOS") > -1 || this.sysInfo.platform.indexOf("iPhone OS") > -1;
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
globalThis.isZFB = sys.platform == sys.Platform.ALIPAY_MINI_GAME;
if (isZFB) {
    globalThis.zfb = globalThis.my;
    let zfbTools = new ZFBTools();
    //@ts-ignore
    globalThis.zfbTools = zfbTools;
}

declare global {
    /** 是否支付宝渠道 */
    const isZFB: boolean;
    /** 支付宝平台工具类 */
    const zfbTools: ZFBTools;
}