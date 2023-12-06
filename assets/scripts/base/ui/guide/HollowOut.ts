import { Component, Material, Sprite, Tween, UITransform, Vec2, _decorator, tween, v2 } from "cc";

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
@disallowMultiple
@executionOrder(-100)
export class HollowOut extends Component {

    private _material: Material = null;

    private _shape: HollowOutShape = HollowOutShape.Rect;
    public get shape() { return this._shape; }
    public set shape(val: HollowOutShape) { this._shape = val; this.updateProperties(); }

    private _center: Vec2 = v2();
    public get center() { return this._center; }
    public set center(val: Vec2) { this._center = val; this.updateProperties(); }

    private _width: number = 300;
    public get width() { return this._width; }
    public set width(val: number) { this._width = val; this.updateProperties(); }

    private _height: number = 300;
    public get height() { return this._height; }
    public set height(val: number) { this._height = val; this.updateProperties(); }

    private _round: number = 1;
    public get round() { return this._round; }
    public set round(val: number) { this._round = val; this.updateProperties(); }

    private _radius: number = 200;
    public get radius() { return this._radius; }
    public set radius(val: number) { this._radius = val; this.updateProperties(); }

    private _feather: number = 0.5;
    public get feather() { return this._feather; }
    public set feather(val: number) { this._feather = val; this.updateProperties(); }

    private _uiTrans: UITransform;

    private _sprite: Sprite = null;


    private _tweenRes: () => void = null;


    protected onLoad() {
        this.init();
    }

    /**
     * 初始化组件
     */
    private init() {
        this._uiTrans = this.getComponent(UITransform);
        this._sprite = this.node.getComponent(Sprite);
        this._material = this._sprite.customMaterial;
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

        this._material.setProperty('size', this.getNodeSize());
        this._material.setProperty('center', this.getCenter(this._center));
        this._material.setProperty('width', this.getWidth(this._width));
        this._material.setProperty('height', this.getHeight(this._height));
        this._material.setProperty('round', this.getRound(this._round));
        this._material.setProperty('feather', this.getFeather(this._feather));
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

        this._material.setProperty('size', this.getNodeSize());
        this._material.setProperty('center', this.getCenter(this._center));
        this._material.setProperty('width', this.getWidth(this._radius * 2));
        this._material.setProperty('height', this.getHeight(this._radius * 2));
        this._material.setProperty('round', this.getRound(this._radius));
        this._material.setProperty('feather', this.getFeather(this._feather));
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

            this._tweenRes && this._tweenRes();
            this._tweenRes = res;

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
                        if (this._tweenRes) {
                            this._tweenRes();
                            this._tweenRes = null;
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

            this._tweenRes && this._tweenRes();
            this._tweenRes = res;

            this._shape = HollowOutShape.Circle;

            tween<HollowOut>(this)
                .to(time, {
                    center: center,
                    radius: radius,
                    feather: feather
                })
                .call(() => {
                    this.scheduleOnce(() => {
                        if (this._tweenRes) {
                            this._tweenRes();
                            this._tweenRes = null;
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
        this._radius = Math.sqrt(this._uiTrans.width * this._uiTrans.width + this._uiTrans.height * this._uiTrans.height) / 2;
        this.rect(v2(this.node.position.x, this.node.position.y), this._uiTrans.width, this._uiTrans.height, 0, 0);
    }

    /**
     * 获取中心点
     * @param center 
     */
    private getCenter(center: Vec2) {
        let x = (center.x + (this._uiTrans.width / 2)) / this._uiTrans.width;
        let y = (-center.y + (this._uiTrans.height / 2)) / this._uiTrans.height;
        return v2(x, y);
    }

    /**
     * 获取节点尺寸
     */
    private getNodeSize() {
        return v2(this._uiTrans.width, this._uiTrans.height);
    }

    /**
     * 获取挖孔宽度
     * @param width 
     */
    private getWidth(width: number) {
        return width / this._uiTrans.width;
    }

    /**
     * 获取挖孔高度
     * @param height 
     */
    private getHeight(height: number) {
        return height / this._uiTrans.width;
    }

    /**
     * 获取圆角半径
     * @param round 
     */
    private getRound(round: number) {
        return round / this._uiTrans.width;
    }

    /**
     * 获取边缘虚化宽度
     * @param feather 
     */
    private getFeather(feather: number) {
        return feather / this._uiTrans.width;
    }

}
