import { Component, macro, _decorator } from 'cc';
import { App } from '../../mlib/App';
import { RedDot } from '../../mlib/component/RedDot';
import { EventKey } from '../../mlib/manager/EventMgr';
import { RedDotMgr } from '../../mlib/manager/RedDotMgr';
import { TaskState } from '../../mlib/misc/PlayerTask';
import { GameData } from './GameData';
const { ccclass, property } = _decorator;

@ccclass('GameRedDot')
export class GameRedDot extends Component {
    public static Inst: GameRedDot;
    onLoad() {
        GameRedDot.Inst = this;
        RedDotMgr.initRedDotTree([
            "Main",
            "Main.Dating",
            "Main.Task",
            "Main.Photo",
            "Main.Foster",
        ]);

        RedDot.GameRedDotMgr = this;
        App.event.on(EventKey.Test3, this.onTaskChange.bind(this));
        this.schedule(this.updateRedDot, 1, macro.REPEAT_FOREVER, 0);
    }

    private onTaskChange() {
        var taskItemSos = GameData.Inst.task.find(v => v.state == TaskState.Complete);
        RedDotMgr.setRedDotValue("Task", taskItemSos ? 1 : 0);
    }

    private updateRedDot() {

    }
}