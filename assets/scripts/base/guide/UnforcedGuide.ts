import { Component, Node, _decorator, misc, v3 } from "cc";
import { UIBase } from "../../../mlib/module/ui/manager/UIBase";
import { CCUtils } from "../../../mlib/utils/CCUtil";
import { EventKey } from "../GameEnum";
import { App } from "../../../mlib/App";
// import { TUnforcedGuide } from "../../../gen/table/Types";

type TUnforcedGuide = any;

const { ccclass, property } = _decorator;

@ccclass('UnforcedGuide')
export default class UnforcedGuide extends Component {

    @property(Node)
    private finger: Node = null;

    public static Inst: UnforcedGuide;

    private _nowGuideId: number;
    private _guideMap: Map<string, TUnforcedGuide> = new Map();

    protected onLoad() {
        UnforcedGuide.Inst = this;
        this.hide();
        App.event.on(EventKey.OnUIHideBegin, this.onUIHideBegin, this);
        App.event.on(EventKey.OnUIHide, this.onUIHide, this);
        App.event.on(EventKey.OnUIShowBegin, this.onUIShowBegin, this);
        App.event.on(EventKey.OnUIShow, this.onUIShow, this);
    }

    private showFinger(ui: UIBase, data: TUnforcedGuide) {
        let node = CCUtils.getNodeAtPath(ui.node, this._guideMap.get(ui.uiName).NodePath);
        var pos = CCUtils.uiNodePosToUINodePos(node.parent, this.node, node.position);
        let dir = misc.clampf(data.FingerDir, 1, 4);
        this.finger.active = true;
        this.finger.position = pos.add(v3(data.FingerOffset));
        switch (dir) {
            case 1:
                this.finger.angle = 0;
                break;
            case 2:
                this.finger.angle = 180;
                break;
            case 3:
                this.finger.angle = 90;
                break;
            case 4:
                this.finger.angle = -90;
                break;
        }
    }

    private hide() {
        this.finger.active = false;
    }

    private onUIHideBegin(ui: UIBase) {
        if (!this._nowGuideId) return;
        if (this._guideMap.has(ui.uiName)) {
            this.hide();
        }
    }

    private onUIHide(ui: UIBase) {
        if (!this._nowGuideId) return;
        // let topUI = App.ui.topUI;
        // if (this._guideMap.has(topUI.uiName)) {
        //     if (topUI.isAnimEnd) {
        //         this.showFinger(topUI, this._guideMap.get(topUI.uiName));
        //     } else {
        //         let func = () => {
        //             this.showFinger(topUI, this._guideMap.get(topUI.uiName));
        //         }
        //         topUI.onAnimEnd.addListener(func, this, true);
        //     }
        // }
    }

    private onUIShowBegin(ui: UIBase) {
        if (!this._nowGuideId) return;
        this.hide();
    }

    private onUIShow(ui: UIBase) {
        if (!this._nowGuideId) return;
        if (!App.ui.isTopUI(ui.uiName)) return;
        if (this._guideMap.has(ui.uiName)) {
            this.showFinger(ui, this._guideMap.get(ui.uiName));
        }
    }

    public startGuide(guideId: number) {
        // this._nowGuideId = guideId;
        // let datas = GameTable.Inst.getUnforcedGuideGroup(guideId);
        // if (datas.length > 0) {
        //     this._guideMap.clear();
        //     for (const data of datas) {
        //         this._guideMap.set(UIConstant[data.UIName], data);
        //     }
        //     this.onUIShow(App.ui.topUI);
        // } else {
        //     console.error("引导数据不存在 ID =", guideId);
        // }
    }

    public endGuide() {
        this._nowGuideId = 0;
        this.hide();
    }

}
