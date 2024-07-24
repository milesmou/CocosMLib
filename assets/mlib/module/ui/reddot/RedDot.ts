import { Component, Label, Node, _decorator } from 'cc';
import { RedDotMgr } from './RedDotMgr';

const { ccclass, property, menu } = _decorator;

@ccclass
export class RedDot extends Component {
    @property({
        displayName: "红点名字"
    })
    redDotName = "";
    @property({
        type: Node,
        displayName: "红点节点"
    })
    redDotNode: Node = null;
    @property({
        type: Label,
        displayName: "红点数字"
    })
    redDotNum: Label = null;

    onLoad() {
        this.redDotName = this.redDotName.trim();
        if (!this.redDotName) {
            logger.error("RedDotName不能为空");
            return;
        }
    }

    onEnable() {
        RedDotMgr.addRedDotListener(this.redDotName, this.onValueChange, this);
        this.onValueChange();
    }

    onDisable() {
        RedDotMgr.removeRedDotListener(this.redDotName, this.onValueChange, this);
    }

    private onValueChange() {
        var value = RedDotMgr.getRedDotValue(this.redDotName);
        this.refreshRedDotView(value);
    }


    private refreshRedDotView(value: number) {
        if (this.redDotNode) value > 0 ? this.redDotNode.setScale(1, 1) : this.redDotNode.setScale(0, 0);
        if (this.redDotNum) this.redDotNum.string = value.toString();
    }


}
