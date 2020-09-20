import UIBase from "../../libs/ui/UIBase";
import { UIManager, EUIName } from "../../libs/ui/UIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UI3 extends UIBase {

    startGuide() {
        UIManager.inst.guide.startGuide(1, {
            cbFinish: () => {
                UIManager.inst.tipMseeage.showTip("引导结束");
            },
            stepFunc: {
                2: (node: cc.Node) => {
                    return node.children[2];
                }
            }
        });
    }


    openUI4() {
        UIManager.inst.openUI(EUIName.UI4);
    }

}
