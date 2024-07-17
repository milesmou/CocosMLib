import { Asset, Label, ProgressBar, TextAsset, Tween, _decorator, game, sys, tween } from 'cc';
import { PREVIEW } from 'cc/env';
import { EHotUpdateResult, EHotUpdateState, HotUpdate } from '../../../mlib/misc/HotUpdate';
import { AssetMgr } from '../../../mlib/module/asset/AssetMgr';
import { HttpRequest } from '../../../mlib/module/network/HttpRequest';
import { UIComponent } from '../../../mlib/module/ui/manager/UIComponent';
import { MCloudData } from '../../../mlib/sdk/MCloudData';
import { MResponse } from '../../../mlib/sdk/MResponse';
import { UnionProgress } from '../../../mlib/utils/UnionProgress';
import { UIConstant } from '../../gen/UIConstant';
import { GameConfig } from '../GameConfig';
import { GameData } from '../GameData';
import { GameGuide } from '../GameGuide';
import { GameInit } from '../GameInit';
import GameTable from '../GameTable';
import { ILanguage, LoadingText } from './LoadingText';
const { ccclass, property } = _decorator;


@ccclass("Loading")
export class Loading extends UIComponent {

    private _progressBar: ProgressBar = null;
    private _lblDesc: Label = null;
    private _lblProgress: Label = null;
    private _lblVersion: Label = null;

    protected onLoad(): void {
        this._progressBar = this.rc.get("progressBar", ProgressBar);
        this._lblDesc = this.rc.get("lblDesc", Label);
        this._lblProgress = this.rc.get("lblProgress", Label);
        this._lblVersion = this.rc.get("lblVersion", Label);
    }

    async start() {
        await GameInit.initBeforeLoadConfig();
        app.chan.reportEvent("开始加载配置");
        app.chan.reportEventDaily("每日开始加载配置");
        this.loadCfg();
        //版本号
        this._lblVersion.string = gameSetting.channel + "_" + gameSetting.version;
    }

    protected onDestroy(): void {
        AssetMgr.decRef(UIConstant.Loading);
    }

    /** 加载游戏配置 */
    private async loadCfg() {
        this.setTips(LoadingText.Config);
        this.startFakeProgress(2);
        if (gameSetting.gameConfigType == gameSetting.ConfigType.Local) {//使用本地配置
            let textAsset = await AssetMgr.loadAsset("GameConfig", TextAsset);
            GameConfig.deserialize(textAsset.text);
            AssetMgr.decRef("GameConfig");
            this.checkVersion();
        } else {
            let strRes = await HttpRequest.requestText(gameSetting.gameConfigUrl + "?" + Date.now(), { method: "GET" });
            if (strRes) {
                app.chan.reportEvent("加载配置成功");
                app.chan.reportEventDaily("每日加载配置成功");
                GameConfig.deserialize(strRes);
                this.checkVersion();
            } else {
                app.chan.reportEvent("加载配置失败");
                app.chan.reportEventDaily("每日加载配置失败");
                logger.error(`加载配置失败 Url=${gameSetting.gameConfigUrl}`);
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
        if (!PREVIEW) {
            if (gameSetting.hotupdate && GameConfig.rg && sys.isNative) {
                let manifest = await AssetMgr.loadAsset("project", Asset);
                if (manifest) {
                    HotUpdate.Inst.start(
                        manifest,
                        gameSetting.mainVersion,
                        this.onUpdateStateChange.bind(this),
                        this.onUpdateDownloadProgress.bind(this),
                        this.onUpdateComplete.bind(this)
                    );
                    return;
                } else {
                    logger.error("加载清单文件失败");
                }
            }
        }
        this.login();
    }

    /** 登录 */
    private login() {
        console.log("开始登录");

        app.chan.login({
            success: uid => {
                logger.debug("登录成功", uid);
                app.chan.userId = uid;
                this.syncGameData();
            },
            fail: reason => {
                logger.error("登录失败", reason);
            },
        })
    }

    /** 同步玩家数据 */
    private syncGameData() {
        this.loadRes();
        return;
        app.chan.getGameData({
            userId: app.chan.userId,
            success: (obj: MResponse) => {
                logger.debug("获取数据成功", obj);
                if (obj.code == 100 && obj.data) {
                    let cData = obj.data as MCloudData;
                    if (cData.updateTime * 1000 > GameData.Inst.time) {
                        logger.debug("使用云存档");
                        GameData.Inst.replaceGameData(cData.data);
                    } else {
                        logger.debug("使用本地存档");
                    }
                } else {
                    logger.debug("无云存档数据");
                }
                this.loadRes();
            },
            fail: () => {
                logger.error("获取数据失败");
                this.loadRes();
            },
        })
    }

    /** 加载游戏资源 */
    private async loadRes() {

        let unionProgress = new UnionProgress();

        //加载游戏数据
        this.setTips(LoadingText.LoadGameRes);
        unionProgress.init(this.onProgress.bind(this), 2);

        //加载资源包
        await AssetMgr.loadBundles(null, unionProgress.getOnProgress("AllBundle"));

        //加载数据表
        await GameTable.initData(unionProgress.getOnProgress("Table"));


        await app.timer.dealy();

        //加载场景
        this.setTips(LoadingText.LoadScene);
        unionProgress.init(this.onProgress.bind(this), 2);

        app.chan.reportEvent("解析配置完成");
        app.chan.reportEventDaily("每日解析配置完成");

        await GameGuide.Inst.checkShowGuide();

        //初始化游戏内容
        await GameInit.initBeforeEnterHUD();

        await app.ui.showHigher(UIConstant.UIWait, { visible: false, onProgress: unionProgress.getOnProgress("UIWait") });

        await app.ui.show(UIConstant.UIHUD, { bottom: true, onProgress: unionProgress.getOnProgress("UIHUD") });


        await app.timer.dealy(0.15);

        this.node.destroy();

    }

    private async restart() {

    }

    /** 
     * 设置加载界面提示文字并重置进度条
     */
    private setTips(obj: ILanguage) {
        let content = this.getText(obj);
        if (this._lblDesc) {
            this._lblDesc.string = content || "";
        }
        if (this._progressBar) {
            this._progressBar.progress = 0;
        }
        this.startFakeProgress(0);
    }

    /** 更新进度 */
    private onProgress(loaded: number, total: number) {
        if (this._progressBar) {
            let progress = loaded / total;
            progress = isNaN(progress) ? 0 : progress;
            if (this._progressBar.progress > progress) return;
            this._progressBar.progress = progress;
            if (this._lblProgress) {
                this._lblProgress.string = Math.round(progress * 100) + "%";
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
        logger.print("HotUpdate ResultCode = ", EHotUpdateResult[code]);
        if (code == EHotUpdateResult.Success) {
            game.restart();
        } else if (code == EHotUpdateResult.Fail) {
            app.tipMsg.showConfirm(
                "版本更新失敗，請檢查網絡是否正常，重新嘗試更新!", {
                type: 1,
                cbOk: () => {
                    game.restart();
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
