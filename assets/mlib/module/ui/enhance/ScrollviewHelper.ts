import { Component, Mask, Node, Rect, ScrollView, UIOpacity, UITransform, _decorator } from 'cc';
import { CCUtils } from '../../../utils/CCUtil';
const { ccclass, property, requireComponent, integer } = _decorator;

let eventMap = {
    'scroll-to-top': 0,
    'scroll-to-bottom': 1,
    'scroll-to-left': 2,
    'scroll-to-right': 3,
    "scrolling": 4,
    'bounce-bottom': 6,
    'bounce-left': 7,
    'bounce-right': 8,
    'bounce-top': 5,
    'scroll-ended': 9,
    'touch-up': 10,
    'scroll-ended-with-threshold': 11,
    'scroll-began': 12,
};

@ccclass('ScrollviewHelper')
@requireComponent(ScrollView)
export class ScrollviewHelper extends Component {
    @property({
        displayName: "DC优化",
        tooltip: "滚动时检测Item节点是否在视图范围内，自动隐藏视图范围外Item节点"
    })
    private m_dcOptimize = true;
    @property({
        displayName: "检测频率",
        tooltip: "滚动时，多少帧进行一次优化DC的检测",
        range: [1, 5],
        slide: true
    })
    @integer
    private m_dcOptimizeFrame = 1;

    private _scrollview: ScrollView;
    private _view: Node;
    private _content: Node;
    private _viewRect: Rect;

    private _scrollingFrameCnt = 0;


    protected onLoad() {
        this.init();
        this.node.getSiblingIndex()
    }

    protected onEnable(): void {
        this._view.on(Node.EventType.SIZE_CHANGED, this.onViewSizeChanged, this);
        this._content.on(Node.EventType.CHILD_ADDED, this.onContentChildChanged, this);
        this._content.on(Node.EventType.CHILD_REMOVED, this.onContentChildChanged, this);
    }

    protected onDisable(): void {
        this._view.off(Node.EventType.SIZE_CHANGED, this.onViewSizeChanged, this);
        this._content.off(Node.EventType.CHILD_ADDED, this.onContentChildChanged, this);
        this._content.off(Node.EventType.CHILD_REMOVED, this.onContentChildChanged, this);
    }

    private init() {
        this._scrollview = this.getComponent(ScrollView);
        if (!this._scrollview) return;
        this._view = this.getComponentInChildren(Mask).node;
        this._content = this._scrollview.content;
        if(!this.m_dcOptimize) return;
        this.onViewSizeChanged();
        this.onContentChildChanged();
        CCUtils.addEventToComp(this._scrollview, this.node, "ScrollviewHelper", "onScrolling");
    }

    private onViewSizeChanged() {
        if(!this.m_dcOptimize) return;
        this._viewRect = this._view.getComponent(UITransform).getBoundingBoxToWorld();
        this.updateItemVisible();
    }

    private onContentChildChanged() {
        if(!this.m_dcOptimize) return;
        this.updateItemVisible();
    }

    private onScrolling(scrollview: ScrollView, event: number) {
        switch (event) {
            case eventMap.scrolling:
                this._scrollingFrameCnt += 1;
                this._scrollingFrameCnt %= this.m_dcOptimizeFrame;
                if (this._scrollingFrameCnt == 0) this.updateItemVisible();
                break;
            case eventMap['scroll-began']:
                this.updateItemVisible();
                break;
            case eventMap['scroll-ended']:
                this.updateItemVisible();
                break;
        }

    }


    private updateItemVisible() {
        for (const child of this._content.children) {
            let uiOpacity = child.getComponent(UIOpacity);
            if (!uiOpacity) uiOpacity = child.addComponent(UIOpacity);
            let rect = child.getComponent(UITransform).getBoundingBoxToWorld();
            uiOpacity.opacity = this._viewRect.intersects(rect) ? 255 : 0;
        }
    }





}


