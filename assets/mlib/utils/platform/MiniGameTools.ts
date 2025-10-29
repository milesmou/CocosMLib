import { ALIPAY, BYTEDANCE, MINIGAME, WECHAT } from "cc/env";

/** 小游戏通用工具类 (接口参数和返回值类型以微信小游戏为主) */
class MiniGameTools {

    /** 文件系统中的用户目录路径 */
    public get env(): { USER_DATA_PATH: string } {
        if (!MINIGAME) return null;
        if (WECHAT) return wx.env;
        else if (BYTEDANCE) return tt.env;
        else console.warn("[env] 不支持的小游戏平台");
        return null;
    }

    /** 文件管理系统 */
    public get fs(): WechatMinigame.FileSystemManager {
        if (!MINIGAME) return null;
        if (WECHAT) return wx.getFileSystemManager();
        else if (BYTEDANCE) return tt.getFileSystemManager();
        else console.warn("[fs] 不支持的小游戏平台");
        return null;
    }

    /** 安卓平台 */
    public get isAndroid() {
        if (!MINIGAME) return false;
        if (WECHAT) {
            return wxTools.sysInfo.platform.indexOf("android") > -1;
        } else if (BYTEDANCE) {
            return dyTools.sysInfo.platform.indexOf("android") > -1;
        } else if (ALIPAY) {
            return zfbTools.sysInfo.platform.indexOf("android") > -1;
        }
        console.warn("[isAndroid] 不支持的小游戏平台");
        return false;
    }

    /** IOS平台 */
    public get isIos() {
        if (!MINIGAME) return false;
        if (WECHAT) {
            return wxTools.sysInfo.platform.indexOf("ios") > -1;
        } else if (BYTEDANCE) {
            return dyTools.sysInfo.platform.indexOf("ios") > -1;
        } else if (ALIPAY) {
            return zfbTools.sysInfo.platform.indexOf("ios") > -1;
        }
        console.warn("[isIos] 不支持的小游戏平台");
        return false;
    }

    /** 游戏运行环境 */
    public get gameEnv(): GameEnv {
        if (!MINIGAME) return;
        if (WECHAT) return wxTools.gameEnv;
        else if (BYTEDANCE) return dyTools.gameEnv;
        console.warn("[gameEnv] 不支持的小游戏平台");
    }

    public constructor() {
        if (!MINIGAME) return;
        this.keepScreenOn();
        this.showShareMenu();
        this.checkUpdate();
    }

    /** 设置屏幕常亮 */
    private keepScreenOn() {
        if (!MINIGAME) return;
        if (WECHAT) {
            wx.setKeepScreenOn({ keepScreenOn: true });
        } else if (BYTEDANCE) {
            tt.setKeepScreenOn({ keepScreenOn: true });
        }
    }

    /** 展示右上角分享菜单 */
    private showShareMenu() {
        if (!MINIGAME) return;
        if (WECHAT) {
            let option: WechatMinigame.ShowShareMenuOption = {
                withShareTicket: true,
                menus: ['shareAppMessage', 'shareTimeline']
            };
            wx.showShareMenu(option);
        } else if (BYTEDANCE) {
            tt.showShareMenu();
        }
    }

    /** 检查更新 */
    private checkUpdate() {
        if (!MINIGAME) return;
        let updateManager: WechatMinigame.UpdateManager;
        let onUpdateReady = () => {
            this.showModal({
                title: "更新提示",
                content: "新版本已准备好，游戏将重启！",
                showCancel: false,
                success: res => {
                    updateManager.applyUpdate();
                }
            });
        }
        if (WECHAT) {
            wx.getUpdateManager().onUpdateReady(onUpdateReady);
        } else if (BYTEDANCE) {
            tt.getUpdateManager().onUpdateReady(onUpdateReady);
        } else if (ALIPAY) {
            my.getUpdateManager().onUpdateReady(onUpdateReady);
        }
    }


    //#region 界面交互

    /** 显示消息提示框 */
    public showToast(option: WechatMinigame.ShowToastOption) {
        if (!MINIGAME) return;
        if (WECHAT) wx.showToast(option);
        else if (BYTEDANCE) tt.showToast(option);
        else console.warn("[showToast] 不支持的小游戏平台");
    }

    /** 显示模态对话框 */
    public showModal(option: WechatMinigame.ShowModalOption) {
        if (!MINIGAME) return;
        if (WECHAT) wx.showModal(option);
        else if (BYTEDANCE) tt.showModal(option);
        else if (ALIPAY) my.confirm(option);
        else console.warn("[showModal] 不支持的小游戏平台");
    }

    /** 显示操作菜单 */
    public showActionSheet(option: WechatMinigame.ShowActionSheetOption) {
        if (!MINIGAME) return;
        if (WECHAT) wx.showActionSheet(option);
        else if (BYTEDANCE) tt.showActionSheet(option);
        else console.warn("[showActionSheet] 不支持的小游戏平台");
    }

    /** 显示 loading 提示框。需主动调用 hideLoading 才能关闭提示框 */
    public showLoading(option: WechatMinigame.ShowLoadingOption) {
        if (!MINIGAME) return;
        if (WECHAT) wx.showLoading(option);
        else if (BYTEDANCE) tt.showLoading(option);
        else console.warn("[showLoading] 不支持的小游戏平台");
    }

    /** 隐藏 loading 提示框 */
    public hideLoading() {
        if (!MINIGAME) return;
        if (WECHAT) wx.hideLoading();
        else if (BYTEDANCE) tt.hideLoading();
        else console.warn("[hideLoading] 不支持的小游戏平台");
    }

    //#endregion



    /** 调起客户端小程序设置界面，返回用户设置的操作结果。设置界面只会出现小程序已经向用户请求过的权限。 */
    public openSetting() {
        if (!MINIGAME) return;
        if (WECHAT) wx.openSetting();
        else if (BYTEDANCE) tt.openSetting();
        else console.warn("[openSetting] 不支持的小游戏平台");
    }

    /** 请求用户授权 */
    public authorize(scope: string, result: ResultCallback) {
        if (!MINIGAME) return;
        let opts = {
            scope: scope,
            success: res => {
                result({ code: 0 });
            },
            fail: err => {
                console.warn("authorize", err);
                result({ code: 1, msg: err.errMsg });
            }
        };
        if (WECHAT) wx.authorize(opts);
        else if (BYTEDANCE) tt.authorize(opts);
        else console.warn("[authorize] 不支持的小游戏平台");
    }

    /** 用户是否已授权 */
    public isAuthorize(scope: string, result: ResultCallback) {
        if (!MINIGAME) return;
        let opts = {
            success: res => {
                let authSetting = res.authSetting;
                result({ code: authSetting[scope] ? 0 : 1 });
            },
            fail: err => {
                console.warn("authorize", err);
                result({ code: 2, msg: err.errMsg });
            }
        }
        if (WECHAT) wx.getSetting(opts);
        else if (BYTEDANCE) tt.getSetting(opts);
        else console.warn("[getSetting] 不支持的小游戏平台");
    }

    /** 设置系统剪贴板的内容 */
    public setClipboardData(data: string, result: ResultCallback): void {
        if (!MINIGAME) return;
        let opts = {
            data: data,
            success: () => {
                result({ code: 0 });
            },
            fail: (res) => {
                console.warn("setClipboardData", res.errMsg);
                result({ code: 2, msg: res.errMsg });
            }
        }
        if (WECHAT) wx.setClipboardData(opts);
        else if (BYTEDANCE) tt.setClipboardData(opts);
        else console.warn("[setClipboardData] 不支持的小游戏平台");

    }

    /** 获取系统剪贴板的内容 */
    public getClipboardData(result: ResultCallback): void {
        if (!MINIGAME) return;
        let opts = {
            success: function (res) {
                result({ code: 0, data: res.data });
            },
            fail: (res) => {
                console.warn("getClipboardData", res);
                result({ code: 2, msg: res.errMsg });
            }
        }
        if (WECHAT) wx.getClipboardData(opts);
        else if (BYTEDANCE) tt.getClipboardData(opts);
        else console.warn("[getClipboardData] 不支持的小游戏平台");
    }

    /** 扫码识别内容 10:取消扫码 11:拒绝授权 */
    public scanCode(opts: { onlyFromCamera?: boolean, scanType?: string[] }, result: ResultCallback) {
        if (!MINIGAME) return;
        let option = {
            onlyFromCamera: opts?.onlyFromCamera,
            scanType: opts?.scanType as any,
            success: res => {
                result({ code: 0, data: res.result });
            },
            fail: err => {
                console.warn("scanCode", err);
                let errNo: number = err.errNo || 10;
                if (BYTEDANCE) {
                    if (errNo == 10502) errNo = 10;//取消扫码
                    if (errNo == 10200) errNo = 11;//拒绝授权
                }
                result({ code: errNo, msg: err.errMsg });
            }
        }
        if (WECHAT) wx.scanCode(option);
        else if (BYTEDANCE) tt.scanCode(option);
        else console.warn("[scanCode] 不支持的小游戏平台");
    }

    /** 使手机发生振动（short:约15ms long:约400ms）默认short */
    public vibrate(type?: "short" | "long") {
        if (!MINIGAME) return;
        type = type || "short";
        if (WECHAT) type == "short" ? wx.vibrateShort({ type: "heavy" }) : wx.vibrateLong();
        else if (BYTEDANCE) type == "short" ? tt.vibrateShort() : tt.vibrateLong();
        else console.warn("[vibrate] 不支持的小游戏平台");
    }

}

if (MINIGAME) {
    (globalThis as any).minigameTools = new MiniGameTools();
}

declare global {
    /** 小游戏平台工具类 (发布后生效) */
    const minigameTools: MiniGameTools;
}