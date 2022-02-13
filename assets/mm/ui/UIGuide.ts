import { Guide } from "../../script/game/DataEntity";
import { DataManager } from "../../script/game/DataManager";
import { app } from "../App";
import Language from "../component/Language";
import HollowOut from "../msic/HollowOut";
import UIBase from "./UIBase";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIGUide extends UIBase {

    @property(cc.Node)
    shade: cc.Node = null;
    @property(cc.Node)
    ring: cc.Node = null;
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
    nowIndex: number = 0;
    cbFinish: Function = null;
    stepFunc: ((ui: UIBase) => cc.Node)[] = null;

    hollow: HollowOut;
    touchId: number;
    canCheckTouch = false;

    start() {
        this.hollow = this.shade.getComponent(HollowOut);
        this.shade.on(cc.Node.EventType.TOUCH_START, this.onTouchHollow, this);
        this.shade.on(cc.Node.EventType.TOUCH_MOVE, (evt: cc.Event.EventTouch) => evt.stopPropagationImmediate());
        this.shade.on(cc.Node.EventType.TOUCH_END, this.onTouchHollow, this);
        this.shade['_touchListener'].swallowTouches = false;
        this.hide();
    }

    hide() {
        this.shade.active = false;
        this.ring.active = false;
        this.finger.active = false;
        this.tip.active = false;
        this.btnScreen.off(cc.Node.EventType.TOUCH_END);
    }

    public startGuide(guideId: number, obj?: { cbStart?: Function, cbFinish?: Function, stepFunc?: ((ui: UIBase) => cc.Node)[] }) {
        if (this.guideId != 0) {
            cc.warn("正在进引导: ", this.guideId, " 想要开始引导: ", guideId);
            return;
        }
        cc.log("开始引导", guideId);
        this.guideId = guideId;
        this.guideData = DataManager.Inst.GuideDict[guideId];
        this.nowIndex = 0;
        if (this.guideData.length > 0) {
            obj?.cbStart && obj.cbStart();
            this.cbFinish = obj?.cbFinish;
            this.stepFunc = obj?.stepFunc;
            this.shade.active = true;
            this.hollow.reset();
            this.showGuideStep();
        } else {
            cc.error(`引导${this.guideId}数据错误`);
            this.guideOver();
        }
    }

    public findBtnNode(uiData: UIBase) {
        let guide = this.guideData[this.nowIndex];
        let btnNode = null;
        if (!guide.NodePath.trim()) {
            if (this.stepFunc?.length > 0) {
                btnNode = this.stepFunc.shift()(uiData);
            } else {
                cc.error(`引导${this.guideId} 第${this.nowIndex}步 未传入stepFunc`);
                this.guideOver();
                return;
            }
        } else {
            btnNode = cc.find(guide.NodePath.trim(), uiData.node);
        }
        if (btnNode) {
            if (this.isNodeInScreen(btnNode)) {
                this.showHollow(btnNode);
            } else {
                cc.error(`引导${this.guideId} 第${this.nowIndex}步 node不在屏幕范围内`);
                this.guideOver();
            }

        } else {
            cc.error(`引导${this.guideId} 第${this.nowIndex}步 未找到指定node`);
            this.guideOver();
            return;
        }
    }

    public showHollow(btnNode: cc.Node) {
        let guide = this.guideData[this.nowIndex];
        let pos = this.node.convertToNodeSpaceAR(btnNode.convertToWorldSpaceAR(cc.v3(0, 0)));
        if (guide.HollowType.length) {
            let dur = 0.1;
            let scale = 2;
            if (guide.HollowType[0] == 1) {
                this.hollow.circle(cc.v2(pos), guide.HollowType[1] * scale, 0.3);
                this.hollow.circleTo(dur, cc.v2(pos), guide.HollowType[1], 0.3);
            } else if (guide.HollowType[0] == 2) {
                this.hollow.rect(cc.v2(pos), guide.HollowType[1] * scale, guide.HollowType[2] * scale, 5);
                this.hollow.rectTo(dur, cc.v2(pos), guide.HollowType[1], guide.HollowType[2], 5, 2);
            }
            this.scheduleOnce(() => {
                this.canCheckTouch = true;
                app.ui.BlockTime = -1;
                // this.showRing(guide.RingScale, pos, guide.RingOffset);
                this.showFinger(guide.FingerDir, pos, guide.FingerOffset);
            }, dur + 0.05);
        }
    }


    public onTouchHollow(evt: cc.Event.EventTouch) {
        if (this.canCheckTouch) {
            let guide = this.guideData[this.nowIndex];
            let pos = this.shade.convertToNodeSpaceAR(evt.getLocation());
            let center = this.hollow.center;
            let rect = cc.rect(center.x - guide.ReactArea[0] / 2, center.y - guide.ReactArea[1] / 2, guide.ReactArea[0], guide.ReactArea[1]);
            if (rect.contains(pos)) {
                if (evt.type == cc.Node.EventType.TOUCH_START) {
                    this.touchId = evt.getID();
                }
                if (evt.type == cc.Node.EventType.TOUCH_END && this.touchId == evt.getID()) {//点击
                    this.touchId = null
                    this.checkOver();
                }
                return;
            }
        }
        evt.stopPropagationImmediate();
    }

    public showGuideStep() {
        let guide = this.guideData[this.nowIndex];
        if (!guide) {
            cc.error(`引导${this.guideId} 第${this.nowIndex}步 数据错误`);
            return;
        }
        let uiName = app.uiKey[guide.UIName];
        app.ui.BlockTime = 3;
        this.ring.active = false;
        this.finger.active = false;
        let showGuide = (uiData: UIBase) => {
            this.shade.opacity = guide.ShadeOpacity;
            if (guide.ClickScreen) {
                this.hollow.reset();
                this.btnScreen.once(cc.Node.EventType.TOUCH_END, () => {
                    this.checkOver();
                });
                app.ui.BlockTime = -1;
            } else {
                if (guide.UIName) {
                    this.findBtnNode(uiData);
                } else {
                    this.ring.active = false;
                    this.finger.active = false;
                }
            }
            this.showTipText(guide.TipText, guide.TipPos);
        }
        let checkIsAssignUI = () => {
            if (app.ui.isTopUI(uiName) && app.ui.isTopUI(uiName, true)) {
                let ui = app.ui.getUI(uiName);
                this.scheduleOnce(() => {
                    showGuide(ui);
                }, 0.05)
            } else {//等待指定UI被打开
                let func = () => {
                    if ((app.ui.isTopUI(uiName) && app.ui.isTopUI(uiName, true))) {
                        app.event.off(app.eventKey.OnUIShow, func);
                        app.event.off(app.eventKey.OnUIHide, func);
                        let uiData = app.ui.getUI(uiName);
                        this.scheduleOnce(() => {
                            showGuide(uiData);
                        }, 0.05);
                        return;
                    }
                }
                app.event.on(app.eventKey.OnUIShow, func);
                app.event.on(app.eventKey.OnUIHide, func);
            }
        }
        // if (guide.DelayCheckUI > 0) {
        //     this.scheduleOnce(() => {
        //         checkIsAssignUI();
        //     }, guide.DelayCheckUI);
        // } else {
            checkIsAssignUI();
        // }
    }

    checkOver() {
        this.canCheckTouch = false;
        if (this.nowIndex == this.guideData.length - 1) {
            this.guideOver();
        } else {
            this.nowIndex++;
            this.showGuideStep();
        }
    }

    guideOver() {
        this.hide();
        this.guideId = 0;
        this.cbFinish && this.cbFinish();
        this.cbFinish = null;
        this.stepFunc = null;
    }

    showRing(scale: number, btnNodePos: cc.Vec3, offset: number[]) {
        this.ring.active = true;
        this.ring.scale = scale;
        this.ring.x = btnNodePos.x + offset[0];
        this.ring.y = btnNodePos.y + + offset[1];
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
                    cc.error("finger dir错误");
            }
        }
    }

    showTipText(text: string, pos: number[]) {
        if (!text) {
            this.tip.active = false;
        } else {
            this.tip.active = true;
            this.tip.x = pos[0];
            this.tip.y = pos[1];
            Language.setStringByID(this.lblTip, text);
        }
    }

    isNodeInScreen(node: cc.Node) {
        let canvasRect = cc.find("Canvas").getBoundingBoxToWorld();
        let pos = node.convertToWorldSpaceAR(cc.v2(0, 0));
        return canvasRect.contains(pos);
    }

}
