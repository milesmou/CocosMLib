import { Component, Enum, sys, view, _decorator } from 'cc';
import { PREVIEW } from 'cc/env';
const { ccclass, property } = _decorator;


/** 安全区域到四边界的距离 */
class SafeAreaGap {
    top = 0;
    bottom = 0;
    left = 0;
    right = 0;
}

const Alignment = Enum({
    None: 0,
    Top: 1,
    Bottom: 2,
    Left: 3,
    Right: 4,
})

/** 将节点适配到安全区域内(适用于本地位置固定的节点) */
@ccclass('SafeArea')
export class SafeArea extends Component {
    static safeAreaGap: SafeAreaGap;

    @property({
        type: Alignment,
        tooltip: "Top|Bottom|Left|Right:与对应边界适配",
        displayName: "对齐方式"
    })
    alignment = Alignment.None;

    start() {
        if (!SafeArea.safeAreaGap) {
            let size = view.getVisibleSize();
            let rect = sys.getSafeAreaRect();
            let safeAreaGap = new SafeAreaGap();
            safeAreaGap.left = rect.x;
            safeAreaGap.bottom = rect.y;
            safeAreaGap.right = size.width - rect.width - rect.x;
            safeAreaGap.top = size.height - rect.height - rect.y;
            if(PREVIEW){
                safeAreaGap.top = 50;//预览时模拟有刘海
            }
            SafeArea.safeAreaGap = safeAreaGap;
        }

        let safeAreaGap = SafeArea.safeAreaGap;

        let pos = this.node.getPosition();
        if (this.alignment == Alignment.Top) pos.y -= safeAreaGap.top;
        if (this.alignment == Alignment.Bottom) pos.y += safeAreaGap.bottom;
        if (this.alignment == Alignment.Left) pos.x += safeAreaGap.left;
        if (this.alignment == Alignment.Right) pos.x -= safeAreaGap.right;

        this.node.position = pos;
    }
}
