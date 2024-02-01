import { Component, Widget, _decorator, sys, view } from "cc";
import { PREVIEW } from "cc/env";

const { ccclass, property, menu, requireComponent, executionOrder, disallowMultiple } = _decorator;


/** 安全区域到四边界的距离 */
class SafeAreaGap {
    top = 0;
    bottom = 0;
    left = 0;
    right = 0;
}


/** 将节点Widget组件适配到安全区域内(适用于本地位置固定的节点,不要被动画影响位置) */
@ccclass("SafeWidget")
@executionOrder(-100)
@requireComponent(Widget)
@disallowMultiple
export class SafeWidget extends Component {

    static safeAreaGap: SafeAreaGap;

    onLoad() {
        if (!SafeWidget.safeAreaGap) {
            let size = view.getVisibleSize();
            let rect = sys.getSafeAreaRect();
            let safeAreaGap = new SafeAreaGap();
            safeAreaGap.left = rect.x;
            safeAreaGap.bottom = rect.y;
            safeAreaGap.right = size.width - rect.width - rect.x;
            safeAreaGap.top = size.height - rect.height - rect.y;
            if (PREVIEW) {//预览时模拟刘海
                let min = Math.min(size.width, size.height);
                let max = Math.max(size.width, size.height);
                let ratio = max / min;
                if (ratio > 1.8) {//全面屏手机
                    safeAreaGap.top = 90 * (min / 1080);
                }
            }
            if (size.width > size.height) {//横屏手机左右安全距离保持一致
                let max = Math.max(safeAreaGap.left, safeAreaGap.right);
                safeAreaGap.left = max;
                safeAreaGap.right = max;
            }
            SafeWidget.safeAreaGap = safeAreaGap;
        }

        let safeAreaGap = SafeWidget.safeAreaGap;
        let widget = this.getComponent(Widget);
        if (!widget) return;
        if (widget.isAlignTop) widget.top += safeAreaGap.top;
        if (widget.isAlignBottom) widget.bottom += safeAreaGap.bottom;
        if (widget.isAlignLeft) widget.left += safeAreaGap.left;
        if (widget.isAlignRight) widget.right += safeAreaGap.right;
    }

}
