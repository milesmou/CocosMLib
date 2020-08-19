import UIBase from "./UIBase";
import { UIManager, EUIName } from "./UIManager";
import { EventUtil } from "../utils/EventUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIGUide extends UIBase {

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.JsonAsset)
    guideData: cc.JsonAsset = null;

    guideId: number = 0;
    pathArr: String[] = null;
    cbFinish: Function = null;

    start() {
        this.bg.active = false;
    }

    public startGuide(guideId: number, cbFinish?: Function) {
        if (this.guideId != 0) return;
        let data: string = this.guideData.json[guideId];
        if (data) {
            this.bg.active = true;
            this.pathArr = data.split(";");
            this.guideId = guideId;
            this.cbFinish = cbFinish;
            this.bindClickEventByIndex(0);
        }
    }

    public bindClickEventByIndex(index: number) {
        let strs = this.pathArr[index].split(":");
        if (strs.length == 2) {
            let uiName = EUIName[strs[0]];
            let ui = UIManager.inst.getUI(uiName);
            let func = (uiData: UIBase) => {
                let btnNode = cc.find(strs[1], uiData.node);
                if (btnNode) {
                    this.showGuide1(btnNode, index);
                }
            }
            if (ui && ui.node.parent) {
                func(ui);
            } else {
                EventUtil.once(uiName + "_open", (uiData: UIBase) => {
                    func(uiData);
                })
            }
        }
    }

    public onClickGuideBtn(index: number, originButton: cc.Button, cloneButton: cc.Button) {
        if(originButton instanceof cc.Toggle){
            originButton.isChecked = true;
        }
        cloneButton.node.destroy();
        if (index < this.pathArr.length) {
            if (index == this.pathArr.length - 1) {
                this.bg.active = false;
                this.guideId = 0;
                this.cbFinish && this.cbFinish();
                this.cbFinish = null;
                console.log("guide over");
            } else {
                let newIndex = index + 1;
                this.bindClickEventByIndex(newIndex);
            }
        }
    }

    public showGuide1(btnNode: cc.Node, index: number) {
        let originButton = btnNode.getComponent(cc.Button);
        let cloneBtnNode = cc.instantiate(btnNode);
        let pos = this.node.convertToNodeSpaceAR(btnNode.convertToWorldSpaceAR(cc.v2(0, 0)));
        cloneBtnNode.parent = this.node;
        cloneBtnNode.position = pos;
        cloneBtnNode.once("click", this.onClickGuideBtn.bind(this, index, originButton));
    }
}
