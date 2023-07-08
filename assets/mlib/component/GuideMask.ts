import { _decorator, Component, EffectAsset, EventTouch, Material, math, Node, Rect, Sprite, tween, UITransform } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

export enum EMaskHollowType {
    Rect = 1,
    Circle = 2
}

class HollowArgs {
    center: math.Vec2 = new math.Vec2(0, 0);//[0,1]
    width: number = 0;//[0,1]
    height: number = 0;//[0,1]
    round: number = 0;//[0,1]
    feather: number = 0.1;//[0,1]
}


@ccclass('GuideMask')
@requireComponent(Sprite)
export class GuideMask extends Component {
    @property(EffectAsset)
    hollowShader: EffectAsset = null;

    private _sprite: Sprite = null;
    private _material: Material = null;
    private _uiTrans: UITransform = null;

    private _lastHollowArgs: HollowArgs;
    private _nowHollowArgs: HollowArgs;
    private _hollowType: EMaskHollowType;
    private _target: Node = null;
    private _targetRect: Rect = null;
    private _scale: number = 0;
    private _duration: number = 0;



    protected onLoad(): void {
        this._sprite = this.getComponent(Sprite);
        this._uiTrans = this.getComponent(UITransform);
        this.node.on(Node.EventType.TOUCH_START, this.stopTouchEvent, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.stopTouchEvent, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.stopTouchEvent, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    protected start() {
        this._material = new Material();
        this._material.initialize({ effectAsset: this.hollowShader });
        this._sprite.customMaterial = this._material;
        this._material.setProperty("size", new math.Vec2(this._uiTrans.width, this._uiTrans.height), 0);
    }

    public resetHollow() {
        this._lastHollowArgs = { center: math.v2(0, 0), width: 0, height: 0, round: 0.01, feather: 0 };
        this._material.setProperty("center", this._lastHollowArgs.center, 0);
        this._material.setProperty("width", this._lastHollowArgs.width, 0);
        this._material.setProperty("height", this._lastHollowArgs.height, 0);
        this._material.setProperty("round", this._lastHollowArgs.round, 0);
        this._material.setProperty("feather", this._lastHollowArgs.feather, 0);
    }


    public hollow(type: EMaskHollowType, target: Node, scale: number, duration: number) {
        this._hollowType = type;
        this._target = target;
        this._targetRect = target.getComponent(UITransform).getBoundingBoxToWorld();
        this._scale = scale;
        this._duration = duration;
        this.tweenHollow();
    }

    private tweenHollow() {
        tween(this._lastHollowArgs).to(this._duration, this._nowHollowArgs, {
            onUpdate: () => {
                this._material.setProperty("center", this._lastHollowArgs.center, 0);
                this._material.setProperty("width", this._lastHollowArgs.width, 0);
                this._material.setProperty("height", this._lastHollowArgs.height, 0);
                this._material.setProperty("round", this._lastHollowArgs.round, 0);
                this._material.setProperty("feather", this._lastHollowArgs.feather, 0);
            }
        }).start();
    }



    private stopTouchEvent(evt: EventTouch) {
        evt.propagationStopped = true;
    }

    private onTouchEnd(evt: EventTouch) {
        let pos = evt.getUILocation();
        if (
            pos.x > this._targetRect.xMin && pos.x < this._targetRect.xMax &&
            pos.y > this._targetRect.yMin && pos.y < this._targetRect.yMax
        ) {
            evt.propagationStopped = false;
        } else {
            evt.propagationStopped = true;
        }

    }

}


