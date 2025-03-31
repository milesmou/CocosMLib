import { Component, UIOpacity, _decorator } from 'cc';
import { BMSpecialNodeType, ESpecialNodeTypeLimit } from '../../../../scripts/base/specialNode/ESpecialNodeType';
import { SpecialNodeMgr } from '../../../../scripts/base/specialNode/SpecialNodeMgr';
const { ccclass, property } = _decorator;


@ccclass('SpecialNode')
export class SpecialNode extends Component {
    @property({
        type: BMSpecialNodeType,
        tooltip: "节点的类型"
    })
    type = 0;
    @property({
        type: ESpecialNodeTypeLimit,
        tooltip: "类型的判断，Any:满足任意一个即可，All:需要满足所有条件。"
    })
    typeLimit = ESpecialNodeTypeLimit.Any;
    @property({
        tooltip: "反转显示(默认满足条件时显示,反转后满足条件隐藏,仅针对节点的active)"
    })
    reverse = false;

    protected onEnable() {
        app.event.on(mEventKey.gmBtnSatgeChaned, this.initVisible, this);
        this.initVisible();
    }

    protected onDisable() {
        app.event.off(mEventKey.gmBtnSatgeChaned, this.initVisible, this);
    }

    private initVisible() {
        if (!this.isValid) return;
        let active = SpecialNodeMgr.Inst.getActive(this.type, this.typeLimit);
        this.node.active = this.reverse ? !active : active;
        let opacity = SpecialNodeMgr.Inst.getOpacity(this.type, this.typeLimit);
        let uiOpacity = this.ensureComponent(UIOpacity);
        uiOpacity.opacity = opacity;
    }

}


