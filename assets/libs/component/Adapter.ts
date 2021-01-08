const { ccclass, property } = cc._decorator;

/** Canvas、Node 适配工具 */
@ccclass
export default class Adapter extends cc.Component {
    @property({
        tooltip: "自动设置Canvas适配方式（横屏：Pad=fitWidth Phone=fitHeight，竖屏：Pad=fitHeight Phone=fitWidth",
        readonly: true,
        visible: function () { return this.getComponent(cc.Canvas) }
    })
    fitCanvas = true;
    @property({
        tooltip: "当前节点Size是否需要适配屏幕大小",
    })
    fitSize = false;
    @property({
        tooltip: "在安全区域内适配Widget",
        visible: function () { return this.getComponent(cc.Widget) }
    })
    safeWidget = false;

    onLoad() {

        let canvas = this.getComponent(cc.Canvas);
        if (canvas) {
            let size = cc.view.getFrameSize();
            if (Math.max(size.width, size.height) / Math.min(size.width, size.height) < 1.77) {//Pad
                canvas.fitWidth = size.width > size.height;//横屏适配宽度
                canvas.fitHeight = size.width < size.height;//竖屏适配高度
            } else {//Phone
                canvas.fitWidth = size.width < size.height;//竖屏适配宽度
                canvas.fitHeight = size.width > size.height;//横屏适配高度
            }
        }
    }

    start() {
        if (this.fitSize) {
            let wRatio = cc.winSize.width / this.node.width;
            let hRatio = cc.winSize.height / this.node.height;
            let sprite = this.node.getComponent(cc.Sprite);
            if (sprite?.sizeMode == cc.Sprite.SizeMode.CUSTOM) {
                this.node.width *= Math.max(wRatio, hRatio);
                this.node.height *= Math.max(wRatio, hRatio);
            } else {
                this.node.scale = Math.max(wRatio, hRatio);
            }
        }

        let widget = this.getComponent(cc.Widget);
        if (this.safeWidget && widget) {
            if (widget.isAlignTop) {
                if (cc.sys.platform == cc.sys.IPHONE) {
                    widget.top += mm.safeSize.top * 0.7;
                } else {
                    widget.top += mm.safeSize.top;
                }
            }
            if (widget.isAlignBottom) {
                if (cc.sys.platform == cc.sys.IPHONE) {
                    widget.bottom += mm.safeSize.bottom * 0.6;
                } else {
                    widget.bottom += mm.safeSize.bottom;
                }
            }
            if (widget.isAlignLeft) {
                widget.left += mm.safeSize.left;
            }
            if (widget.isAlignRight) {
                widget.right += mm.safeSize.right;
            }
            widget.updateAlignment();
        }
    }


}
