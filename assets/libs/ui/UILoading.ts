import { HotUpdate, HotUpdateCode } from "../utils/HotUpdate";
import UIBase from "./UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UILoading extends UIBase {
    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;
    @property(cc.Label)
    labelProgress: cc.Label = null;

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
        return new Promise((resolve, reject) => {
            if (this.hotUpdate && this.manifest) {
                new HotUpdate(
                    this.manifest,
                    this.onProgress.bind(this),
                    code => {
                        this.complete(code);
                        this.loadRes().then(() => {
                            resolve();
                        });
                    }
                );
            } else {
                this.loadRes().then(() => {
                    resolve();
                });
            }
        });
    }

    loadRes() {
        return new Promise((resolve, reject) => {
            cc.tween(this.progressBar)
                .to(
                    1.5, { progress: 1 },
                    {
                        progress: (start, end, current, ratio) => {
                            let num = start + (end - start) * ratio;
                            this.labelProgress.string = `${Math.floor(num * 100)}%`;
                            return num;
                        }
                    })
                .call(() => {
                    resolve();
                })
                .start()
        })
    }

    onProgress(completedCount: number, totalCount: number) {
        console.log(`progress ${completedCount} / ${totalCount}`);

    }

    complete(code: HotUpdateCode) {
        console.log("complete resultCode = ",code);
    }

}
