import { Guide } from "../../script/game/DataEntity";
import { DataManager } from "../../script/game/DataManager";
import { app } from "../App";
import Language from "../component/Language";
import HollowOut from "../msic/HollowOut";
import UIBase from "./UIBase";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIGUide extends UIBase {

    // @property(cc.Node)
    // shade: cc.Node = null;
    // @property(cc.Node)
    // finger: cc.Node = null;
    // @property(cc.Node)
    // tip: cc.Node = null;
    // @property(cc.Label)
    // lblTip: cc.Label = null;
    // @property(cc.Node)
    // btnScreen: cc.Node = null;

    // guideId: number = 0;
    // guideData: Guide[] = [];
    // nowIndex: number = 0;
    // cbFinish: Function = null;
    // stepFunc: ((ui: UIBase) => cc.Node)[] = null;

    // hollow: HollowOut;
    // canTouchHollow: boolean;

    // start() {
    //     this.hollow = this.shade.getComponent(HollowOut);
    //     this.shade.on(cc.Node.EventType.TOUCH_START, this.onTouchHollow, this);
    //     this.shade.on(cc.Node.EventType.TOUCH_MOVE, (evt: cc.Event.EventTouch) => evt.stopPropagation());
    //     this.shade.on(cc.Node.EventType.TOUCH_END, this.onTouchHollow, this);
    //     this.shade['_touchListener'].swallowTouches = false;
    //     this.hide();
    // }


    // hide() {
    //     this.shade.active = false;
    //     this.finger.active = false;
    //     this.tip.active = false;
    //     this.btnScreen.off(cc.Node.EventType.TOUCH_END);
    // }

    // public startGuide(guideId: number, cbFinish?: Function, stepFunc?: ((ui: UIBase) => cc.Node)[]) {
    //     if (this.guideId != 0) {
    //         console.warn("正在进引导: ", this.guideId, " 想要开始引导: ", guideId);
    //         return;
    //     }
    //     this.guideId = guideId;
    //     this.guideData = DataManager.Inst.GuideDict[guideId];
    //     this.nowIndex = 0;
    //     if (this.guideData.length > 0) {
    //         this.cbFinish = cbFinish;
    //         this.stepFunc = stepFunc;
    //         this.shade.active = true;
    //         this.hollow.reset();
    //         this.canTouchHollow = false;
    //         this.showGuideStep();
    //     } else {
    //         console.error(`引导${this.guideId}数据错误`);
    //     }
    // }

    // public findBtnNode(uiData: UIBase) {
    //     let guide = this.guideData[this.nowIndex];
    //     let btnNode = null;
    //     if (!guide.NodePath.trim()) {
    //         if (this.stepFunc?.length > 0) {
    //             btnNode = this.stepFunc.shift()(uiData);
    //         } else {
    //             console.error(`引导${this.guideId} 第${this.nowIndex}步 未传入stepFunc`);
    //             return;
    //         }
    //     } else {
    //         btnNode = cc.find(guide.NodePath.trim(), uiData.node);
    //     }
    //     if (btnNode) {
    //         this.showHollow(btnNode);
    //     } else {
    //         console.error(`引导${this.guideId} 第${this.nowIndex}步 未找到指定node`);
    //         return;
    //     }
    // }

    // public showHollow(btnNode: cc.Node) {
    //     let guide = this.guideData[this.nowIndex];
    //     let pos = this.node.convertToNodeSpaceAR(btnNode.convertToWorldSpaceAR(cc.v3(0, 0)));
    //     if (guide.HollowType.length) {
    //         let dur = 0.5;
    //         if (guide.HollowType[0] == 1) {
    //             this.hollow.circleTo(dur, cc.v2(pos), guide.HollowType[1], 2);
    //         } else if (guide.HollowType[0] == 2) {
    //             this.hollow.rectTo(dur, cc.v2(pos), guide.HollowType[1], guide.HollowType[2], 5, 2);
    //         }
    //         this.scheduleOnce(() => {
    //             this.canTouchHollow = true;
    //             this.showFinger(guide.FingerDir, pos, guide.FingerOffset);
    //         }, dur + 0.05);
    //     }
    // }


    // public onTouchHollow(evt: cc.Event.EventTouch) {
    //     if (!this.canTouchHollow) {
    //         evt.stopPropagation();
    //         return;
    //     }
    //     let guide = this.guideData[this.nowIndex];
    //     let pos = this.shade.convertToNodeSpaceAR(evt.getLocation());
    //     let center = this.hollow.center;
    //     let rect = cc.rect(center.x - guide.ReactArea[0] / 2, center.y - guide.ReactArea[1] / 2, guide.ReactArea[0], guide.ReactArea[1]);
    //     if (rect.contains(pos)) {
    //         if (evt.type == cc.Node.EventType.TOUCH_END) {//点击
    //             this.canTouchHollow = false;
    //             this.checkOver();
    //         }
    //     } else {
    //         evt.stopPropagation();
    //     }
    // }

    // public showGuideStep() {
    //     let guide = this.guideData[this.nowIndex];
    //     if (!guide) {
    //         console.error(`引导${this.guideId} 第${this.nowIndex}步 数据错误`);
    //         return;
    //     }
    //     this.finger.active = false;
    //     let show = (uiData: UIBase) => {
    //         this.shade.opacity = guide.ShadeOpacity;
    //         if (guide.UIName) {
    //             this.findBtnNode(uiData);
    //         } else {
    //             this.finger.active = false;
    //         }
    //         if (guide.ClickScreen) {
    //             this.hollow.circle(cc.v2(0, 0), 0);
    //             this.btnScreen.once(cc.Node.EventType.TOUCH_END, () => {
    //                 this.checkOver();
    //             });
    //         }
    //         this.showTipText(guide.TipText, guide.TipPos);
    //     }
    //     if (app.ui.isTopUI(app.uiKey[guide.UIName])) {
    //         let ui = app.ui.getUI(app.uiKey[guide.UIName]);
    //         this.scheduleOnce(() => {
    //             show(ui);
    //         }, 0.05)
    //     } else {//等待指定UI被打开
    //         let func = (uiData: UIBase) => {
    //             if (uiData.uiName == app.uiKey[guide.UIName]) {
    //                 app.event.off(app.eventKey.OnUIShow, func);
    //                 this.scheduleOnce(() => {
    //                     show(uiData);
    //                 }, 0.05)
    //             }
    //         }
    //         app.event.on(app.eventKey.OnUIShow, func);
    //     }
    // }

    // checkOver() {
    //     if (this.nowIndex == this.guideData.length - 1) {
    //         this.guideOver();
    //     } else {
    //         this.nowIndex++;
    //         this.showGuideStep();
    //     }
    // }

    // guideOver() {
    //     this.hide();
    //     this.guideId = 0;
    //     this.cbFinish && this.cbFinish();
    //     this.cbFinish = null;
    //     this.stepFunc = null;
    // }

    // showFinger(dir: number, btnNodePos: cc.Vec3, offset: number[]) {
    //     if (dir == 0) {
    //         this.finger.active = false;
    //     } else {
    //         this.finger.active = true;
    //         this.finger.x = btnNodePos.x + offset[0];
    //         this.finger.y = btnNodePos.y + offset[1];
    //         switch (dir) {
    //             case 1:
    //                 this.finger.angle = 180;
    //                 break;
    //             case 2:
    //                 this.finger.angle = -90;
    //                 break;
    //             case 3:
    //                 this.finger.angle = 0;
    //                 break;
    //             case 4:
    //                 this.finger.angle = 90;
    //                 break;
    //             default:
    //                 console.error("finger dir错误");
    //         }
//     }
    // }

    // showTipText(text: string, pos: number[]) {
    //     if (!text) {
    //         this.tip.active = false;
    //     } else {
    //         this.tip.active = true;
    //         this.tip.x = pos[0];
    //         this.tip.y = pos[1];
    //         Language.setStringByID(this.lblTip, text);
    //     }
    // }


}
