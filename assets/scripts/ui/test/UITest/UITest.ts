import { _decorator, AssetManager, resources } from 'cc';
import { MButton } from '../../../../mlib/module/ui/extend/MButton';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';
const { ccclass, property } = _decorator;

@ccclass('UITest')
export class UITest extends UIBase {
    protected onClickButton(btnName: string, btn: MButton): void {
        switch (btnName) {
            case "Preload":
                resources.preload("TestPreload", (finished: number, total: number, item: AssetManager.RequestItem) => {
                    console.log("预加载进度", finished, total);

                }, (err, dd) => {
                    console.log("complete", dd);

                })
                break;
            case "Load":
                resources.load("TestPreload", (finished: number, total: number, item: AssetManager.RequestItem) => {
                    console.log("预加载进度", finished, total);

                }, (err, dd) => {
                    console.log("complete", dd);

                })
                break;
            default:
                break;
        }
    }
}


