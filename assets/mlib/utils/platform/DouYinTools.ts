import { game, Node, size, sys, view } from "cc";
import { BYTEDANCE } from "cc/env";

/** 激励视频缓存 广告id:激励视频 */
const rewardedAdCache: Map<string, any> = new Map();

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

    public get gameEnv(): GameEnv {
        if (!BYTEDANCE) return;
        ///开发工具和预览标记为develop，测试版标记为trial
        if (this.sysInfo.platform == "devtools") return "develop";
        let env = tt.getEnvInfoSync().microapp.envType;
        if (env == "production") return "release";
        else if (env == "development") return "trial";
        return "develop";
    }

    public constructor() {
        if (!BYTEDANCE) return;
        this.sysInfo = tt.getSystemInfoSync();
        this.checkSupportSidebar();
        game.restart = async () => { tt.restartMiniProgramSync(); }
        game.exit = async () => { tt.exitMiniProgram({ isFullExit: true }); }
        console.log("SystemInfo", this.sysInfo);
    }

    /** IOS平台 */
    private get isIos() {
        if (!BYTEDANCE) return;
        return this.sysInfo.platform.indexOf("ios") > -1;
    }

    /** 是否支持桌面快捷方式添加 */
    public get isSupportShortcut() {
        if (!BYTEDANCE) return;
        return this.sysInfo.appName == "Douyin" || this.sysInfo.appName == "douyin_lite" || this.sysInfo.appName == "aweme_hotsoon";
    }

    /** 分享 */
    public shareAppMessage(opts: object, result: ResultCallback) {
        if (!BYTEDANCE) return;
        tt.shareAppMessage({
            ...opts,
            success: () => {
                result({ code: 0 });
            },
            fail: (errMsg) => {
                console.warn("shareAppMessage", errMsg);
                result({ code: 2, msg: errMsg });
            }
        });
    }

    /** 观看激励视频广告 */
    public watchRewardedAd(opts: { adUnitId: string, [k: string]: any }, result: ResultCallback) {
        if (!BYTEDANCE) return;
        let rewardedAd = rewardedAdCache.get(opts.adUnitId);
        if (!rewardedAd) {
            rewardedAd = tt.createRewardedVideoAd({
                adUnitId: opts.adUnitId
            });
            rewardedAdCache.set(opts.adUnitId, rewardedAd);
        }
        let onError = rewardedAd['_onError'];
        let onClose = rewardedAd['_onClose'];
        if (onError) rewardedAd.offError(onError);
        if (onClose) rewardedAd.offClose(onClose);
        onError = err => {
            console.warn("watchRewardedAd", err);
            result({ code: 2, msg: err.errCode + "---" + err.errMsg });
        };
        onClose = res => {
            if (res.isEnded) {
                result({ code: 0 });
            } else {
                result({ code: 1 });
            }
        };
        rewardedAd.onError(onError);
        rewardedAd.onClose(onClose);
        rewardedAd['_onError'] = onError;
        rewardedAd['_onClose'] = onClose;
        rewardedAd.load().then(() => {
            rewardedAd.show().then(() => {
                result({ code: 4 });
            });
        });
    }

    /** 添加桌面快捷方式 */
    public addShortcut(result: ResultCallback) {
        if (!BYTEDANCE) return;
        if (this.isIos) {
            sys.localStorage.setItem(iOSAddShortcutSaveKey, "yes");
        }
        tt.addShortcut({
            success: (errMsg) => {
                if (!this.isIos) {
                    result({ code: 0 });
                }
            },
            fail: (errMsg) => {
                result({ code: 1, msg: errMsg });
            },
            complete: () => {
                if (this.isIos) {
                    result({ code: 0 });
                }
            }
        })
    }

    /** 检查桌面是否已添加快捷方式 (ios平台点击过就算已添加) */
    public checkShortcut() {
        if (!BYTEDANCE) return;
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


    /** 通过传入一个目标节点 获取在小游戏平台原生的坐标和大小 */
    public getStyleRect(target: Node) {
        if (!BYTEDANCE) return;
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
        if (!BYTEDANCE) return;
        if (!scene) scene = tt.getLaunchOptionsSync().scene;
        return this.sidebarScnenes.includes(scene);
    }

    /** 检查是否支持侧边栏 */
    private checkSupportSidebar() {
        if (!BYTEDANCE) return;
        tt.checkScene({
            scene: "sidebar",
            success: (res) => {
                this._isSupportSidebar = res.isExist;
            },
            fail: (res) => {
                console.warn("check scene fail:", res);
            }
        });
    }
}

//@ts-ignore
globalThis.isDouYin = BYTEDANCE;
if (BYTEDANCE) {
    let dyTools = new DouYinTools();
    //@ts-ignore
    globalThis.dyTools = dyTools;
}

declare global {
    /** 是否抖音平台 */
    const isDouYin: boolean;
    /** 抖音平台工具类 (发布后生效) */
    const dyTools: DouYinTools;
}
