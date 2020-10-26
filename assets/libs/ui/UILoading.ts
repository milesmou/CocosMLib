import { HotUpdate, HotUpdateCode } from "../utils/HotUpdate";
import UIBase from "./UIBase";

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
        return new Promise((resolve, reject) => {
            if (cc.sys.isNative && this.hotUpdate && this.manifest) {
                new HotUpdate(
                    this.manifest,
                    this.onProgress.bind(this),
                    code => {
                        this.complete(code);
                        this.loadRes().then(() => {
                            resolve();
                        });
                    },
                    this.showDesc.bind(this)
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
            this.showDesc("正在加载...");
            cc.tween(this.progressBar)
                .to(
                    1.5, { progress: 1 },
                    {
                        progress: (start, end, current, ratio) => {
                            let num = start + (end - start) * ratio;
                            this.onProgress(num, 1);
                            return num;
                        }
                    })
                .call(() => {
                    resolve();
                })
                .start()
        })
    }

    onProgress(loaded: number, total: number) {
        this.lblProgress.string = Math.round(loaded / total * 100) + "%";
    }

    complete(code: HotUpdateCode) {
        console.log("complete resultCode = ", code);
    }

    showDesc(content: string) {
        this.lblDesc.string = content;
    }

}
