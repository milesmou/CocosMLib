import { Component, Mask, Node, ScrollView, UIOpacity, UITransform, _decorator, geometry } from 'cc';
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
/** 用于DC的优化 隐藏不在视图范围内的节点 */
@ccclass('ScrollviewEnhance')
@requireComponent(ScrollView)
export class ScrollviewEnhance extends Component {
    @property({
        displayName: "检测频率",
        tooltip: "滚动时，多少帧进行一次检测",
        range: [1, 5],
        slide: true,
    })
    @integer
    private m_dcOptimizeFrame = 2;
    @property({
        type: Node,
        displayName: "Content",
        tooltip: "需要优化DC元素的父节点，默认使用ScrollView的content"
    })
    private m_content: Node;


    private _scrollview: ScrollView;
    private _view: Node;
    private _viewAABB: geometry.AABB = new geometry.AABB();//重复利用避免GC过多
    private _childAABB: geometry.AABB = new geometry.AABB();//重复利用避免GC过多

    private _scrollingFrameCnt = 0;
    /** 当前是否正准备刷新Item的显隐,避免同一帧多次检测 */
    private _readyUpdate = false;
    /** 本次检测过程中记录已检测过Item的显隐 */
    private _onceUpdateitemVisible: Map<number, boolean> = new Map();
    /** 本次检测过程中siblingIndex的左区间，小于它的Item都会被隐藏 -1表示无效 */
    private _siblingIndexLeft = -1;
    /** 本次检测过程中siblingIndex的右区间，大于它的Item都会被隐藏 -1表示无效 */
    private _siblingIndexRight = -1;

    protected onLoad() {
        this.init();
    }

    protected onEnable(): void {
        this._view.on(Node.EventType.SIZE_CHANGED, this.delayUpdateItemsVisible, this);
        this.m_content.on(Node.EventType.SIZE_CHANGED, this.delayUpdateItemsVisible, this);
    }

    protected onDisable(): void {
        this._view.off(Node.EventType.SIZE_CHANGED, this.delayUpdateItemsVisible, this);
        this.m_content.off(Node.EventType.SIZE_CHANGED, this.delayUpdateItemsVisible, this);
    }

    private init() {
        this._scrollview = this.getComponent(ScrollView);
        if (!this._scrollview) return;
        this._view = this.getComponentInChildren(Mask).node;
        this.m_content = this.m_content || this._scrollview.content;
        this.delayUpdateItemsVisible();
        CCUtils.addEventToComp(this._scrollview, this.node, "ScrollviewEnhance", "onScrolling");
    }



    private onScrolling(scrollview: ScrollView, event: number) {
        switch (event) {
            case eventMap.scrolling:
                this._scrollingFrameCnt += 1;
                this._scrollingFrameCnt %= this.m_dcOptimizeFrame;
                if (this._scrollingFrameCnt == 0) this.delayUpdateItemsVisible();
                break;
            case eventMap['scroll-ended']:
                this.delayUpdateItemsVisible();
                break;
        }
    }


    private delayUpdateItemsVisible() {
        if (!this._readyUpdate) {
            this._readyUpdate = true;
            this.scheduleOnce(() => {
                this._readyUpdate = false;
                this.updateItemsVisible();
            });
        }
    }


    private updateItemsVisible() {

        this._view.getComponent(UITransform).getComputeAABB(this._viewAABB);

        this._onceUpdateitemVisible.clear();
        this._siblingIndexLeft = -1;
        this._siblingIndexRight = -1;
        //根据当前滚动范围选择顺序或者倒序遍历
        let maxOffset = this._scrollview.getMaxScrollOffset();
        let offset = this._scrollview.getScrollOffset();

        if (maxOffset.x > 0 && offset.x > maxOffset.x / 2 || maxOffset.y > 0 && offset.y > maxOffset.y / 2) {//倒序
            for (let i = this.m_content.children.length - 1; i >= 0; i--) {
                this.setItemVisible(i);
                if (i < this.m_content.children.length - 1 && this._siblingIndexLeft < 0) {
                    if (!this._onceUpdateitemVisible.get(i) && this._onceUpdateitemVisible.get(i + 1)) {
                        this._siblingIndexLeft = i;
                    }
                }
            }
        } else {//顺序
            for (let i = 0, len = this.m_content.children.length; i < len; i++) {
                this.setItemVisible(i);
                if (i > 0 && this._siblingIndexRight < 0) {
                    if (!this._onceUpdateitemVisible.get(i) && this._onceUpdateitemVisible.get(i - 1)) {
                        this._siblingIndexRight = i;
                    }
                }
            }
        }
    }

    private setItemVisible(index: number) {
        const item = this.m_content.children[index];
        let uiOpacity = item.getComponent(UIOpacity);
        if (!uiOpacity) uiOpacity = item.addComponent(UIOpacity);

        let visible: boolean;
        if (this._siblingIndexLeft > -1 && index < this._siblingIndexLeft) {
            visible = false;
        } else if (this._siblingIndexRight > -1 && index > this._siblingIndexRight) {
            visible = false;
        } else {
            item.getComponent(UITransform).getComputeAABB(this._childAABB);
            visible = geometry.intersect.aabbWithAABB(this._viewAABB, this._childAABB);
        }

        uiOpacity.opacity = visible ? 255 : 0;
        this._onceUpdateitemVisible.set(index, visible);
    }

}