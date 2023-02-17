
import { Component, tween, UIOpacity, UITransform, _decorator } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Shade')
export class Shade extends Component {
    @property(UIOpacity)
    uiOpacity!: UIOpacity;

    @property(UITransform)
    transform!: UITransform;

    opacity: number = 0;

    onLoad() {


        this.opacity = this.uiOpacity.opacity;
    }

    show() {
        tween(this.uiOpacity).to(0.15, { opacity: this.opacity }).start();
    }

    hide() {
        tween(this.uiOpacity).to(0.15, { opacity: 0 }).start();
    }
}
