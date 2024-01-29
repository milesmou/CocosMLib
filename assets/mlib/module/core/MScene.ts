import { _decorator, Component } from "cc";
import { TimerComponent } from "./TimerComponent";

const { ccclass, property } = _decorator;

@ccclass
export class MScene extends Component {
    
    private _timer: TimerComponent;
    public get timer() { return this._timer; }

    protected __preload(): void {
        this._timer = this.addComponent(TimerComponent);
    }
}
