import { _decorator, EventTouch, Node, Vec2 } from 'cc';
import { EMachineState } from '../../../game/fightScene/EMachineState';
import { Machine } from '../../../game/fightScene/Machine';
import { MachineId1 } from '../../../game/fightScene/MachineId';
import { GuidePrefab } from '../GuidePrefab';
const { ccclass, property } = _decorator;

@ccclass('GuideStep1041_Side')
export class GuideStep1041_Side extends GuidePrefab {


    private _machine: Machine;

    private _touPos = new Vec2();

    protected onLoad(): void {
        this._machine = Machine.machines.get(MachineId1.PancakePlate);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    public init(guideId: number, stepId: number) {

    }

    private onTouchMove(event: EventTouch) {
        event.getUILocation(this._touPos);
        for (const part of this._machine.parts.values()) {
            if (!part.isIdel()) {
                if (part.touchArea.contains(this._touPos)) {
                    this._machine.onClick(part.name, 0);
                }
            }
        }
        if (!this._machine.hasState(EMachineState.Complete)) {
            this.close();
        }
    }


    


}


