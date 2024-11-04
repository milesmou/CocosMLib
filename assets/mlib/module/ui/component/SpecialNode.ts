import { Component, UIOpacity, _decorator } from 'cc';
import { EventKey } from '../../../../scripts/base/GameEnum';
import { CESpecialNodeType } from '../../../../scripts/base/specialNode/ESpecialNodeType';
import { SpecialNodeMgr } from '../../../../scripts/base/specialNode/SpecialNodeMgr';
const { ccclass, property } = _decorator;


@ccclass('SpecialNode')
export class SpecialNode extends Component {
    @property({
        type: CESpecialNodeType,
        tooltip: "节点的类型"
    })
    type = CESpecialNodeType.None;
    @property({
        tooltip: "反转显示(默认满足条件时显示,反转后满足条件隐藏,仅针对节点的active)"
    })
    reverse = false;

    protected onEnable() {
        app.event.on(EventKey.gmBtnSatgeChaned, this.initVisible, this);
        this.initVisible();
    }

    protected onDisable() {
        app.event.off(EventKey.gmBtnSatgeChaned, this.initVisible, this);
    }

    private initVisible() {
        if (!this.isValid) return;
        let active = SpecialNodeMgr.Inst.getActive(this.type);
        this.node.active = this.reverse ? !active : active;
        let uiOpacity = this.getComponent(UIOpacity) || this.addComponent(UIOpacity);
        uiOpacity.opacity = SpecialNodeMgr.Inst.getOpacity(this.type);
    }

}


