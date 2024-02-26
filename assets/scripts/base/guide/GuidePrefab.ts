import { Component } from "cc";
import { MEvent } from "../../../mlib/module/event/MEvent";

export class GuidePrefab extends Component {

    public onClose: MEvent = new MEvent();

    public init(guideId: number, stepIndex: number) {

    }

    protected close() {
        this.onClose.dispatch();
    }
}