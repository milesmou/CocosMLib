import { MComponent } from "../../../../mlib/component/MComponent";
import { MEvent } from "../../../../mlib/module/event/MEvent";



export abstract class 
GuidePrefab extends MComponent {

    public onClose: MEvent = new MEvent();

    abstract init(guideId: number, stepIndex: number);

    protected close() {
        this.onClose.dispatch();
    }
}