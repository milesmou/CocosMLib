import { Asset, Label, Prefab, ProgressBar, TextAsset, Tween, _decorator, loadWasmModuleSpine, sys, tween } from 'cc';
import { PREVIEW } from 'cc/env';
import { TimeDuration } from 'db://assets/mlib/module/timer/TimeDuration';
import { SDKCallback } from 'db://assets/mlib/sdk/SDKWrapper/SDKCallback';
import { EHotUpdateResult, EHotUpdateState, HotUpdate } from '../../../mlib/misc/HotUpdate';
import { AssetMgr } from '../../../mlib/module/asset/AssetMgr';
import { HttpRequest } from '../../../mlib/module/network/HttpRequest';
import { UIComponent } from '../../../mlib/module/ui/manager/UIComponent';
import { UIForm } from '../../../mlib/module/ui/manager/UIForm';
import { SlowProgress, UnionProgress } from '../../../mlib/utils/UnionProgress';
import { GameTool } from '../../game/GameTool';
import { UIConstant } from '../../gen/UIConstant';
import { StageModel } from '../../ui/guanka/StageModel';
import { MapUtil } from '../../ui/Map/MapUtil';
import { GameData } from '../GameData';
import { EventKey } from '../GameEnum';
import { GameInit } from '../GameInit';
import GameTable from '../GameTable';
import { GameGuide } from '../guide/GameGuide';
import { EChannel } from '../publish/EChannel';
import { EasDataCollect } from '../publish/sdk/easdata/EasDataCollect';
import { ILanguage, LoadingText } from './LoadingText';
const { ccclass, property } = _decorator;


@ccclass("Loading")
export class Loading extends UIComponent {

    private get lblVersion() { return this.rc.get("lblVersion", Label); }
    private get uUID() { return this.rc.get("UUID", Label); }
    private get progressBar() { return this.rc.get("progressBar", ProgressBar); }
    // private get des() { return this.rc.get("des", loadingTipHelp); }
    private get des2() { return this.rc.get("des2", Label); }
    private get lblDesc() { return this.rc.get("lblDesc", Label); }
    private get lblProgress() { return this.rc.get("lblProgress", Label); }

    protected start() {
        //打点
        app.chan.reportEventLifetime(mReportEvent.init_newUser_lifetime, null, "NOZQY");
        app.chan.reportEvent(mReportEvent.init_loading_start, null, "NOZQY");
        app.chan.reportEventDaily(mReportEvent.init_loading_start_daily, null, "NOZQY");

        //数数打点
        app.chan.reportEvent(mReportEvent.init_loading_start, null, "SS");
        // mLogger.debug("----------新玩家登陆流程KIN--------------" + "2加载远程配置");

        //版本号
        this.lblVersion.string = app.verDetail;

        this.startGame();
    }

    private async startGame() {
        TimeDuration.time("Loading");

        await GameInit.initBeforeLoadConfig();

        //加载配置和登录
        TimeDuration.time("加载配置和登录");
        this.setTips(LoadingText.Login);
        this.startFakeProgress(2);
        await Promise.all([this.loadCfg(), this.login(), AssetMgr.loadBundle("dynamic"), AssetMgr.loadBundle("dynamic")]);
        TimeDuration.timeEndLog("加载配置和登录");

        //同步云端存档
        TimeDuration.time("同步云端存档 初始化数据表");
        this.setTips(LoadingText.SyncGameData);
        this.startFakeProgress(2);
        await Promise.all([loadWasmModuleSpine(), this.syncGameData(), GameTable.initData()]);
        TimeDuration.timeEndLog("同步云端存档 初始化数据表");

        //加载游戏资源
        TimeDuration.time("加载游戏资源");
        await this.loadRes();
        TimeDuration.timeEndLog("加载游戏资源");

        TimeDuration.timeEndLog("Loading");
    }

    /** 加载游戏配置 */
    private loadCfg() {
        this.setTips(LoadingText.Config);
        this.startFakeProgress(2);

        let loadCfgFunc = (retry = 3, onEnded: () => void) => {
            if (mGameSetting.gameConfigType == mGameSetting.ConfigType.Local && mGameSetting.channelId == EChannel.Dev) {//DEV渠道使用本地配置
                mLogger.debug("加载本地配置",);
                AssetMgr.loadAsset("GameConfig", TextAsset).then(textAsset => {
                    mGameConfig.deserialize(textAsset.text);
                    AssetMgr.decRef("GameConfig", TextAsset);
                    onEnded && onEnded();
                });
            } else {
                HttpRequest.requestText(mGameSetting.gameConfigUrl + "?" + Date.now(), { method: "GET" }).then(strRes => {
                    if (strRes) {
                        //打点
                        app.chan.reportEvent(mReportEvent.init_get_config_success, null, "NOZQY");
                        app.chan.reportEventDaily(mReportEvent.init_get_config_success_daily, null, "NOZQY");

                        //数数打点
                        app.chan.reportEvent(mReportEvent.init_get_config_success, null, "SS");
                        // mLogger.debug("----------新玩家登陆流程KIN--------------" + "3加载配置成功");
                        mGameConfig.deserialize(strRes);
                        onEnded && onEnded();
                    } else {
                        //打点
                        app.chan.reportEvent(mReportEvent.init_get_config_fail, null, "NOZQY");
                        app.chan.reportEventDaily(mReportEvent.init_get_config_fail_daily, null, "NOZQY");

                        //数数打点
                        app.chan.reportEvent(mReportEvent.init_get_config_fail, null, "SS");

                        if (retry > 0) {
                            retry--;
                            loadCfgFunc(retry - 1, onEnded);
                        } else {
                            mLogger.error(`加载配置失败 Url=${mGameSetting.gameConfigUrl}`);
                            app.tipMsg.showConfirm(this.getText(LoadingText.ConfigFail), {
                                type: 1, cbOk: () => {
                                    loadCfgFunc(3, onEnded);
                                }
                            });
                        }
                    }
                });

            }
        };

        let p = new Promise<void>((resolve, reject) => {
            loadCfgFunc(3, resolve);
        });
        return p;
    }


    /** 版本更新检测 */
    private async checkVersion() {
        if (!PREVIEW) {
            if (mGameSetting.hotupdate && mGameConfig.rg && sys.isNative) {
                let manifest = await AssetMgr.loadAsset("project", Asset);
                if (manifest) {
                    HotUpdate.Inst.start(
                        manifest,
                        mGameSetting.mainVersion,
                        this.onUpdateStateChange.bind(this),
                        this.onUpdateDownloadProgress.bind(this),
                        this.onUpdateComplete.bind(this)
                    );
                    return;
                } else {
                    mLogger.error("加载清单文件失败");
                }
            }
        }
    }

    /** 登录 */
    private login() {
        let loginFunc = (retry = 3, onEnded: () => void) => {
            SDKCallback.onLogin = result => {
                if (result.code == 0) {
                    mLogger.debug("登录成功", result.userId);
                    EasDataCollect.Inst.login(result.userId);
                    GameData.login(result.userId);
                    app.chan.user = { userId: result.userId, userName: result.userName };
                    this.uUID.string = "UUID：" + result.userId;
                    app.chan.reportEventLifetime(mReportEvent.init_sdk_login_success, null, "NOZQY");
                    app.chan.reportEventDaily(mReportEvent.init_sdk_login_success_daily, null, "NOZQY");

                    //数数打点
                    app.chan.reportEvent(mReportEvent.init_sdk_login_success, null, "SS");
                    // mLogger.debug("----------新玩家登陆流程KIN--------------" + "4第三方SDK加载成功（掌趣游登录）");

                    onEnded && onEnded();
                } else {
                    if (retry > 0) {
                        loginFunc(retry - 1, onEnded);
                    } else {
                        mLogger.error("登录失败", result.msg);
                        app.tipMsg.showConfirm(this.getText(LoadingText.LoginFail), {
                            type: 1, cbOk: () => {
                                loginFunc(3, onEnded);
                            }
                        });
                    }
                }
            };
            app.chan.login();
        }
        let p = new Promise<void>((resolve, reject) => {
            loginFunc(3, resolve);
        });
        return p;

    }

    /** 同步玩家数据 */
    private syncGameData() {

        let syncDataFunc = (retry = 3, onEnded: () => void) => {
            let localSaveTime = GameData.getSaveTime();
            if (localSaveTime < 0) {
                mLogger.debug("强制使用本地存档");
                onEnded && onEnded();
                return;
            }
            SDKCallback.onGetGameData = result => {
                if (result.code == 0) {
                    mLogger.debug("获取存档成功", result, localSaveTime);
                    if (result.data) {
                        mLogger.debug(`存档时间 云端:${new Date(result.updateTime).toLocaleString()} 本地:${new Date(localSaveTime).toLocaleString()}`);
                        if (result.updateTime > localSaveTime) {
                            if (!sys.isNative) {
                                mLogger.info("使用云存档");
                                GameData.replaceGameData(result.data);
                            } else {
                                mLogger.debug("原生暂时不使用云存档");
                            }
                        } else {
                            mLogger.info("使用本地存档");
                        }
                    } else {
                        mLogger.info("无云存档数据");
                    }
                    onEnded && onEnded();
                } else {
                    if (retry > 0) {
                        syncDataFunc(retry - 1, onEnded);
                    } else {
                        mLogger.error("获取存档失败", result.msg);
                        app.tipMsg.showConfirm(this.getText(LoadingText.SyncGameDataFail), {
                            type: 1, cbOk: () => {
                                syncDataFunc(3, onEnded);
                            }
                        });
                    }
                }
            }
            app.chan.getGameData({ userId: app.chan.user.userId });
        }

        let p = new Promise<void>((resolve, reject) => {
            syncDataFunc(3, resolve);
        });
        return p;
    }

    /** 加载游戏资源 */
    private async loadRes() {

        this.setTips(LoadingText.LoadGameRes);
        this.startFakeProgress(1);

        //打点
        app.chan.reportEvent(mReportEvent.init_loading_complete, null, "NOZQY");
        app.chan.reportEventDaily(mReportEvent.init_loading_complete_daily, null, "NOZQY");

        //数数打点
        app.chan.reportEvent(mReportEvent.init_loading_complete, null, "SS");
        // mLogger.debug("----------新玩家登陆流程KIN--------------" + "8登陆资源都加载完成了，准备进入游戏");

        //初始化游戏内容
        TimeDuration.time("initBeforeEnterHUD");
        this.des2.string = "K";
        await GameInit.initBeforeEnterHUD();
        TimeDuration.timeEndLog("initBeforeEnterHUD");

        EasDataCollect.Inst.enableSuperProperties();

        /** 审核模式 */
        let isSH = mGameConfig.sh && mGameSetting.isChannel(EChannel.WX_YXT);

        if (isSH) {//审核模式
            //加载场景
            this.setTips(LoadingText.LoadScene);
            TimeDuration.time("load shenhe");
            this.des2.string = "L";
            let unionProgress = new UnionProgress(this.onProgress.bind(this), 2);
            await AssetMgr.loadBundle("shenhe", { onProgress: unionProgress.getOnProgress("shenhe bundle") });
            await app.ui.show(UIConstant.wxYxtPuzzle, { onProgress: unionProgress.getOnProgress("wxYxtPuzzle") });
            TimeDuration.timeEndLog("load shenhe");
            this.node.destroy();
        } else {
            /** 未通过第一关的新用户 */
            let isNewUser = GameTool.isNewUser();
            if (!isNewUser) {
                //加载场景
                this.setTips(LoadingText.LoadScene);
                TimeDuration.time("load UIHUD And Map");
                this.des2.string = "L";
                let unionProgress = new UnionProgress(this.onProgress.bind(this), 2);
                await AssetMgr.loadBundle("hud", { onProgress: unionProgress.getOnProgress("hud bundle") });
                let slowProgress = new SlowProgress(unionProgress.getOnProgress("hud"), 2);
                let p1 = app.ui.show(UIConstant.UIHUD, { bottom: true, onProgress: slowProgress.getOnProgress("1") });
                let p2 = MapUtil.loadMap(slowProgress.getOnProgress("2"));
                await Promise.all([p1, p2]);
                TimeDuration.timeEndLog("load UIHUD And Map");
            }

            if (!isNewUser) {
                this.des2.string = "N";
                await app.timer.dealy(0.15);
                this.node.destroy();
                this.des2.string = "N1";
                await GameGuide.Inst.checkShowGuide();
            } else {
                this.des2.string = "N2";
                let hideLoading = (ui: UIForm) => {
                    if (ui.uiName == UIConstant.UIFightLoading) {
                        app.event.off(EventKey.OnUIShow, hideLoading);
                        this.node.destroy();
                    }
                }
                app.event.on(EventKey.OnUIShow, hideLoading);
                StageModel.Inst.enterFightGame(GameTool.firstStageId);
            }
        }

        this.des2.string = "O";
        //初始化游戏内容
        GameInit.initAfterEnterHUD();
        this.des2.string = "P";
    }

    /** 
     * 设置加载界面提示文字
     */
    private setTips(text: ILanguage | string, newProgress = true) {
        let content: string;
        if (typeof text === "string") {
            content = text;
        } else {
            content = this.getText(text);
        }

        if (this.lblDesc) {
            this.lblDesc.string = content || "";
        }

        if (newProgress) {
            if (this.progressBar) {
                this.progressBar.progress = 0;
            }
            if (this.lblProgress) {
                this.lblProgress.string = "0%";
            }
            this.startFakeProgress(0);
        }
    }

    /** 更新进度 */
    private onProgress(loaded: number, total: number) {
        if (this.progressBar) {
            let progress = loaded / total;
            progress = isNaN(progress) ? 0 : progress;
            if (this.progressBar.progress > progress) return;
            this.progressBar.progress = progress;
            if (this.lblProgress) {
                this.lblProgress.string = Math.round(progress * 100) + "%";
            }
        }
    }

    /** 
     * 开始一个假的进度条
     * @param dur 进度条时长 <0表示停止进度条
     * @param value 进度到多少停止
     */
    private startFakeProgress(dur: number, value = 0.99) {
        let tag = 10101;
        Tween.stopAllByTag(tag);
        if (dur <= 0) return;
        let fakeProgressObj = { value: 0 };
        tween(fakeProgressObj).tag(tag).to(dur, { value: value }, {
            onUpdate: (target, ratio) => {
                this.onProgress(fakeProgressObj.value, 1);
            },
        }).start();
    }

    /** 热更状态变化 */
    private onUpdateStateChange(code: EHotUpdateState) {
        switch (code) {
            case EHotUpdateState.CheckUpdate:
                this.setTips(LoadingText.CheckUpdate);
                break;
            case EHotUpdateState.DownloadFiles:
                this.setTips(LoadingText.DownloadUpdate);
                break;
            case EHotUpdateState.Finished:
                this.setTips(LoadingText.UpdateFinished);
                break;

        }
    }

    /** 热更资源下载进度 */
    private onUpdateDownloadProgress(loaded: number, total: number) {
        this.onProgress(loaded, total);
    }

    /**
     * 热更新结果
     */
    private onUpdateComplete(code: EHotUpdateResult) {
        mLogger.info("HotUpdate ResultCode = ", EHotUpdateResult[code]);
        if (code == EHotUpdateResult.Success) {
            app.chan.restartGame();
        } else if (code == EHotUpdateResult.Fail) {
            app.tipMsg.showConfirm(
                "版本更新失敗，請檢查網絡是否正常，重新嘗試更新!", {
                type: 1,
                cbOk: () => {
                    app.chan.restartGame();
                }
            });
        } else {//最新版本或manifest文件异常 跳过更新
            this.login()
        }
    }


    /** 从LoadingText获取多语言文本 */
    private getText(obj: ILanguage) {
        if (!obj) return "";
        return obj[app.l10n.lang];
    }


}
