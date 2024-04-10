import { Component, Node, _decorator, v3 } from "cc";
import { App } from "../../../mlib/App";
import { CCUtils } from "../../../mlib/utils/CCUtil";
import { UIConstant } from "../../gen/UIConstant";
import { TUnforcedGuide } from "../../gen/table/Types";
import { GameData } from "../GameData";
import { EventKey } from "../GameEnum";
import { GameGuide } from "../GameGuide";
import GameTable from "../GameTable";


const { ccclass, property } = _decorator;

@ccclass('UnforcedGuide')
export default class UnforcedGuide extends Component {

    @property(Node)
    private finger: Node = null;

    public static Inst: UnforcedGuide;

    public get nowGuideId() { return GameData.Inst.unforcedGuide; }

    private _guideDatas: TUnforcedGuide[] = [];

    protected onLoad() {
        UnforcedGuide.Inst = this;
        if (this.nowGuideId) {
            this._guideDatas = GameTable.Inst.getUnforcedGuideGroup(this.nowGuideId);
        }
        this.hide();
        App.event.on(EventKey.OnUIHide, this.check, this);
        App.event.on(EventKey.OnUIShow, this.check, this);
    }

    private async showFinger(guideData: TUnforcedGuide) {
        let ui = App.ui.getUI(UIConstant[guideData.UIName]);
        let targetNode: Node = null;
        if (guideData.NodePath) {
            targetNode = CCUtils.getNodeAtPath(ui.node, guideData.NodePath);
        } else {
            targetNode = await GameGuide.Inst.getUnforcedGuideStepNode(this.nowGuideId, guideData.StepIndex);
        }
        this.finger.active = true;
        this.finger.worldPosition = targetNode.worldPosition.add(v3(guideData.FingerOffset.x, guideData.FingerOffset.y));
    }

    private hide() {
        this.finger.active = false;
    }

    private check() {
        if (!this.nowGuideId) return;
        if (!this._guideDatas) return;
        let guideData: TUnforcedGuide = null;
        for (const data of this._guideDatas) {
            if (App.ui.isTopUI(UIConstant[data.UIName]) && GameGuide.Inst.checkUnforcedGuide(this.nowGuideId, data.StepIndex)) {
                guideData = data;
                break;
            }
        }
        if (guideData) {//满足条件的一个软引导
            this.showFinger(guideData);
        } else {
            this.hide();
        }

    }

    public startGuide(guideId: number) {
        GameData.Inst.unforcedGuide = 0;
        this._guideDatas = GameTable.Inst.getUnforcedGuideGroup(guideId);
        if (this._guideDatas.length > 0) {
            this.check();
        } else {
            console.error("引导数据不存在 ID =", guideId);
        }
    }

    public endGuide() {
        GameData.Inst.unforcedGuide = 0;
        GameData.Inst.delaySave();
        this.hide();
    }

}
