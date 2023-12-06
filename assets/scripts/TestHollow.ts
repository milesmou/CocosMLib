import { _decorator, Component, v2 } from 'cc';
import { HollowOut } from './base/ui/guide/HollowOut';
const { ccclass, property } = _decorator;

@ccclass('TestHollow')
export class TestHollow extends Component {
    private _hollowout: HollowOut;
    onLoad() {
        this._hollowout = this.getComponent(HollowOut);

        this._hollowout.circle(v2(0, 0), 20, 0.015);
    }

    update(deltaTime: number) {

    }
}


