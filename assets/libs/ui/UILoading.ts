import { EventMgr, GameEvent } from "../utils/EventMgr";
import { HotUpdate, HotUpdateCode } from "../utils/HotUpdate";
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
        tooltip: "本地project.manifest文件",
        visible: function () { return this.hotUpdate }
    })
    manifest: cc.Asset = null;

    start() {
        this.loadCfg();
    }

    loadCfg() {
        this.setTips("Loading Config")
        // Utils.loadRemote("http://localhost/GameConfig.json?" + Date.now())
        //     .then((v: cc.JsonAsset) => {
        //         if (this.hotUpdate && this.manifest && cc.sys.isNative) {
        //             this.checkVersion();
        //         } else {
        //             this.loadRes()
        //         }
        //     })
        //     .catch(() => {
        //         UIManager.Inst.tipMseeage.showTipBox(
        //             "遊戲配置加載失敗，請檢查網絡是否正常！", 1,
        //             () => {
        //                 this.loadCfg();
        //             }
        //         );
        //     })
        this.loadRes();
    }

    checkVersion() {
        HotUpdate.Inst.start(
            this.manifest,
            this.setTips.bind(this),
            this.onProgress.bind(this),
            this.complete.bind(this)
        );
    }

    async loadRes() {
        //加载游戏数据
        this.setTips("Loading Game Data")
        // let gameDatas = await Utils.loadDir("data", this.onProgress.bind(this));
        // for (const v of gameDatas) {
        //     if (v.name == "GameData") {
        //         DataManager.Inst.initData((v as cc.JsonAsset).json);
        //     } else if (v.name == "Language") {
        //         Language.init((v as cc.JsonAsset).json["Language"], null);
        //     }
        // }
        //加载ui
        // if (cc.sys.isBrowser) {
        //     this.setTips("Loading Game Scene")
        //     await Utils.loadDir("ui", this.onProgress.bind(this));
        // }
        // //加载壁纸
        // let wallpaperId = StroageMgr.Inst.getNumber(StroageDict.WallpaperId, DataManager.Inst.globalVal.InitWallpaper);
        // let videoId = DataManager.Inst.wallpapers[wallpaperId].ResID;
        // let videoRes = await Utils.load("texture/wallpaper/" + videoId);
        // BGVideoPlayer.Inst.setBGVideo(videoRes);
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
                "版本更新完成，需要重啟遊戲！", 1,
                () => {
                    cc.audioEngine.stopAll();
                    cc.game.restart();
                }
            );
        } else if (code == HotUpdateCode.Fail) {
            UIManager.Inst.tipMseeage.showTipBox(
                "版本更新失敗，請檢查網絡是否正常，重新嘗試更新!", 1,
                () => {
                    cc.audioEngine.stopAll();
                    cc.game.restart();
                }
            );
        } else {//最新版本或manifest文件异常 跳过更新
            this.loadRes()
        }
    }

}
