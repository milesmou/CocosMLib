import { _decorator, Component, Widget, sys, UITransform, view, v3 } from 'cc';
const { ccclass, property } = _decorator;

import { app } from "../App";

/** 适配工具 */
@ccclass('Adapter')
export class Adapter extends Component {
    @property({
        tooltip: "将背景图适配屏幕大小",
        visible: function () { return (this as any).getComponent(UITransform)  }
    })
    fitSize = false;
    @property({
        tooltip: "在安全区域内适配Widget",
        visible: function () { return (this as any).getComponent(Widget) }
    })
    safeWidget = false;
    
    start() {

        if (this.fitSize) {
            let transform = this.getComponent(UITransform);
            if (transform) {
                let winSize = view.getVisibleSize();
                if (winSize.width > winSize.height) {
                    let wRatio = winSize.width / transform.width * this.node.scale.x;
                    if (wRatio > 1) {
                        this.node.scale = v3(this.node.scale.x * wRatio, this.node.scale.y * wRatio);
                    }
                } else {
                    let hRatio = winSize.height / transform.height * this.node.scale.y;
                    if (hRatio > 1) {
                        this.node.scale = v3(this.node.scale.x * hRatio, this.node.scale.y * hRatio);
                    }
                }
            }
        }

        if (this.safeWidget) {
            let widget = this.getComponent(Widget);
            if (!widget) return;
            if (widget.isAlignTop) {
                if (sys.platform == sys.IPHONE) {
                    widget.top += app.safeSize.top * 0.7;
                } else {
                    widget.top += app.safeSize.top;
                }
            }
            if (widget.isAlignBottom) {
                if (sys.platform == sys.IPHONE) {
                    widget.bottom += app.safeSize.bottom * 0.6;
                } else {
                    widget.bottom += app.safeSize.bottom;
                }
            }
            if (widget.isAlignLeft) {
                widget.left += app.safeSize.left;
            }
            if (widget.isAlignRight) {
                widget.right += app.safeSize.right;
            }
            widget.updateAlignment();
        }
    }
}
