import { Node, size, sys, view } from "cc";

class WechatTools {
    public readonly sysInfo: WechatMinigame.SystemInfo;

    public get env(): GameEnv {
        ///微信正式版的envVersion好像也是develop，所以只在开发工具上返回develop，上传的非体验版包都视为正式版
        if (this.sysInfo.platform == "devtools") return "develop";
        let env = wx.getAccountInfoSync().miniProgram.envVersion;
        if (env == "trial") return env;
        return "release";
    }

    public constructor() {
        this.checkUpdate();
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