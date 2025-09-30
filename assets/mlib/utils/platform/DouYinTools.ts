import { Node, size, sys, view } from "cc";



/** 存储ios是否执行过保存快捷方式操作 */
const iOSAddShortcutSaveKey = "iOSAddShortcut";

/** 抖音平台工具类 */
class DouYinTools {

    public readonly sysInfo: tt.SystemInfo;

    /** 侧边栏场景值 */
    private readonly sidebarScnenes: string[] = ["021001", "021036", "101001", "101036"];

    private _isSupportSidebar = false;
    /** 宿主是否支持侧边 */
    public get isSupportSidebar() { return this._isSupportSidebar; }

    public get env(): GameEnv {
        ///开发工具和预览标记为develop，测试版标记为trial
        if (this.sysInfo.platform == "devtools") return "develop";
        let env = tt.getEnvInfoSync().microapp.envType;
        if (env == "production") return "release";
        else if (env == "development") return "trial";
        return "develop";
    }

    public constructor() {
        tt.setKeepScreenOn({ keepScreenOn: true });
        tt.showShareMenu();
        this.sysInfo = tt.getSystemInfoSync();
        this.checkUpdate();
        this.checkSupportSidebar();
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

    /** 是否支持桌面快捷方式添加 */
    public get isSupportShortcut() {
        return this.sysInfo.appName == "Douyin" || this.sysInfo.appName == "douyin_lite" || this.sysInfo.appName == "aweme_hotsoon";
    }

    /** 分享 */
    public shareAppMessage(opts: object, result: ResultCallback) {
        tt.shareAppMessage({
            ...opts,
            success: () => {
                result({ code: 0 });
            },
            fail: (errMsg) => {
                console.error("shareAppMessage", errMsg);
                result({ code: 2, msg: errMsg });
            }
        });
    }

    /** 观看激励视频广告 */
    public watchRewardedAd(opts: { adUnitId: string, [k: string]: any }, result: ResultCallback) {
        let rewardedAd = tt.createRewardedVideoAd({
            adUnitId: opts.adUnitId
        });
        rewardedAd.onError(err => {
            console.error("watchRewardedAd", err);
            result({ code: 2, msg: err.errCode + "---" + err.errMsg });
            rewardedAd.destroy();
        });
        rewardedAd.onClose(res => {
            if (res.isEnded) {
                result({ code: 0 });
            } else {
                result({ code: 1 });
            }
            rewardedAd.destroy();
        });
        rewardedAd.load().then(() => {
            rewardedAd.show().then(() => {
                result({ code: 4 });
            });
        });
    }

    /** 添加桌面快捷方式 */
    public addShortcut(success?: (errMsg?: string) => void, fail?: (errMsg?: string) => void) {
        if (this.isIos) {
            sys.localStorage.setItem(iOSAddShortcutSaveKey, "yes");
        }
        tt.addShortcut({
            success: (errMsg) => {
                if (!this.isIos) {
                    success && success(errMsg);
                }
            },
            fail: (errMsg) => {
                fail && fail(errMsg);
            },
            complete: () => {
                if (this.isIos) {
                    success && success("ios success");
                }
            }
        })
    }

    /** 检查桌面是否已添加快捷方式 (ios平台默认返回true) */
    public checkShortcut() {
        let p = new Promise<boolean>((resolve, reject) => {
            if (this.isIos) {
                let isAdd = sys.localStorage.getItem(iOSAddShortcutSaveKey) == "yes";
                resolve(isAdd);
                return;
            }
            tt.checkShortcut({
                success: (res) => {
                    resolve(res.status.exist);
                },
                fail: (res) => {
                    mLogger.error(res.errMsg)
                    resolve(false);
                }
            });

        });
        return p;
    }

    /** 设置系统剪贴板的内容 */
    public setClipboardData(data: string, result: ResultCallback): void {
        tt.setClipboardData({
            data: data,
            success: () => {
                result({ code: 0 });
            },
            fail: (errMsg) => {
                console.error("setClipboardData", errMsg);
                result({ code: 2, msg: errMsg });
            }
        });
    }

    /** 获取系统剪贴板的内容 */
    public getClipboardData(result: ResultCallback): void {
        tt.getClipboardData({
            success: (res) => {
                result({ code: 0, data: res.data });
            },
            fail: (errMsg) => {
                console.error("getClipboardData", errMsg);
                result({ code: 2, msg: errMsg });
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
     * 检查是否从侧边栏进入游戏
     * @param scene 场景值 不填会从启动参数中获取
     */
    public checkIsEnterFromSidebar(scene?: string) {
        if (!scene) scene = tt.getLaunchOptionsSync().scene;
        return this.sidebarScnenes.includes(scene);
    }

    /** 检查是否支持侧边栏 */
    private checkSupportSidebar() {
        tt.checkScene({
            scene: "sidebar",
            success: (res) => {
                this._isSupportSidebar = res.isExist;
            },
            fail: (res) => {
                console.error("check scene fail:", res);
            }
        });
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
    /** 是否抖音平台 (发布后生效) */
    const isDouYin: boolean;
    /** 抖音平台工具类 (发布后生效) */
    const dyTools: DouYinTools;
}
