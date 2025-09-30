import { _decorator, EventTouch, Node, Vec2 } from 'cc';
import { EMachineState } from '../../../game/fightScene/EMachineState';
import { Machine } from '../../../game/fightScene/Machine';
import { MachinePart } from '../../../game/fightScene/MachinePart';
import { GuidePrefab } from '../GuidePrefab';
const { ccclass, property } = _decorator;

@ccclass('GuideStep1014_1')
export class GuideStep1014_1 extends GuidePrefab {


    private _machine: Machine;
    private _part: MachinePart;

    private _stage = 0;
    private _touPos = new Vec2();

    private _lastClickTimeMS = 0;

    protected onLoad(): void {
        this._machine = Machine.machines.find(v => v.hasState(EMachineState.Spoil));
        this._part = this._machine.parts.find(v => v.isState(EMachineState.Spoil));
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    public init(guideId: number, stepId: number) {

    }

    private onTouchEnd(event: EventTouch) {
        event.getUILocation(this._touPos);
        if (this._part.touchArea.contains(this._touPos)) {
            let now = Date.now();
            if (now - this._lastClickTimeMS < 250) {
                this._machine.onClick(this._part.name, 2);
                this.close();
            }
            this._lastClickTimeMS = now;
        }

    }





}


