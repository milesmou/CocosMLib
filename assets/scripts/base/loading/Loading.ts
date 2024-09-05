import { Label, ProgressBar, TextAsset, Tween, _decorator, game, sys, tween } from 'cc';
import { PREVIEW } from 'cc/env';
import { EHotUpdateResult, EHotUpdateState, HotUpdate } from '../../../mlib/misc/HotUpdate';
import { AssetMgr } from '../../../mlib/module/asset/AssetMgr';
import { HttpRequest } from '../../../mlib/module/network/HttpRequest';
import { UIComponent } from '../../../mlib/module/ui/manager/UIComponent';
import { MResponse, ResponseGameData } from '../../../mlib/sdk/MResponse';
import { UnionProgress } from '../../../mlib/utils/UnionProgress';
import { UIConstant } from '../../gen/UIConstant';
import { GameData } from '../GameData';
import { GameGuide } from '../GameGuide';
import { GameInit } from '../GameInit';
import GameTable from '../GameTable';
import { ILanguage, LoadingText } from './LoadingText';
const { ccclass, property } = _decorator;


@ccclass("Loading")
export class Loading extends UIComponent {

    private get lblDesc() { return this.rc.get("lblDesc", Label); }
    private get progressBar() { return this.rc.get("progressBar", ProgressBar); }
    private get lblProgress() { return this.rc.get("lblProgress", Label); }
    private get lblVersion() { return this.rc.get("lblVersion", Label); }

    protected async start() {
        await GameInit.initBeforeLoadConfig();
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
        if (mGameSetting.gameConfigType == mGameSetting.ConfigType.Local) {//使用本地配置
            let textAsset = await AssetMgr.loadAsset("GameConfig", TextAsset);
            mGameConfig.deserialize(textAsset.text);
            AssetMgr.decRef("GameConfig");
            this.checkVersion();
        } else {
            let strRes = await HttpRequest.requestText(mGameSetting.gameConfigUrl + "?" + Date.now(), { method: "GET" });
            if (strRes) {
                mGameConfig.deserialize(strRes);
                this.checkVersion();
            } else {
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
        if (!PREVIEW) {
            if (mGameSetting.hotupdate && mGameConfig.rg && sys.isNative) {
                if (mGameSetting.manifest) {
                    HotUpdate.Inst.start(
                        mGameSetting.manifest,
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
        mLogger.info("开始登录");

        app.chan.login({
            success: uid => {
                mLogger.debug("登录成功", uid);
                app.chan.userId = uid;
                this.syncGameData();
            },
            fail: reason => {
                mLogger.error("登录失败", reason);
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
                mLogger.debug("获取数据成功", obj);
                if (obj.code == 100 && obj.data) {
                    let cData = obj.data as ResponseGameData;
                    if (cData.updateTime * 1000 > GameData.Inst.time) {
                        mLogger.debug("使用云存档");
                        GameData.Inst.replaceGameData(cData.data);
                    } else {
                        mLogger.debug("使用本地存档");
                    }
                } else {
                    mLogger.debug("无云存档数据");
                }
                this.loadRes();
            },
            fail: () => {
                mLogger.error("获取数据失败");
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
        await AssetMgr.loadBundles(null, { onProgress: unionProgress.getOnProgress("AllBundle") });

        //加载数据表
        await GameTable.initData(unionProgress.getOnProgress("Table"));


        await app.timer.dealy();

        //加载场景
        this.setTips(LoadingText.LoadScene);
        unionProgress.init(this.onProgress.bind(this), 2);

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
        if (this.lblDesc) {
            this.lblDesc.string = content || "";
        }
        if (this.progressBar) {
            this.progressBar.progress = 0;
            this.onProgress(0, 1);
        }
        this.startFakeProgress(0);
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
        mLogger.print("HotUpdate ResultCode = ", EHotUpdateResult[code]);
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
