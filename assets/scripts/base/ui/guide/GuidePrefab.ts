import { Component } from "cc";
import { MEvent } from "../../../../mlib/module/event/MEvent";



export abstract class
    GuidePrefab extends Component {

    public onClose: MEvent = new MEvent();

    abstract init(guideId: number, stepIndex: number);

    protected close() {
        this.onClose.dispatch();
    }
}