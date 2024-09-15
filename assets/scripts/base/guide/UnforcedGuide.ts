import { Component, Node, _decorator, instantiate, v3 } from "cc";
import { UIConstant } from "../../gen/UIConstant";
import { TUnforcedGuide } from "../../gen/table/schema";
import { GameData } from "../GameData";
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
        // App.event.on(mEventKey.OnUIHideBegin, this.hide, this);
        app.event.on(mEventKey.OnUIHide, this.check, this);
        // App.event.on(mEventKey.OnUIShowBegin, this.hide, this);
        app.event.on(mEventKey.OnUIShow, this.check, this);
    }

    protected start(): void {
        if (this.nowGuideId) {
            this.startGuide(this.nowGuideId);
        }
    }

    private async showFinger(guideData: TUnforcedGuide) {
        let ui = app.ui.getUI(UIConstant[guideData.UIName]);
        let targetNode: Node = null;
        if (guideData.NodePath) {
            targetNode = ui.node.getChildByPath(guideData.NodePath);
        } else {
            targetNode = await GameGuide.Inst.getUnforcedGuideStepNode(guideData);
        }
        this._finger = this._finger?.isValid ? this._finger : instantiate(this.m_finger);
        this._finger.parent = ui.node;
        this._finger.worldPosition = targetNode.worldPosition.clone().add(v3(guideData.FingerOffset.x, guideData.FingerOffset.y));
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
            if (!app.ui.isTopUI(UIConstant[data.UIName])) continue;
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
