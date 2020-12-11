import UIBase from "./UIBase";
import { UIManager, EUIName } from "./UIManager";
import { EventMgr, GameEvent } from "../utils/EventMgr";
import { Guide } from "../../script/game/DataEntity";
import DataManager from "../../script/game/DataManager";
import Language from "../component/Language";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIGUide extends UIBase {

    @property(cc.Node)
    shade: cc.Node = null;
    @property(cc.Node)
    finger: cc.Node = null;
    @property(cc.Node)
    tip: cc.Node = null;
    @property(cc.Label)
    lblTip: cc.Label = null;
    @property(cc.Node)
    btnScreen: cc.Node = null;

    guideId: number = 0;
    guideData: Guide[] = [];
    cbFinish: Function = null;
    stepFunc: ((ui: UIBase) => cc.Node)[] = null;

    start() {
        this.shade.zIndex = -1;
        this.tip.zIndex = 1;
        this.finger.zIndex = 2;
        this.btnScreen.zIndex = 3;
        this.hide();
    }

    hide() {
        this.shade.active = false;
        this.finger.active = false;
        this.tip.active = false;
        this.btnScreen.off(cc.Node.EventType.TOUCH_END);
    }

    public startGuide(guideId: number, cbFinish?: Function, stepFunc?: ((ui: UIBase) => cc.Node)[]) {
        if (this.guideId != 0) {
            console.warn("正在进引导: ", this.guideId, " 想要开始引导: ", guideId);
            return;
        }
        this.guideId = guideId;
        this.guideData = DataManager.Inst.getGuideData(guideId);
        if (this.guideData.length > 0) {
            this.cbFinish = cbFinish;
            this.stepFunc = stepFunc;
            this.showGuideStep(0);
        } else {
            console.error(`引导${this.guideId}数据错误`);
        }
    }

    public bindGuideBtnEvent(index: number, uiData: UIBase) {
        let guide = this.guideData[index];
        let btnNode = null;
        if (guide.NodePath == "Function") {
            if (this.stepFunc?.length > 0) {
                btnNode = this.stepFunc.shift()(uiData);
            } else {
                console.error(`引导${this.guideId} 第${index}步 未传入stepFunc`);
                return;
            }
        } else {
            btnNode = cc.find(guide.NodePath, uiData.node);
        }
        if (btnNode) {
            this.showGuideBtn(btnNode, index);
        } else {
            console.error(`引导${this.guideId} 第${index}步 未找到指定node`);
            return;
        }
    }

    public showGuideBtn(btnNode: cc.Node, index: number) {
        let guide = this.guideData[index];
        let originButton = btnNode.getComponent(cc.Button);
        let pos = this.node.convertToNodeSpaceAR(btnNode.convertToWorldSpaceAR(cc.v2(0, 0)));
        if (guide.ShowBtnNode) {
            let cloneBtnNode = cc.instantiate(btnNode);
            let cloneButton = cloneBtnNode.getComponent(cc.Button);
            cloneBtnNode.parent = this.node;
            cloneBtnNode.position = cc.v3(pos);
            cloneBtnNode.off("click");
            if (cloneButton instanceof cc.Toggle) {
                cloneButton.checkEvents = [];
            } else {
                cloneButton.clickEvents = [];
            }
            cloneBtnNode.once("click", () => {
                this.onClickGuideBtn(index, originButton, cloneButton);
            });
        }
        this.showFinger(guide.FingerDir, cc.v3(pos), guide.FingerOffset);
    }

    public onClickGuideBtn(index: number, originButton: cc.Button, cloneButton: cc.Button) {
        this.finger.active = false;
        originButton.node.emit("click");
        if (originButton instanceof cc.Toggle) {
            originButton.isChecked = true;
            cc.Component.EventHandler.emitEvents(originButton.checkEvents);
        } else {
            cc.Component.EventHandler.emitEvents(originButton.clickEvents);
        }
        cloneButton.node.destroy();
        if (index < this.guideData.length) {
            if (index == this.guideData.length - 1) {
                this.guideOver();
            } else {
                this.showGuideStep(index + 1);
            }
        }
    }

    public showGuideStep(index: number) {
        let guide = this.guideData[index];
        if (!guide) {
            console.error(`引导${this.guideId} 第${index}步 数据错误`);
            return;
        }
        let show = (uiData: UIBase) => {
            if (guide.UIName && guide.NodePath) {
                this.bindGuideBtnEvent(index, uiData);
            } else {
                this.finger.active = false;
                if (guide.ClickScreen) {
                    this.btnScreen.once(cc.Node.EventType.TOUCH_END, () => {
                        if (index < this.guideData.length) {
                            if (index == this.guideData.length - 1) {
                                this.guideOver();
                            } else {
                                this.showGuideStep(index + 1);
                            }
                        }
                    });
                }
            }
            this.showTip(guide.TipText, guide.TipPos);
            this.shade.active = guide.ShowShade;
        }
        let ui = UIManager.Inst.getUI(EUIName[guide.UIName]);
        if (UIManager.Inst.isTopUI(ui)) {
            show(ui);
        } else {
            EventMgr.once(GameEvent.OnUIShow, (uiName: EUIName, uiData: UIBase) => {
                if (uiName == EUIName[guide.UIName]) {
                    this.scheduleOnce(() => {
                        show(uiData);
                    })
                }
            });
        }
    }

    guideOver() {
        this.hide();
        this.guideId = 0;
        this.cbFinish && this.cbFinish();
        this.cbFinish = null;
        this.stepFunc = null;
    }

    showFinger(dir: number, btnNodePos: cc.Vec3, offset: number[]) {
        if (dir == 0) {
            this.finger.active = false;
        } else {
            this.finger.active = true;
            this.finger.x = btnNodePos.x + offset[0];
            this.finger.y = btnNodePos.y + offset[1];
            switch (dir) {
                case 1:
                    this.finger.angle = 180;
                    break;
                case 2:
                    this.finger.angle = -90;
                    break;
                case 3:
                    this.finger.angle = 0;
                    break;
                case 4:
                    this.finger.angle = 90;
                    break;
                default:
                    console.error("finger dir错误");
            }
        }
    }

    showTip(text: number, pos: number[]) {
        if (text == 0) {
            this.tip.active = false;
        } else {
            this.tip.active = true;
            this.tip.x = pos[0];
            this.tip.y = pos[1];
            this.lblTip.string = Language.getStringByID(text);
        }
    }


}
