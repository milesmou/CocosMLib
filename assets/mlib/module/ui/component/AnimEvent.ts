import { _decorator, Animation, Component, sp } from "cc";

const { ccclass, property } = _decorator;

/** 
 * 用于监听Animation和Spine的关键帧事件
 * 监听Animation事件 动画编辑器的帧事件Function填event,参数填 事件名_事件参数
 * 监听Spine事件 spine的事件名填 事件名_事件参数
 */
@ccclass
export default class AnimEvent extends Component {

    @property(sp.Skeleton)
    private spines: sp.Skeleton[] = [];
    @property(Animation)
    private anims: Animation[] = [];

    private _sep = "_";//事件名和参数分隔符

    private _listener: (evtName: string, arg: string) => void;

    protected onLoad(): void {
        this.initSpines();
        this.initAnimations();
    }

    public addSpine(spine: sp.Skeleton) {
        if (!spine?.isValid) return;
        if (!this.spines.includes(spine)) this.spines.push(spine);
        this.registerSpineListener(spine);
    }

    public addAnimation(anim: Animation) {
        if (!anim?.isValid) return;
        if (!this.anims.includes(anim)) this.anims.push(anim);
        this.registerAnimListener(anim);
    }

    private initSpines() {
        for (const spine of this.spines) {
            this.registerSpineListener(spine);
        }
    }

    private initAnimations() {
        for (const anim of this.anims) {
            this.registerAnimListener(anim);
        }
    }

    private registerSpineListener(spine: sp.Skeleton) {
        spine.setEventListener(this.spineEventListener.bind(this) as any);
    }

    private registerAnimListener(anim: Animation) {
        let animE = anim.getComponent(AnimEvent) || anim.addComponent(AnimEvent);
        if (animE != this) animE.setEventListener(this.animEventListener.bind(this));//避免死循环 需要判断
    }

    protected event(evt: string) {
        let arr = evt.split(this._sep);
        this._listener && this._listener(arr[0], arr[1]);
    }

    private spineEventListener(trackEntry: sp.spine.TrackEntry, evt: sp.spine.Event) {
        let arr = evt.data.name.split(this._sep);
        this._listener && this._listener(arr[0], arr[1]);
    }

    private animEventListener(evtName: string, arg: string) {
        this._listener && this._listener(evtName, arg);
    }

    public setEventListener(listener: (evtName: string, arg: string) => void) {
        this._listener = listener;
    }
}
