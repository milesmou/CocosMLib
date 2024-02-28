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

@ccclass('ScrollviewEnhance')
@requireComponent(ScrollView)
export class ScrollviewEnhance extends Component {
    @property({
        displayName: "DC优化",
        tooltip: "滚动时检测Item节点是否在视图范围内，自动隐藏视图范围外Item节点"
    })
    private m_dcOptimize = true;
    @property({
        displayName: "检测频率",
        tooltip: "滚动时，多少帧进行一次优化DC的检测",
        range: [1, 5],
        slide: true,
    })
    @integer
    private m_dcOptimizeFrame = 2;

    private _scrollview: ScrollView;
    private _view: Node;
    private _content: Node;
    private _viewRect: Rect;

    private _scrollingFrameCnt = 0;
    /** 当前是否能够刷新Item的显隐,避免同一帧多次检测 */
    private _canUpdateItemVisible = true;
    /** 本次检测过程中记录已检测过Item的显隐 */
    private _itemVisible: Map<number, boolean> = new Map();
    /** 本次检测过程中siblingIndex的左区间，小于它的Item都会被隐藏 -1表示无效 */
    private _siblingIndexLeft = -1;
    /** 本次检测过程中siblingIndex的右区间，大于它的Item都会被隐藏 -1表示无效 */
    private _siblingIndexRight = -1;

    protected onLoad() {
        this.init();
    }

    protected onEnable(): void {
        this._view.on(Node.EventType.SIZE_CHANGED, this.onViewChanged, this);
        this._view.on(Node.EventType.TRANSFORM_CHANGED, this.onViewChanged, this);
        this._content.on(Node.EventType.CHILD_ADDED, this.onContentChildChanged, this);
        this._content.on(Node.EventType.CHILD_REMOVED, this.onContentChildChanged, this);
    }

    protected onDisable(): void {
        this._view.off(Node.EventType.SIZE_CHANGED, this.onViewChanged, this);
        this._view.off(Node.EventType.TRANSFORM_CHANGED, this.onViewChanged, this);
        this._content.off(Node.EventType.CHILD_ADDED, this.onContentChildChanged, this);
        this._content.off(Node.EventType.CHILD_REMOVED, this.onContentChildChanged, this);
    }

    private init() {
        this._scrollview = this.getComponent(ScrollView);
        if (!this._scrollview) return;
        this._view = this.getComponentInChildren(Mask).node;
        this._content = this._scrollview.content;
        if (!this.m_dcOptimize) return;
        this.onViewChanged();
        this.onContentChildChanged();
        CCUtils.addEventToComp(this._scrollview, this.node, "ScrollviewEnhance", "onScrolling");
    }

    private onViewChanged() {
        if (!this.m_dcOptimize) return;
        this._viewRect = this._view.getComponent(UITransform).getBoundingBoxToWorld();
        this.updateItemsVisible();
    }

    private onContentChildChanged() {
        if (!this.m_dcOptimize) return;
        this.updateItemsVisible();
    }

    private onScrolling(scrollview: ScrollView, event: number) {
        switch (event) {
            case eventMap.scrolling:
                this._scrollingFrameCnt += 1;
                this._scrollingFrameCnt %= this.m_dcOptimizeFrame;
                if (this._scrollingFrameCnt == 0) this.updateItemsVisible();
                break;
            case eventMap['scroll-ended']:
                this.updateItemsVisible();
                break;
        }
    }


    private updateItemsVisible() {
        if (!this._canUpdateItemVisible) return;
        this._canUpdateItemVisible = false;

        this._itemVisible.clear();
        this._siblingIndexLeft = -1;
        this._siblingIndexRight = -1;
        //根据当前滚动范围选择顺序或者倒序便利
        let maxOffset = this._scrollview.getMaxScrollOffset();
        let offset = this._scrollview.getScrollOffset();
        if (maxOffset.x > 0 && offset.x < maxOffset.x / 2 || maxOffset.y > 0 && offset.y < maxOffset.y / 2) {//顺序
            for (let i = 0, len = this._content.children.length; i < len; i++) {
                this.setItemVisible(i);
                if (i > 0 && this._siblingIndexRight < 0) {
                    if (!this._itemVisible.get(i) && this._itemVisible.get(i - 1)) {
                        this._siblingIndexRight = i;
                    }
                }
            }
        } else {//倒序
            for (let i = this._content.children.length - 1; i >= 0; i--) {
                this.setItemVisible(i);
                if (i < this._content.children.length - 1 && this._siblingIndexLeft < 0) {
                    if (!this._itemVisible.get(i) && this._itemVisible.get(i + 1)) {
                        this._siblingIndexLeft = i;
                    }
                }
            }
        }
    }

    private setItemVisible(index: number) {
        const item = this._content.children[index];
        let uiOpacity = item.getComponent(UIOpacity);
        if (!uiOpacity) uiOpacity = item.addComponent(UIOpacity);

        let visible: boolean;
        if (this._siblingIndexLeft > -1 && index < this._siblingIndexLeft) {
            visible = false;
        } else if (this._siblingIndexRight > -1 && index > this._siblingIndexRight) {
            visible = false;
        } else {
            let rect = item.getComponent(UITransform).getBoundingBoxToWorld();
            visible = this._viewRect.intersects(rect);
        }

        uiOpacity.opacity = visible ? 255 : 0;
        this._itemVisible.set(index, visible);
    }

    protected update(dt: number) {
        this._canUpdateItemVisible = true;
    }

}


