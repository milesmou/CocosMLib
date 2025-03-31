import { _decorator, Label, Sprite, tween } from 'cc';
import { UIComponent } from 'db://assets/mlib/module/ui/manager/UIComponent';
import { LoadingArgs } from './LoadingArgs';
const { ccclass, property } = _decorator;

@ccclass('TipMsgLoading')
export class TipMsgLoading extends UIComponent {

    private get mask() { return this.rc.get("Mask", Sprite); }
    private get sp() { return this.rc.get("Sp", Sprite); }
    private get desc() { return this.rc.get("Desc", Label); }

    protected onLoad() {
        this.hide();
        this.playAnim();
    }

    public show(args?: LoadingArgs) {
        this.unscheduleAllCallbacks();
        this.node.active = true;
        if (args?.mask) this.mask.node.active = true;
        if (args?.content) this.desc.string = args.content;
        if (args?.duration > 0) this.scheduleOnce(this.hide, args.duration);
    }

    public hide() {
        this.node.active = false;
        this.mask.node.active = false;
        this.desc.string = "";
    }

    private playAnim() {
        tween(this.sp.node).repeatForever(tween(this.sp.node).by(1.5, { angle: -360 })).start();
    }
}


