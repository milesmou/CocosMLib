import app from "../app";

const { ccclass, property } = cc._decorator;

/** 适配工具 */
@ccclass
export default class Adapter extends cc.Component {
    @property({
        tooltip: "将背景图适配屏幕大小(针对全面屏)",
    })
    fitSize = false;
    @property({
        tooltip: "在安全区域内适配Widget",
        visible: function () { return this.getComponent(cc.Widget) }
    })
    safeWidget = false;

    start() {
        if (this.fitSize) {
            let resize = ratio => {
                if (sprite?.sizeMode == cc.Sprite.SizeMode.CUSTOM) {
                    this.node.width *= ratio;
                    this.node.height *= ratio;
                } else {
                    this.node.scale = ratio;
                }
            }
            let wRatio = cc.winSize.width / this.node.width;
            let hRatio = cc.winSize.height / this.node.height;
            let aspectRatio = Math.max(cc.winSize.width, cc.winSize.height) / Math.min(cc.winSize.width, cc.winSize.height);
            let sprite = this.node.getComponent(cc.Sprite);
            if (aspectRatio > 1.77) {//Phone
                resize(Math.max(wRatio, hRatio));
            }
        }

        if (this.safeWidget) {
            let widget = this.getComponent(cc.Widget);
            if (!widget) return;
            if (widget.isAlignTop) {
                if (cc.sys.platform == cc.sys.IPHONE) {
                    widget.top += app.safeSize.top * 0.7;
                } else {
                    widget.top += app.safeSize.top;
                }
            }
            if (widget.isAlignBottom) {
                if (cc.sys.platform == cc.sys.IPHONE) {
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
