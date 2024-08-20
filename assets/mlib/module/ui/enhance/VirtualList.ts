import { Component, Mask, Node, ScrollView, UITransform, _decorator, geometry, instantiate } from "cc";
import { CCUtils } from "../../../utils/CCUtil";
import { ObjectPool } from "../../pool/ObjectPool";

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
/**
 * DC优化 循环利用Item节点
 * 使用说明： Content中的子节点为空节点 在空节点中放Item节点并循环利用
 * 空节点的作用是用于定位和检测显示隐藏
 * 只适用于Item尺寸一致的列表
 */
@ccclass('VirtualList')
@requireComponent(ScrollView)
export class VirtualList extends Component {
    @property({
        displayName: "检测频率",
        tooltip: "滚动时，多少帧进行一次检测",
        range: [1, 5],
        slide: true,
    })
    @integer
    private m_optimizeFrame = 2;

    @property({
        type: Node,
        displayName: "ChildNode",
        tooltip: "Content的子节点,根节点只有大小信息,有一个Item子节点\n不填则使用Content的第一个子节点",
    })
    private m_childNode: Node = null;

    private _scrollview: ScrollView;
    public get scrollview() { return this._scrollview; }
    private _view: Node;
    private _content: Node;
    private _viewAABB: geometry.AABB = new geometry.AABB();//重复利用避免GC过多
    private _childAABB: geometry.AABB = new geometry.AABB();//重复利用避免GC过多

    private _scrollingFrameCnt = 0;
    /** 当前是否正准备刷新Item的显隐,避免同一帧多次检测 */
    private _readyUpdate = false;
    /** 本次检测过程中记录已检测过Item的显隐 */
    private _onceUpdateitemVisible: Map<number, boolean> = new Map();
    /** 记录Item的显隐状况 避免重复触发itemRenderer */
    private _itemVisible: Map<number, boolean> = new Map();
    /** 本次检测过程中siblingIndex的左区间，小于它的Item都会被隐藏 -1表示无效 */
    private _siblingIndexLeft = -1;
    /** 本次检测过程中siblingIndex的右区间，大于它的Item都会被隐藏 -1表示无效 */
    private _siblingIndexRight = -1;

    private _itemNode: Node;
    private _itemPool: ObjectPool<Node>;
    private _numItems: number;
    private _itemRenderer: (item: Node, index: number) => void;
    public get numItems() { return this._numItems; }
    public set numItems(value: number) {
        if (!this._itemRenderer) {
            mLogger.error("必须先设置itemRenderer");
            return;
        }
        this._numItems = value;
        for (let i = 0; i < value; i++) {
            let node = this._content.children[i];
            if (!node) {
                node = instantiate(this.m_childNode);
                node.parent = this._content;
            }
            node.active = true;
        }
        for (let i = value, len = this._content.children.length; i < len; i++) {
            this._content.children[i].active = false;
        }
        this._itemVisible.clear();//刷新数据时,清除显隐缓存
        this.delayUpdateItemsVisible();
    }

    public set itemRenderer(value: (item: Node, index: number) => void) {
        this._itemRenderer = value;
    }

    protected onLoad(): void {
        this._scrollview = this.getComponent(ScrollView);
        if (!this._scrollview) return;
        this._content = this.scrollview.content;

        this.m_childNode = this.m_childNode || this._scrollview.content.children[0];
        if (this.m_childNode.children.length > 1) {
            mLogger.error("节点下只能有一个Item节点");
            return;
        }
        this._itemNode = this.m_childNode.children[0];
        this.m_childNode.removeFromParent();
        this.m_childNode.removeAllChildren();

        this._itemPool = new ObjectPool<Node>({
            defaultCreateNum: 5,
            newObject: () => {
                return instantiate(this._itemNode);
            },
            onPutObject: obj => {
                obj.parent = null;
            }
        });

        this._view = this.getComponentInChildren(Mask).node;
        CCUtils.addEventToComp(this._scrollview, this.node, "VirtualList", "onScrolling");
    }

    protected onEnable(): void {
        this._view.on(Node.EventType.SIZE_CHANGED, this.delayUpdateItemsVisible, this);
        this._content.on(Node.EventType.SIZE_CHANGED, this.delayUpdateItemsVisible, this);
    }

    protected onDisable(): void {
        this._view.off(Node.EventType.SIZE_CHANGED, this.delayUpdateItemsVisible, this);
        this._content.off(Node.EventType.SIZE_CHANGED, this.delayUpdateItemsVisible, this);
    }


    private onScrolling(scrollview: ScrollView, event: number) {
        switch (event) {
            case eventMap.scrolling:
                this._scrollingFrameCnt += 1;
                this._scrollingFrameCnt %= this.m_optimizeFrame;
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
        if (maxOffset.x > 0 && offset.x < maxOffset.x / 2 || maxOffset.y > 0 && offset.y < maxOffset.y / 2) {//顺序
            for (let i = 0, len = this._content.children.length; i < len; i++) {
                this.setItemVisible(i);
                if (i > 0 && this._siblingIndexRight < 0) {
                    if (!this._onceUpdateitemVisible.get(i) && this._onceUpdateitemVisible.get(i - 1)) {
                        this._siblingIndexRight = i;
                    }
                }
            }
        } else {//倒序
            for (let i = this._content.children.length - 1; i >= 0; i--) {
                this.setItemVisible(i);
                if (i < this._content.children.length - 1 && this._siblingIndexLeft < 0) {
                    if (!this._onceUpdateitemVisible.get(i) && this._onceUpdateitemVisible.get(i + 1)) {
                        this._siblingIndexLeft = i;
                    }
                }
            }
        }
    }


    private setItemVisible(index: number) {
        const childNode = this._content.children[index];
        if (!childNode.active) return;//忽略隐藏的Item
        let visible: boolean;
        if (this._siblingIndexLeft > -1 && index < this._siblingIndexLeft) {
            visible = false;
        } else if (this._siblingIndexRight > -1 && index > this._siblingIndexRight) {
            visible = false;
        } else {
            this._childAABB = childNode.getComponent(UITransform).getComputeAABB();
            visible = geometry.intersect.aabbWithAABB(this._viewAABB, this._childAABB);
        }

        this._onceUpdateitemVisible.set(index, visible);
        let lastVisible = this._itemVisible.get(index) || false;
        this._itemVisible.set(index, visible);
        if (lastVisible != visible) {
            if (visible) {
                let item = childNode.children[0];
                if (!item?.isValid) {
                    item = this._itemPool.get();
                    item.parent = childNode;
                }
                this._itemRenderer(item, index);
            } else {
                let item = childNode.children[0];
                if (item?.isValid) {
                    this._itemPool.put(item);
                }
            }
        }
    }
}