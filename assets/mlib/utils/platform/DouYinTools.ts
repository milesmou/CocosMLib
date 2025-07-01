import { Node, size, sys, view } from "cc";

/** 抖音平台工具类 */
class DouYinTools {
    public readonly sysInfo: tt.SystemInfo;

    public get env(): GameEnv {
        ///开发工具和预览标记为develop，测试版标记为trial
        if (this.sysInfo.platform == "devtools") return "develop";
        let env = tt.getEnvInfoSync().microapp.envType;
        if (env == "production") return "release";
        else if (env == "development") return "trial";
        return "develop";
    }

    public constructor() {
        this.checkUpdate();
        this.sysInfo = tt.getSystemInfoSync();
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

    /** 是否支持桌面快捷方式 */
    public get isSupportShortcut() {
        return this.isAndroid && this.sysInfo.appName == "Douyin" || this.sysInfo.appName == "douyin_lite";
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
        let updateManager = tt.getUpdateManager();
        updateManager.onUpdateReady(() => {
            tt.showModal({
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
globalThis.isDouYin = sys.platform == sys.Platform.BYTEDANCE_MINI_GAME;
if (isDouYin) {
    let dyTools = new DouYinTools();
    //@ts-ignore
    globalThis.dyTools = dyTools;
}

declare global {
    /** 是否抖音渠道 */
    const isDouYin: boolean;
    /** 抖音平台工具类 */
    const dyTools: DouYinTools;
}