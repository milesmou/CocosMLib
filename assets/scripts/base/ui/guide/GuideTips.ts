import { _decorator, Node, Label, Component } from "cc";
import { App } from "../../../../mlib/App";

const { ccclass, property } = _decorator;

@ccclass
export default class GuideTips extends Component {

    @property(Node)
    private c_TipText1: Node = null;
    private _tipText1: Label = null;

    public static Inst: GuideTips;
    onLoad() {
        GuideTips.Inst = this;
        this.init();
    }

    private init() {
        this._tipText1 = this.c_TipText1.getComponentInChildren(Label);
        this.setTipText1Visible(false);
    }

    /** 挑战boss提示文字 */
    public setTipText1Visible(visible: boolean) {
        this._tipText1.string = App.l10n.getStringByKey("GuideText_076");
        this.c_TipText1.active = visible;
    }

}
