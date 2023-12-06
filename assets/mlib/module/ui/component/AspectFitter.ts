import { Component, Enum, Sprite, UITransform, Vec3, _decorator } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

const AspectMode = Enum({
    FitInParent: 0,
    EnvelopeParent: 1,
})

const Alignment = Enum({
    None: 0,
    Center: 1,
    Top: 2,
    Bottom: 3,
    Left: 4,
    Right: 5,
})

/**
 * 等比适配图片(适用于本地位置固定的节点)
 */
@ccclass('AspectFitter')
@requireComponent(Sprite)
export class AspectFitter extends Component {
    @property({
        type: AspectMode,
        tooltip: "FitInParent:在父节点范围内显示全部 EnvelopeParent:填满父节点范围",
        displayName: "适配模式"
    })
    aspectMode = AspectMode.FitInParent;
    @property({
        type: Alignment,
        tooltip: "None:保持原位置 Center:居中 Top|Bottom|Left|Right:与对应边界对齐",
        displayName: "对齐方式"
    })
    alignment = Alignment.None;
    @property({
        displayName: "对齐强度",
        tooltip: "向上下左右对齐时,1表示该方向完全对齐边界,0表示该方向在中心位置",
        range: [0, 1],
        visible: function () { return this.alignment != Alignment.None && this.alignment != Alignment.Center; }
    })
    alignmentIntensity = 1;

    private sp: Sprite;
    onLoad() {
        this.sp = this.getComponent(Sprite);
        if (!this.sp) return
        this.sp.sizeMode = Sprite.SizeMode.RAW;
        let self = this;
        Object.defineProperty(this.sp, "spriteFrame", {
            get: function () {
                return this._spriteFrame;
            },
            set: function (value) {
                if (this._spriteFrame === value) {
                    return;
                }

                const lastSprite = this._spriteFrame;
                this._spriteFrame = value;
                this.markForUpdateRenderData();
                this._applySpriteFrame(lastSprite);
                self.refresh();
            }
        });
    }

    start() {
        this.refresh();
    }

    refresh() {
        //尺寸适配
        let uiTrans = this.node.parent.getComponent(UITransform);
        let spFrame = this.sp.spriteFrame;
        let spWidth = spFrame.width;
        let spHeight = spFrame.height;
        let aspectW = uiTrans.width / spWidth;
        let aspectH = uiTrans.height / spHeight;
        let scale = 1;
        if (this.aspectMode == AspectMode.FitInParent) {
            scale = Math.min(aspectW, aspectH);
        } else {
            scale = Math.max(aspectW, aspectH);
        }
        this.node.setScale(new Vec3(scale, scale, 1));
        //对齐
        if (this.alignment == Alignment.None) return;
        if (this.alignment == Alignment.Center) {
            this.node.setPosition(new Vec3(0, 0, 0));
        } else {
            var posX = this.node.position.x;
            var posY = this.node.position.x;
            let offfsetX = (spWidth * scale - uiTrans.contentSize.width) / 2 * this.alignmentIntensity;
            let offfsetY = (spHeight * scale - uiTrans.contentSize.height) / 2 * this.alignmentIntensity;
            if (this.alignment == Alignment.Top) posY -= offfsetY;
            else if (this.alignment == Alignment.Bottom) posY += offfsetY;
            else if (this.alignment == Alignment.Left) posX += offfsetX;
            else if (this.alignment == Alignment.Right) posX -= offfsetX;
            this.node.position = new Vec3(posX, posY, 0);
        }
    }
}
