const { ccclass, property } = cc._decorator;

let EFitType = cc.Enum({
    Auto: 0,
    FitWidth: 1,
    FitHeight: 2
})

/** Canvas、Node 适配工具 */
@ccclass
export default class Adapter extends cc.Component {
    @property({
        tooltip: "根据屏幕比例，自动设置Canvas适配方式，显示全部内容",
        readonly: true,
        visible: function () { return this.getComponent(cc.Canvas) }
    })
    fitCanvas = true;

    @property({
        tooltip: "当前节点Size是否需要适配屏幕(等比缩放)",
    })
    fitSize = false;
    @property({
        type: EFitType,
        tooltip: "节点适配方式，默认自动适配去除黑边",
        visible: function () { return this.fitSize }
    })
    fitType = EFitType.Auto;

    onLoad() {
        //Canvas适配优先显示全部内容
        if (this.getComponent(cc.Canvas)) {
            let size = cc.view.getFrameSize();
            let canvas = this.getComponent(cc.Canvas);
            if (Math.max(size.width, size.height) / Math.min(size.width, size.height) < 1.77) {//平板比例
                canvas.fitWidth = size.width > size.height;//横屏适配宽度
                canvas.fitHeight = size.width < size.height;//竖屏适配高度
            } else {//手机比例
                canvas.fitWidth = size.width < size.height;//竖屏适配宽度
                canvas.fitHeight = size.width > size.height;//横屏适配高度
            }
        }
    }

    start() {
        //节点适配根据所选适配方式，默认自动适配去除黑边
        if (this.fitSize && mm.safeArea) {
            let wRatio = mm.safeArea.width / this.node.width;
            let hRatio = mm.safeArea.height / this.node.height;
            let sprite = this.node.getComponent(cc.Sprite);
            if (sprite?.sizeMode == cc.Sprite.SizeMode.CUSTOM) {
                switch (this.fitType) {
                    case EFitType.Auto:
                        this.node.width *= Math.max(wRatio, hRatio);
                        this.node.height *= Math.max(wRatio, hRatio);
                        break;
                    case EFitType.FitWidth:
                        this.node.width *= wRatio;
                        this.node.height *= wRatio;
                        break;
                    case EFitType.FitHeight:
                        this.node.width *= hRatio;
                        this.node.height *= hRatio;
                        break;
                }
            } else {
                switch (this.fitType) {
                    case EFitType.Auto:
                        this.node.scale = Math.max(wRatio, hRatio);
                        break;
                    case EFitType.FitWidth:
                        this.node.scale = wRatio;
                        break;
                    case EFitType.FitHeight:
                        this.node.scale = hRatio;
                        break;
                }
            }

        }
    }
}
