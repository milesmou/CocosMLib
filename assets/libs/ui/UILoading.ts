import { EventMgr, GameEvent } from "../utils/EventMgr";
import { HotUpdate, HotUpdateCode } from "../utils/HotUpdate";
import { Utils } from "../utils/Utils";
import UIBase from "./UIBase";
import { UIManager } from "./UIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UILoading extends UIBase {
    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;
    @property(cc.Label)
    lblDesc: cc.Label = null;
    @property(cc.Label)
    lblProgress: cc.Label = null;

    @property({
        tooltip: "原生平台是否要开启热更新"
    })
    hotUpdate = false;
    @property({
        type: cc.Asset,
        tooltip: "本地version.manifest文件",
        visible: function () { return this.hotUpdate }
    })
    manifest: cc.Asset = null;

    load() {
        if (this.hotUpdate && this.manifest && cc.sys.isNative) {
            HotUpdate.Inst.start(
                this.manifest,
                this.setTips.bind(this),
                this.onProgress.bind(this),
                this.complete.bind(this)
            );
        } else {
            this.loadCfg()
        }
    }

    loadCfg() {
        this.loadRes(); return;
        Utils.loadRemote("https://localhost:8080/GameConfig.json?" + Date.now())
            .then((v: cc.JsonAsset) => {
                this.loadRes();
            })
            .catch(() => {
                UIManager.Inst.tipMseeage.showTipBox(
                    "游戏配置加载失败，请检查网络是否正常！", 1,
                    () => {
                        this.load();
                    }
                );
            })
    }

    async loadRes() {
        //加载游戏数据
        // this.setTips({ "zh": "加载中...", "zh_ft": "蒌入中⋯" }[mm.lang])
        // let gameDatas = await Utils.loadDir("data", this.onProgress.bind(this));
        //加载ui
        // if (cc.sys.isBrowser) {
        //     this.setTips({ "zh": "加载场景资源...", "zh_ft": "蒌入场景资源⋯" }[mm.lang])
        //     await Utils.loadDir("ui", this.onProgress.bind(this));
        // }
        //加载壁纸
        EventMgr.emit(GameEvent.EnterGameScene);
    }

    setTips(content: string) {
        this.lblDesc.string = content;
    }

    onProgress(loaded: number, total: number) {
        let progress = loaded / total;
        progress = isNaN(progress) ? 0 : progress;
        if (this.progressBar.progress != 1 && this.progressBar.progress > progress) return;
        this.lblProgress.string = Math.round(progress * 100) + "%";
        this.progressBar.progress = progress;
    }

    /**
     * 热更新结果
     * @param code undefined:未进行热更新 
     */
    complete(code?: HotUpdateCode) {
        console.log("HotUpdate ResultCode = ", code);
        if (code == HotUpdateCode.Success) {
            UIManager.Inst.tipMseeage.showTipBox(
                "版本更新完成，需要重启游戏！", 1,
                () => {
                    cc.audioEngine.stopAll();
                    cc.game.restart();
                }
            );
        } else if (code == HotUpdateCode.Fail) {
            UIManager.Inst.tipMseeage.showTipBox(
                "版本更新失败，请检查网络是否正常，重新尝试更新!", 1,
                () => {
                    cc.audioEngine.stopAll();
                    cc.game.restart();
                }
            );
        } else if (code == HotUpdateCode.UpToDate) {
            this.loadCfg()
        }
    }

}
