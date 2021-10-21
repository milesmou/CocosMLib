import { HotUpdate, HotUpdateCode } from "../utils/HotUpdate";
import UIMgr from "../manager/UIMgr";
import { app } from "../App";
import { Utils } from "../utils/Utils";
import { DataManager } from "../../script/game/DataManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Loading extends cc.Component {
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
        this.node.opacity = 255;
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
        await this.loadGameData("data");
        let obj = { x: 0 };
        cc.tween(obj).to(1.5, { x: 1 }, {
            progress: (start, end, curent, ratio) => {
                let v = cc.misc.lerp(curent, end, ratio);
                this.progressBar.progress = v;
                this.lblProgress.string = Math.floor(v * 100) + "%";
                return v;
            }
        })
            .call(() => {
                app.ui.show(app.uiKey.UIMenu, {
                    onShow: () => {
                        this.node.destroy();
                    }
                });
            })
            .start();
    }

    setTips(content: string) {
        this.lblDesc.string = content;
        this.progressBar.progress = 0;
    }

    onProgress(loaded: number, total: number) {
        let progress = loaded / total;
        progress = isNaN(progress) ? 0 : progress;
        if (this.progressBar.progress > progress) return;
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
            cc.audioEngine.stopAll();
            cc.game.restart();
        } else if (code == HotUpdateCode.Fail) {
            UIMgr.Inst.tipMsg.showTipBox(
                "版本更新失敗，請檢查網絡是否正常，重新嘗試更新!", {
                boxType: 1,
                cbConfirm: () => {
                    cc.audioEngine.stopAll();
                    cc.game.restart();
                }
            }

            );
        } else {//最新版本或manifest文件异常 跳过更新
            this.loadRes()
        }
    }

    async loadGameData(dir: string) {
        let paths: string[] = [];
        let fileInfos = cc.resources.getDirWithPath(dir);
        fileInfos.forEach((v: { uuid: string, path: string }) => {
            let fileName = v.path.substr(v.path.lastIndexOf("/") + 1);
            if (fileName.startsWith("Language")) {
                if (fileName.endsWith(app.lang)) {
                    paths.push(v.path);
                }
            } else {
                paths.push(v.path);
            }
        });
        let gameDatas = await Utils.loadArray(paths, cc.JsonAsset, this.onProgress.bind(this));
        DataManager.Inst.initData(gameDatas as any);
    }

}
