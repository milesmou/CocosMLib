import { Component, EffectAsset, Enum, Material, Sprite, Tween, UITransform, Vec2, _decorator, tween, v2 } from "cc";
import { DEV } from "cc/env";

const { ccclass, property, requireComponent, executeInEditMode, disallowMultiple, executionOrder } = _decorator;

/** 镂空形状 */
export enum HollowOutShape {
    /** 矩形 */
    Rect = 1,
    /** 圆形 */
    Circle
}

/**
 * 挖孔 Shader 组件，该组件需要对应的 Effect 才能正常使用！
 * @see HollowOut.ts https://gitee.com/ifaswind/eazax-ccc/blob/master/components/effects/HollowOut.ts
 * @see eazax-hollowout.effect https://gitee.com/ifaswind/eazax-ccc/blob/master/resources/effects/eazax-hollowout.effect
 */
@ccclass
@requireComponent(Sprite)
@executeInEditMode
@disallowMultiple
@executionOrder(-100)
export class HollowOut extends Component {

    @property private _effect: EffectAsset = null;
    @property({ type: EffectAsset, tooltip: DEV && 'Effect 资源', readonly: false })
    public get effect() { return this._effect; }
    public set effect(value: EffectAsset) { this._effect = value; this.init(); }

    @property private _shape: HollowOutShape = HollowOutShape.Rect;
    @property({ type: Enum(HollowOutShape), tooltip: DEV && '镂空形状' })
    public get shape() { return this._shape; }
    public set shape(value: HollowOutShape) { this._shape = value; this.updateProperties(); }

    @property private _center: Vec2 = v2();
    @property({ tooltip: DEV && '中心坐标' })
    public get center() { return this._center; }
    public set center(value: Vec2) { this._center = value; this.updateProperties(); }

    @property private _width: number = 300;
    @property({ tooltip: DEV && '宽', visible() { return this.shape === HollowOutShape.Rect; } })
    public get width() { return this._width; }
    public set width(value: number) { this._width = value; this.updateProperties(); }

    @property private _height: number = 300;
    @property({ tooltip: DEV && '高', visible() { return this.shape === HollowOutShape.Rect; } })
    public get height() { return this._height; }
    public set height(value: number) { this._height = value; this.updateProperties(); }

    @property private _round: number = 1;
    @property({ tooltip: DEV && '圆角半径', visible() { return this.shape === HollowOutShape.Rect; } })
    public get round() { return this._round; }
    public set round(value: number) { this._round = value; this.updateProperties(); }

    @property private _radius: number = 200;
    @property({ tooltip: DEV && '半径', visible() { return this.shape === HollowOutShape.Circle; } })
    public get radius() { return this._radius; }
    public set radius(value: number) { this._radius = value; this.updateProperties(); }

    @property private _feather: number = 0.5;
    @property({ tooltip: DEV && '边缘虚化宽度', visible() { return this.shape === HollowOutShape.Circle || this.round > 0; } })
    public get feather() { return this._feather; }
    public set feather(value: number) { this._feather = value; this.updateProperties(); }

    private uiTrans: UITransform;

    private sprite: Sprite = null;

    private material: Material = null;

    private tweenRes: () => void = null;


    protected onLoad() {
        this.init();
    }

    /**
     * 初始化组件
     */
    private async init() {
        if (!this._effect) return;
        this.uiTrans = this.getComponent(UITransform);
        this.sprite = this.node.getComponent(Sprite);
        if (this.sprite.spriteFrame) this.sprite.spriteFrame.packable = false;
        // 生成并应用材质
        this.material = new Material();
        this.material.initialize({ effectAsset: this._effect });
        this.sprite.customMaterial = this.material;
        // 更新材质属性
        this.updateProperties();
    }

    /**
     * 更新材质属性
     */
    private updateProperties() {
        switch (this._shape) {
            case HollowOutShape.Rect:
                this.rect(this._center, this._width, this._height, this._round, this._feather);
                break;
            case HollowOutShape.Circle:
                this.circle(this._center, this._radius, this._feather);
                break;
        }
    }

    /**
     * 矩形镂空
     * @param center 中心坐标
     * @param width 宽
     * @param height 高
     * @param round 圆角半径
     * @param feather 边缘虚化宽度
     */
    public rect(center?: Vec2, width?: number, height?: number, round?: number, feather?: number) {
        this._shape = HollowOutShape.Rect;

        if (center !== null) this._center = center;
        if (width !== null) this._width = width;
        if (height !== null) this._height = height;
        if (round !== null) {
            this._round = round >= 0 ? round : 0;
            const min = Math.min(this._width / 2, this._height / 2);
            this._round = this._round <= min ? this._round : min;
        }
        if (feather !== null) {
            this._feather = feather >= 0 ? feather : 0;
            this._feather = this._feather <= this._round ? this._feather : this._round;
        }

        this.material.setProperty('size', this.getNodeSize());
        this.material.setProperty('center', this.getCenter(this._center));
        this.material.setProperty('width', this.getWidth(this._width));
        this.material.setProperty('height', this.getHeight(this._height));
        this.material.setProperty('round', this.getRound(this._round));
        this.material.setProperty('feather', this.getFeather(this._feather));
    }

    /**
     * 圆形镂空
     * @param center 中心坐标
     * @param radius 半径
     * @param feather 边缘虚化宽度
     */
    public circle(center?: Vec2, radius?: number, feather?: number) {
        this._shape = HollowOutShape.Circle;

        if (center !== null) this._center = center;
        if (radius !== null) this._radius = radius;
        if (feather !== null) this._feather = feather >= 0 ? feather : 0;

        this.material.setProperty('size', this.getNodeSize());
        this.material.setProperty('center', this.getCenter(this._center));
        this.material.setProperty('width', this.getWidth(this._radius * 2));
        this.material.setProperty('height', this.getHeight(this._radius * 2));
        this.material.setProperty('round', this.getRound(this._radius));
        this.material.setProperty('feather', this.getFeather(this._feather));
    }

    /**
     * 缓动镂空（矩形）
     * @param time 时间
     * @param center 中心坐标
     * @param width 宽
     * @param height 高
     * @param round 圆角半径
     * @param feather 边缘虚化宽度
     */
    public rectTo(time: number, center: Vec2, width: number, height: number, round: number = 0, feather: number = 0): Promise<void> {
        return new Promise(res => {
            Tween.stopAllByTarget(this);
            this.unscheduleAllCallbacks();

            this.tweenRes && this.tweenRes();
            this.tweenRes = res;

            if (round > width / 2) round = width / 2;
            if (round > height / 2) round = height / 2;
            if (feather > round) feather = round;

            this._shape = HollowOutShape.Rect;

            tween<HollowOut>(this)
                .to(time, {
                    center: center,
                    width: width,
                    height: height,
                    round: round,
                    feather: feather
                })
                .call(() => {
                    this.scheduleOnce(() => {
                        if (this.tweenRes) {
                            this.tweenRes();
                            this.tweenRes = null;
                        }
                    });
                })
                .start();
        });
    }

    /**
     * 缓动镂空（圆形）
     * @param time 时间
     * @param center 中心坐标
     * @param radius 半径
     * @param feather 边缘虚化宽度
     */
    public circleTo(time: number, center: Vec2, radius: number, feather: number = 0): Promise<void> {
        return new Promise(res => {
            Tween.stopAllByTarget(this);
            this.unscheduleAllCallbacks();

            this.tweenRes && this.tweenRes();
            this.tweenRes = res;

            this._shape = HollowOutShape.Circle;

            tween<HollowOut>(this)
                .to(time, {
                    center: center,
                    radius: radius,
                    feather: feather
                })
                .call(() => {
                    this.scheduleOnce(() => {
                        if (this.tweenRes) {
                            this.tweenRes();
                            this.tweenRes = null;
                        }
                    });
                })
                .start();
        });
    }

    /**
     * 取消所有挖孔
     */
    public reset() {
        this.rect(v2(), 0, 0, 0, 0);
    }

    /**
     * 挖孔设为节点大小（就整个都挖没了）
     */
    public nodeSize() {
        this._radius = Math.sqrt(this.uiTrans.width * this.uiTrans.width + this.uiTrans.height * this.uiTrans.height) / 2;
        this.rect(v2(this.node.position.x, this.node.position.y), this.uiTrans.width, this.uiTrans.height, 0, 0);
    }

    /**
     * 获取中心点
     * @param center 
     */
    private getCenter(center: Vec2) {
        let x = (center.x + (this.uiTrans.width / 2)) / this.uiTrans.width;
        let y = (-center.y + (this.uiTrans.height / 2)) / this.uiTrans.height;
        return v2(x, y);
    }

    /**
     * 获取节点尺寸
     */
    private getNodeSize() {
        return v2(this.uiTrans.width, this.uiTrans.height);
    }

    /**
     * 获取挖孔宽度
     * @param width 
     */
    private getWidth(width: number) {
        return width / this.uiTrans.width;
    }

    /**
     * 获取挖孔高度
     * @param height 
     */
    private getHeight(height: number) {
        return height / this.uiTrans.width;
    }

    /**
     * 获取圆角半径
     * @param round 
     */
    private getRound(round: number) {
        return round / this.uiTrans.width;
    }

    /**
     * 获取边缘虚化宽度
     * @param feather 
     */
    private getFeather(feather: number) {
        return feather / this.uiTrans.width;
    }

}
