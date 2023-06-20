import { Component, Enum, Sprite, _decorator } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

const AspectMode = Enum({
    FitInParent: 0,
    EnvelopeParent: 1,
})

@requireComponent(Sprite)
@ccclass('AspectFitter')
export class AspectFitter extends Component {
    @property({
        type: AspectMode,
        tooltip: "FitInParent:在父节点范围内显示全部 EnvelopeParent:填满父节点范围",
        displayName: "适配模式"
    })
    aspectMode = AspectMode.FitInParent;

    private sp: Sprite;
    onLoad() {
        this.sp = this.getComponent(Sprite);
    }

    start() {
        this.refresh();
    }

    refresh() {
        let spFrame = this.sp.spriteFrame;
        let spWidth = spFrame.width;
        let spHeight = spFrame.height;
    }
}
