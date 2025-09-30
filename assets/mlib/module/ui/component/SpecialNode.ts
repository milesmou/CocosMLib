import { Component, _decorator } from 'cc';
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

    protected onLoad() {
        this.initVisible();
    }

    private initVisible() {
        if (!this.isValid) return;
        let active = SpecialNodeMgr.Inst.getActive(this.type, this.typeLimit);
        this.node.active = this.reverse ? !active : active;
    }

}


