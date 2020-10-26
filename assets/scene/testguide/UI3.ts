import UIBase from "../../libs/ui/UIBase";
import { UIManager, EUIName } from "../../libs/ui/UIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UI3 extends UIBase {

    startGuide() {
        UIManager.Inst.guide.startGuide(1, {
            cbFinish: () => {
                UIManager.Inst.tipMseeage.showTip("引导结束");
            },
            stepFunc: {
                2: (node: cc.Node) => {
                    return node.children[2];
                }
            }
        });
    }


    openUI4() {
        UIManager.Inst.openUI(EUIName.UI4);
    }

}
