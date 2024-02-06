import { Asset, Label, ProgressBar, TextAsset, Tween, _decorator, game, native, sys, tween } from 'cc';
import { App } from '../../../mlib/App';
import { EGameConfigType, GameSetting } from '../../../mlib/GameSetting';
import { EHotUpdateResult, EHotUpdateState, HotUpdate } from '../../../mlib/misc/HotUpdate';
import { AssetMgr } from '../../../mlib/module/asset/AssetMgr';
import { MLogger } from '../../../mlib/module/logger/MLogger';
import { HttpRequest } from '../../../mlib/module/network/HttpRequest';
import { UIComponent } from '../../../mlib/module/ui/manager/UIComponent';
import { MCloudData } from '../../../mlib/sdk/MCloudData';
import { MResponse } from '../../../mlib/sdk/MResponse';
import { UIConstant } from '../../gen/UIConstant';
import { GameConfig } from '../GameConfig';
import { GameData } from '../GameData';
import { GameGuide } from '../GameGuide';
import { GameInit } from '../GameInit';
const { ccclass, property } = _decorator;


@ccclass("Loading")
export class Loading extends UIComponent {

    private _progressBar: ProgressBar = null;
    private _lblDesc: Label = null;
    private _lblProgress: Label = null;
    private _lblVersion: Label = null;

    //假进度条
    fakeProgressTween: Tween<{ value: number }>;
    fakeProgressObj = { value: 0 };

    protected onLoad(): void {
        this._progressBar = this.rc.get("progressBar", ProgressBar);
        this._lblDesc = this.rc.get("lblDesc", Label);
        this._lblProgress = this.rc.get("lblProgress", Label);
        this._lblVersion = this.rc.get("lblVersion", Label);
    }

    async start() {
        await GameInit.initBeforeLoadRes();
        this.loadCfg(true);
        //版本号
        this._lblVersion.string = GameSetting.Inst.channel + "_" + GameSetting.Inst.version;
    }

    protected onDestroy(): void {
        AssetMgr.DecRef("Loading");
    }

    /** 加载游戏配置 */
    async loadCfg(first = false) {
        first && this.setTips(LoadingLanguage.Config);

        if (GameSetting.Inst.gameConfigType == EGameConfigType.Local) {//使用本地配置
            let textAsset = await AssetMgr.loadAsset("GameConfig", TextAsset);
            GameConfig.deserialize(textAsset.text);
            AssetMgr.DecRef("GameConfig");
            this.checkVersion();
        } else {
            let strRes = await HttpRequest.requestRepeat(GameSetting.Inst.gameConfigUrl + "?" + Date.now(), v => v, 3, 1);
            if (strRes) {
                GameConfig.deserialize(strRes);
                this.checkVersion();
            } else {
                MLogger.error(`加载配置失败 Url=${GameSetting.Inst.gameConfigUrl}`);
                App.tipMsg.showToast(this.getText(LoadingLanguage.ConfigFail));
                this.loadCfg();
            }
        }
    }

    /** 版本更新检测 */
    async checkVersion() {

        if (GameSetting.Inst.hotupdate && GameConfig.rg && sys.isNative) {
            let manifest = await AssetMgr.loadAsset("project", Asset);
            if (manifest) {
                HotUpdate.Inst.start(
                    manifest,
                    GameSetting.Inst.mainVersion,
                    this.onUpdateStateChange.bind(this),
                    this.onUpdateDownloadProgress.bind(this),
                    this.onUpdateComplete.bind(this)
                );
                return;
            } else {
                MLogger.error("加载清单文件失败");
            }
        }
        this.login();
    }

    /** 登录 */
    login() {
        App.chan.login({
            success: uid => {
                MLogger.debug("登录成功", uid);
                App.chan.userId = uid;
                this.syncGameData();
            },
            fail: reason => {
                MLogger.error("登录失败", reason);
            },
        })
    }

    /** 同步玩家数据 */
    syncGameData() {
        App.chan.getGameData({
            userId: App.chan.userId,
            success: (obj: MResponse) => {
                MLogger.debug("获取数据成功", obj);
                if (obj.code == 100 && obj.data) {
                    let cData = obj.data as MCloudData;
                    if (cData.updateTime * 1000 > GameData.Inst.time) {
                        MLogger.debug("使用云存档");
                        GameData.Inst.replaceGameData(cData.data);
                        GameData.clear();
                    } else {
                        MLogger.debug("使用本地存档");
                    }
                } else {
                    MLogger.debug("无云存档数据");
                }
                this.loadRes();
            },
            fail: () => {
                MLogger.error("获取数据失败");
                this.loadRes();
            },
        })
    }

    /** 加载游戏资源 */
    async loadRes() {
        //加载游戏数据
        this.setTips(LoadingLanguage.LoadGameRes);

        //加载场景
        this.setTips(LoadingLanguage.LoadScene, 2);

        this.onProgress(1, 1);

        await GameGuide.Inst.checkShowGuide();

        //初始化游戏内容
        await GameInit.initBeforeEnterHUD();

        await App.ui.show(UIConstant.UIHUD);

        this.node.destroy();

    }

    /** 设置加载界面提示文字 */
    setTips(obj: ILanguage, fakeProgressDur: number = 1) {
        let content = this.getText(obj);
        if (this._lblDesc) {
            this._lblDesc.string = content || "";
        }
        if (this._progressBar) {
            this._progressBar.progress = 0;
        }
        this.startFakeProgress(fakeProgressDur);
    }

    /** 更新进度 */
    onProgress(loaded: number, total: number) {
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

    /** 开始一个假的进度条 */
    startFakeProgress(dur: number) {
        if (this.fakeProgressTween) {
            this.fakeProgressTween.stop();
        }
        tween(4).to(2, 1);
        this.fakeProgressTween = tween(this.fakeProgressObj).to(dur, { value: 1 }, {
            progress: (start, end, current, ratio) => {
                let v = start + (end - start) * ratio;
                this.onProgress(v, end);
                return v;
            }
        });
        this.fakeProgressObj.value = 0;
        this.fakeProgressTween.start();
    }


    /** 热更状态变化 */
    onUpdateStateChange(code: EHotUpdateState) {
        switch (code) {
            case EHotUpdateState.CheckUpdate:
                this.setTips(LoadingLanguage.CheckUpdate, 0.15);
                break;
            case EHotUpdateState.DownloadFiles:
                this.setTips(LoadingLanguage.DownloadUpdate);
                break;
            case EHotUpdateState.Finished:
                this.setTips(LoadingLanguage.UpdateFinished);
                break;

        }
    }

    /** 热更资源下载进度 */
    onUpdateDownloadProgress(loaded: number, total: number) {
        this.onProgress(loaded, total);
    }

    /**
     * 热更新结果
     */
    onUpdateComplete(code: EHotUpdateResult) {
        MLogger.print("HotUpdate ResultCode = ", EHotUpdateResult[code]);
        if (code == EHotUpdateResult.Success) {
            game.restart();
        } else if (code == EHotUpdateResult.Fail) {
            App.tipMsg.showConfirm(
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


    /** 从LoadingLanguage获取多语言文本 */
    getText(obj: ILanguage) {
        if (!obj) return "";
        return obj[App.l10n.lang];
    }


}

interface ILanguage {
    sc: string;
    tc: string;
    en: string;
}

/** Loading界面的文本多语言配置 */
const LoadingLanguage: { [key: string]: ILanguage } = {
    Config: { sc: "加载配置中", tc: "加載配置中", en: "Loading Config" },
    ConfigFail: { sc: "加载配置失败,请检查网络", tc: "加載配置失敗,請檢查網絡", en: "Loading configuration failed, please check the network" },
    CheckUpdate: { sc: "检查更新中", tc: "加載配置中", en: "Loading Config" },
    DownloadUpdate: { sc: "下载更新中", tc: "加載配置中", en: "Loading Config" },
    UpdateFinished: { sc: "更新完成", tc: "加載配置中", en: "Loading Config" },
    Login: { sc: "登录中", tc: "登錄中", en: "Login" },
    SyncGameData: { sc: "数据同步中", tc: "數據同步中", en: "Sync PlayerData" },
    LoadGameRes: { sc: "加载游戏资源", tc: "加載遊戲資源", en: "Loading GameData" },
    LoadScene: { sc: "加载场景", tc: "加載場景", en: "Loading Scene" },
}
