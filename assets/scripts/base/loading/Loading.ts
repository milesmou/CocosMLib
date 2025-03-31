import { Asset, Label, ProgressBar, TextAsset, Tween, _decorator, loadWasmModuleSpine, sys, tween } from 'cc';
import { PREVIEW } from 'cc/env';
import { TimeDuration } from 'db://assets/mlib/module/timer/TimeDuration';
import { EHotUpdateResult, EHotUpdateState, HotUpdate } from '../../../mlib/misc/HotUpdate';
import { AssetMgr } from '../../../mlib/module/asset/AssetMgr';
import { HttpRequest } from '../../../mlib/module/network/HttpRequest';
import { UIComponent } from '../../../mlib/module/ui/manager/UIComponent';
import { UIForm } from '../../../mlib/module/ui/manager/UIForm';
import { UnionProgress } from '../../../mlib/utils/UnionProgress';
import { GameTool } from '../../game/GameTool';
import { UIConstant } from '../../gen/UIConstant';
import { StageModel } from '../../ui/guanka/StageModel';
import { MapUtil } from '../../ui/Map/MapUtil';
import { GameData } from '../GameData';
import { EventKey } from '../GameEnum';
import { GameInit } from '../GameInit';
import GameTable from '../GameTable';
import { GameGuide } from '../guide/GameGuide';
import { ThinkingDataCollect } from '../publish/sdk/thinkingdata/ThinkingDataCollect';
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

    async start() {
        await GameInit.initBeforeLoadConfig();

        //打点
        app.chan.reportEventLifetime(mReportEvent.init_newUser_lifetime, null, "NOZQY");
        app.chan.reportEvent(mReportEvent.init_loading_start, null, "NOZQY");
        app.chan.reportEventDaily(mReportEvent.init_loading_start_daily, null, "NOZQY");

        //数数打点
        app.chan.reportEvent(mReportEvent.init_loading_start, null, "SS");
        // mLogger.debug("----------新玩家登陆流程KIN--------------" + "2加载远程配置");

        TimeDuration.time("Loading");

        this.loadCfg();
        //版本号
        this.lblVersion.string = mGameSetting.channel + "_" + mGameSetting.version;
    }

    protected onDestroy(): void {
        AssetMgr.decRef(UIConstant.Loading);
    }

    /** 加载游戏配置 */
    private async loadCfg() {
        this.setTips(LoadingText.Config);
        this.startFakeProgress(2);
        TimeDuration.time("loadCfg");
        if (mGameSetting.gameConfigType == mGameSetting.ConfigType.Local) {//使用本地配置
            let textAsset = await AssetMgr.loadAsset("GameConfig", TextAsset);
            mGameConfig.deserialize(textAsset.text);
            AssetMgr.decRef("GameConfig");
            this.checkVersion();
        } else {
            let strRes = await HttpRequest.requestText(mGameSetting.gameConfigUrl + "?" + Date.now(), { method: "GET" });
            if (strRes) {
                //打点
                app.chan.reportEvent(mReportEvent.init_get_config_success, null, "NOZQY");
                app.chan.reportEventDaily(mReportEvent.init_get_config_success_daily, null, "NOZQY");

                //数数打点
                app.chan.reportEvent(mReportEvent.init_get_config_success, null, "SS");
                // mLogger.debug("----------新玩家登陆流程KIN--------------" + "3加载配置成功");
                mGameConfig.deserialize(strRes);
                this.checkVersion();
            } else {
                //打点
                app.chan.reportEvent(mReportEvent.init_get_config_fail, null, "NOZQY");
                app.chan.reportEventDaily(mReportEvent.init_get_config_fail_daily, null, "NOZQY");

                //数数打点
                app.chan.reportEvent(mReportEvent.init_get_config_fail, null, "SS");

                mLogger.error(`加载配置失败 Url=${mGameSetting.gameConfigUrl}`);
                app.tipMsg.showConfirm(this.getText(LoadingText.ConfigFail), {
                    type: 1, cbOk: () => {
                        this.loadCfg();
                    }
                });
            }
        }
    }

    /** 版本更新检测 */
    private async checkVersion() {
        TimeDuration.timeEndLog("loadCfg");
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
        this.login();
    }

    /** 登录 */
    private login() {
        TimeDuration.time("login");
        this.setTips(LoadingText.Login, false);
        app.chan.login({
            success: user => {
                mLogger.debug("登录成功", user);
                ThinkingDataCollect.Inst.login(user.id);
                app.chan.user = user;
                this.uUID.string = "UUID：" + user.id;
                this.syncGameData();
                app.chan.reportEventLifetime(mReportEvent.init_sdk_login_success, null, "NOZQY");
                app.chan.reportEventDaily(mReportEvent.init_sdk_login_success_daily, null, "NOZQY");

                //数数打点
                app.chan.reportEvent(mReportEvent.init_sdk_login_success, null, "SS");
                // mLogger.debug("----------新玩家登陆流程KIN--------------" + "4第三方SDK加载成功（掌趣游登录）");
            },
            fail: reason => {
                mLogger.error("登录失败", reason);
            },
        })
    }

    /** 同步玩家数据 */
    private syncGameData() {
        TimeDuration.timeEndLog("login");
        // this.loadRes();
        // return;
        //加载游戏数据
        this.setTips(LoadingText.SyncGameData);
        TimeDuration.time("syncGameData");
        app.chan.getGameData({
            userId: app.chan.user.id,
            success: args => {
                let localSaveTime = GameData.getSaveTime();
                mLogger.debug("获取数据成功", args, localSaveTime);
                if (args.data) {
                    mLogger.debug(`存档时间 云端:${new Date(args.updateTimeMS).toLocaleString()} 本地:${new Date(localSaveTime).toLocaleString()}`);
                    if (args.updateTimeMS > localSaveTime) {
                        if (!sys.isNative) {
                            mLogger.debug("使用云存档");
                            GameData.replaceGameData(args.data);
                        } else {
                            mLogger.debug("原生暂时不使用云存档");
                        }
                    } else {
                        mLogger.debug("使用本地存档");
                    }
                } else {
                    mLogger.debug("无云存档数据");
                }
                this.loadRes();
            },
            fail: () => {
                this.loadRes();
            },
        })
    }

    /** 加载游戏资源 */
    private async loadRes() {
        //TODO 加一步，开始加载资源
        TimeDuration.timeEndLog("syncGameData");

        let unionProgress = new UnionProgress();

        //加载游戏数据
        this.setTips(LoadingText.LoadGameRes);
        unionProgress.init(this.onProgress.bind(this), 2);
        //数数打点
        app.chan.reportEvent(mReportEvent.loadWasmModuleSpine, null, "SS");
        // mLogger.debug("----------新玩家登陆流程KIN--------------" + "5开始远程加载SPINE组建");
        TimeDuration.time("loadWasmModuleSpine");
        this.des2.string = "H";
        await loadWasmModuleSpine();
        TimeDuration.timeEndLog("loadWasmModuleSpine");

        //加载资源包
        //数数打点
        app.chan.reportEvent(mReportEvent.loadBundleDynamic, null, "SS");
        // mLogger.debug("----------新玩家登陆流程KIN--------------" + "6开始远程加载必须的UI资源");
        TimeDuration.time("loadBundle dynamic");
        this.des2.string = "I";
        await AssetMgr.loadBundles(["dynamic"], { onProgress: unionProgress.getOnProgress("1") });
        TimeDuration.timeEndLog("loadBundle dynamic");

        //加载数据表
        //数数打点
        app.chan.reportEvent(mReportEvent.loadTable, null, "SS");
        // mLogger.debug("----------新玩家登陆流程KIN--------------" + "7开始远程加载数据表文件");
        TimeDuration.time("load table");
        this.des2.string = "J";
        await GameTable.initData(unionProgress.getOnProgress("2"));
        TimeDuration.timeEndLog("load table");


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

        ThinkingDataCollect.Inst.enableSuperProperties();

        /** 未通过第一关的新用户 */
        let isNewUser = !GameTool.isPassedFirstStage;
        if (!isNewUser) {
            //加载场景
            this.setTips(LoadingText.LoadScene);
            unionProgress.init(this.onProgress.bind(this), 2);
            TimeDuration.time("load UIHUD");
            this.des2.string = "L";
            await app.ui.show(UIConstant.UIHUD, { bottom: true, onProgress: unionProgress.getOnProgress("1") });
            TimeDuration.timeEndLog("load UIHUD");
            //加载地图
            TimeDuration.time("loadMap");
            this.des2.string = "M";
            await MapUtil.loadMap(unionProgress.getOnProgress("2"));
            TimeDuration.timeEndLog("loadMap");
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

        this.des2.string = "O";
        //初始化游戏内容
        GameInit.initAfterEnterHUD();
        this.des2.string = "P";

        TimeDuration.timeEndLog("Loading");
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
     */
    private startFakeProgress(dur: number) {
        let tag = 10101;
        Tween.stopAllByTag(tag);
        if (dur <= 0) return;
        let fakeProgressObj = { value: 0 };
        tween(fakeProgressObj).tag(tag).to(dur, { value: 0.99 }, {
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
