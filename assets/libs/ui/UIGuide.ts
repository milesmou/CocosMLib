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
    stepFunc: { [step: number]: Function } = null;

    start() {
        this.bg.active = false;
    }

    public startGuide(guideId: number, args?: { cbFinish?: Function, stepFunc?: { [step: number]: Function } }) {
        if (this.guideId != 0) return;
        let data: string = this.guideData.json[guideId];
        if (data) {
            this.bg.active = true;
            this.guideId = guideId;
            this.pathArr = data.split(";");
            this.cbFinish = args?.cbFinish;
            this.stepFunc = args?.stepFunc;
            this.bindClickEventByIndex(0);
        } else {
            console.error(`引导${this.guideId} 数据未找到`);
        }
    }

    public bindClickEventByIndex(index: number) {
        let strs = this.pathArr[index].split(":");
        if (strs.length == 2) {
            let uiName = EUIName[strs[0]];
            let ui = UIManager.Inst.getUI(uiName);
            let func = (uiData: UIBase) => {
                let nodePath = strs[1];
                let btnNode: cc.Node = null;
                if (nodePath.endsWith("()")) {
                    if (!this.stepFunc[index]) {
                        console.error(`引导${this.guideId} 第${index}步 未传入stepFunc`);
                        return;
                    }
                    btnNode = this.stepFunc[index](cc.find(nodePath.replace("()", ""), uiData.node));
                } else {
                    btnNode = cc.find(nodePath, uiData.node);
                }
                if (btnNode) {
                    this.showGuide1(btnNode, index);
                } else {
                    console.error(`引导${this.guideId} 第${index}步 未找到指定node`);
                }
            }
            if (ui && ui.node.parent) {
                func(ui);
            } else {
                EventUtil.once(uiName + "_open", (uiData: UIBase) => {
                    func(uiData);
                })
            }
        } else {
            console.error(`引导${this.guideId} 第${index}步 配置数据错误`);
        }
    }

    public onClickGuideBtn(index: number, originButton: cc.Button, cloneButton: cc.Button) {
        if (originButton instanceof cc.Toggle) {
            originButton.isChecked = true;
        }
        cloneButton.node.destroy();
        if (index < this.pathArr.length) {
            if (index == this.pathArr.length - 1) {
                this.bg.active = false;
                this.guideId = 0;
                this.pathArr = null;
                this.cbFinish && this.cbFinish();
                this.cbFinish = null;
                this.stepFunc = null;
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
