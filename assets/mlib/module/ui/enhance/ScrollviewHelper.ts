import { _decorator, Node,Component, Enum, ScrollView } from 'cc';
import { CCUtils } from '../../../utils/CCUtil';
const { ccclass, property, requireComponent } = _decorator;

const tt = Enum(ScrollView.EventType);

@ccclass('ScrollviewHelper')
@requireComponent(ScrollView)
export class ScrollviewHelper extends Component {

    private _scrollview: ScrollView;

    onLoad() {
        this._scrollview = this.getComponent(ScrollView);
        if (!this._scrollview) return;
        this._scrollview.scrollEvents
        CCUtils.addEventToComp(this._scrollview, this.node, "ScrollviewHelper", "onScroll");
        console.log(tt);
        
    }

    onScroll(scrollview: ScrollView, e: number) {
       
        console.log(arguments);
        
    }

}


