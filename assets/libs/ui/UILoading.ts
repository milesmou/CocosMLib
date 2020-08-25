import UIBase from "./UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UILoading extends UIBase {
    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;
    @property(cc.Label)
    labelProgress: cc.Label = null;


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

}
