import { Component, Node, _decorator, instantiate, v3 } from "cc";
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
    private m_finger: Node = null;

    private _finger: Node;

    public static Inst: UnforcedGuide;

    public get nowGuideId() { return GameData.Inst.unforcedGuide; }

    private _guideDatas: TUnforcedGuide[] = [];

    protected onLoad() {
        UnforcedGuide.Inst = this;
        this.m_finger.removeFromParent();
        this.hide();
        // App.event.on(EventKey.OnUIHideBegin, this.hide, this);
        App.event.on(EventKey.OnUIHide, this.check, this);
        // App.event.on(EventKey.OnUIShowBegin, this.hide, this);
        App.event.on(EventKey.OnUIShow, this.check, this);
    }

    protected start(): void {
        if (this.nowGuideId) {
            this.startGuide(this.nowGuideId);
        }
    }

    private async showFinger(guideData: TUnforcedGuide) {
        let targetNode: Node = null;
        if (guideData.NodePath) {
            let ui = App.ui.getUI(UIConstant[guideData.UIName]);
            targetNode = CCUtils.getNodeAtPath(ui.node, guideData.NodePath);
        } else {
            targetNode = await GameGuide.Inst.getUnforcedGuideStepNode(guideData);
        }
        this._finger = this._finger?.isValid ? this._finger : instantiate(this.m_finger);
        this._finger.parent = targetNode;
        this._finger.worldPosition = targetNode.worldPosition.add(v3(guideData.FingerOffset.x, guideData.FingerOffset.y));
    }

    private hide() {
        if (this._finger?.isValid) {
            this._finger.parent = null;
        }
    }

    private check() {
        if (!this.nowGuideId) return;
        if (!this._guideDatas) return;
        let guideData: TUnforcedGuide = null;
        for (const data of this._guideDatas) {
            if (!App.ui.isTopUI(UIConstant[data.UIName])) continue;
            if (GameGuide.Inst.checkUnforcedGuide(data)) {
                guideData = data;
                break;
            }
        }
        this.scheduleOnce(() => {
            if (guideData) {//满足条件的一个软引导
                this.showFinger(guideData);
            } else {
                // this.hide();
            }
        });
    }

    public startGuide(guideId: number) {
        GameData.Inst.unforcedGuide = guideId;
        this._guideDatas = GameTable.Inst.getUnforcedGuideGroup(guideId);
        if (this._guideDatas.length > 0) {
            this.check();
        } else {
            console.error("引导数据不存在 ID =", guideId);
        }
    }

    public endGuide(guideId: number) {
        if (GameData.Inst.unforcedGuide != guideId) return;
        GameData.Inst.unforcedGuide = 0;
        GameData.Inst.delaySave();
        this.hide();
    }

}
