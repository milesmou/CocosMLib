import { math, Node, size, sys, view } from "cc";
import { ALIPAY } from "cc/env";

class ZFBTools {
    public readonly sysInfo: my.SystemInfo;

    public get gameEnv(): GameEnv {
        if (!ALIPAY) return;
        let env = my.getAccountInfoSync().miniProgram.envVersion;
        return env;
    }

    public constructor() {
        if (!ALIPAY) return;
        this.sysInfo = my.getSystemInfoSync();
        sys.getSafeAreaRect = () => { return this.getSafeAreaRect(); }
        console.log("SystemInfo", this.sysInfo);
    }

    /** 获取在cc下的安全区域范围 */
    private getSafeAreaRect() {
        if (!ALIPAY) return;
        let windowInfo = my.getWindowInfo();
        let viewSize = view.getVisibleSize();

        let x = windowInfo.safeArea.left;
        let y = windowInfo.screenHeight - windowInfo.safeArea.top - windowInfo.safeArea.height;

        x = x / windowInfo.screenWidth * viewSize.width;
        y = y / windowInfo.screenHeight * viewSize.height;
        let width = windowInfo.safeArea.width / windowInfo.screenWidth * viewSize.width;
        let height = windowInfo.safeArea.height / windowInfo.screenHeight * viewSize.height;

        return new math.Rect(x, y, width, height);
    }


    /** 通过传入一个目标节点 获取在小游戏平台原生的坐标和大小 */
    public getStyleRect(target: Node) {
        if (!ALIPAY) return;
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
globalThis.isZFB = ALIPAY;
if (isZFB) {
    let zfbTools = new ZFBTools();
    //@ts-ignore
    globalThis.zfbTools = zfbTools;
}

declare global {
    /** 是否支付宝平台 */
    const isZFB: boolean;
    /** 支付宝平台工具类 (发布后生效) */
    const zfbTools: ZFBTools;
}