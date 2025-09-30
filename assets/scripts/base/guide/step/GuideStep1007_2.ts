import { _decorator, EventTouch, Node, Vec2 } from 'cc';
import { Switch } from '../../../../mlib/module/ui/component/Switch';
import { EMachineState } from '../../../game/fightScene/EMachineState';
import { Machine } from '../../../game/fightScene/Machine';
import { MachineId2 } from '../../../game/fightScene/MachineId';
import { GuidePrefab } from '../GuidePrefab';
const { ccclass, property } = _decorator;

@ccclass('GuideStep1007_2')
export class GuideStep1007_2 extends GuidePrefab {

    private _switch: Switch;

    private _machine1: Machine;
    private _machine2: Machine;

    private _stage = 0;
    private _touPos = new Vec2();

    protected onLoad(): void {
        this._switch = this.getComponent(Switch);
        this._machine1 = Machine.machines.get(MachineId2.NoodlePlate);
        this._machine2 = Machine.machines.get(MachineId2.WontonPlate);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    public init(guideId: number, stepId: number) {
        this._switch.updateCheck(0);
    }

    private onTouchMove(event: EventTouch) {
        event.getUILocation(this._touPos);
        if (this._stage == 0) {
            for (const part of this._machine1.parts.values()) {
                if (!part.isIdel()) {
                    if (part.touchArea.contains(this._touPos)) {
                        this._machine1.onClick(part.name, 0);
                    }
                }
            }
            if (!this._machine1.hasState(EMachineState.Complete)) {
                this._stage = 1;
                this._switch.updateCheck(1);
            }
        } else if (this._stage == 1) {
            for (const part of this._machine2.parts.values()) {
                if (!part.isIdel()) {
                    if (part.touchArea.contains(this._touPos)) {
                        this._machine2.onClick(part.name, 0);
                    }
                }
            }
            if (!this._machine2.hasState(EMachineState.Complete)) {
                this.close();
            }
        }
    }





}


