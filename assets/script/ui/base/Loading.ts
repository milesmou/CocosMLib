import { Asset, Component, Label, ProgressBar, TextAsset, UITransform, _decorator, game, sys, tween, v3 } from 'cc';
import { App, EGameConfigType } from '../../../mlib/App';
import { AssetMgr } from '../../../mlib/manager/AssetMgr';
import { HotUpdate, HotUpdateCode } from '../../../mlib/utils/HotUpdate';
import { GameConfig } from '../../base/GameConfig';
import { GameData } from '../../base/GameData';
import GameTable from '../../base/GameTable';
import { UIConstant } from '../../gen/UIConstant';
const { ccclass, property } = _decorator;


@ccclass('Loading')
export class Loading extends Component {

    @property(ProgressBar)
    progressBar: ProgressBar | null = null;
    @property(Label)
    lblDesc: Label | null = null;
    @property(Label)
    lblProgress: Label | null = null;

    start() {
        let transform = this.getComponent(UITransform);
        if (transform) {
            this.node.scale = v3(1, 1);
        }
        this.loadCfg();
    }
    loadCfg() {
        this.setTips("Loading Config")
        if (App.config.gameConfigType == EGameConfigType.Local) {
            GameConfig.deserialize(App.config.gameConfigText);
            this.loadRes();
        } else {
            AssetMgr.loadRemoteAsset(App.config.gameConfigUrl + "?" + Date.now()).then((v: TextAsset) => {
                GameConfig.deserialize(v.text);
                v.destroy();
                if (App.config.hotupdateManifest && GameConfig.rg && sys.isNative) {
                    this.checkVersion();
                } else {
                    this.loadRes();
                }
            }).catch(err => {
                console.error(`加载配置失败 Url=${App.config.gameConfigUrl} ${err}`);
                if (App.config.gameConfigType == EGameConfigType.Remote) {
                    this.loadCfg();
                } else {
                    this.loadRes();
                }
            })
        }
    }

    loadGameData(){
        
    }

    checkVersion() {
        HotUpdate.Inst.start(
            App.config.hotupdateManifest,
            this.setTips.bind(this),
            this.onProgress.bind(this),
            this.complete.bind(this)
        );
    }
    async loadRes() {
        //加载游戏数据
        this.setTips("Loading Game Data")

        await AssetMgr.loadAllBundle();

        await GameTable.Inst.initData()

        await App.ui.init();

        GameData.Inst.init();

        let obj = { x: 0 };
        tween(obj)
            .to(1, { x: 1 }, {
                progress: (start, end, curent, ratio) => {
                    let v = start + (end - start) * ratio;

                    if (this.progressBar) {
                        this.progressBar.progress = v;
                    }
                    if (this.lblProgress) {
                        this.lblProgress.string = Math.floor(v * 100) + "%";
                    }
                    return v;
                }
            })
            .call(() => {
                App.ui.show(UIConstant.UIHUD).then(() => {
                    this.node.destroy();
                })
            })
            .start();
    }
    setTips(content: string) {
        if (this.lblDesc) {
            this.lblDesc.string = content;
        }
        if (this.progressBar) {
            this.progressBar.progress = 0;
        }
    }

    onProgress(loaded: number, total: number) {
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
     * 热更新结果
     * @param code undefined:未进行热更新 
     */
    complete(code?: HotUpdateCode) {
        console.log("HotUpdate ResultCode = ", code);
        if (code == HotUpdateCode.Success) {
            game.restart();
        } else if (code == HotUpdateCode.Fail) {
            App.ui.showConfirm(
                "版本更新失敗，請檢查網絡是否正常，重新嘗試更新!", 1,
                () => {
                    game.restart();
                }
            );
        } else {//最新版本或manifest文件异常 跳过更新
            this.loadRes()
        }
    }
}
