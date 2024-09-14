import { Vec2 } from 'cc';
import { Component, Node, UIOpacity, Vec3, _decorator, geometry } from 'cc';
const { ccclass, property, disallowMultiple, integer } = _decorator;

/** 优化列表的DC 隐藏不在视图范围内的节点 */
@ccclass('ListEnhance')
@disallowMultiple
export class ListEnhance extends Component {
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
        displayName: "View",
        tooltip: "显示范围"
    })
    private m_view: Node;

    private _wPosition = new Vec2();
    private _wRotation = new Vec2();
    private _wScale = new Vec2();

    private _viewAABB: geometry.AABB = new geometry.AABB();//重复利用避免GC过多
    private _childAABB: geometry.AABB = new geometry.AABB();//重复利用避免GC过多

    /** 当前是否正准备刷新Item的显隐,避免同一帧多次检测 */
    private _readyUpdate = false;
    /** 在准备刷新时已经过了多少帧 */
    private _frameCnt = 0;
    /** 本次检测过程中记录已检测过Item的显隐 */
    private _onceUpdateitemVisible: Map<number, boolean> = new Map();

    protected onLoad() {
        this.delayUpdateItemsVisible();
    }

    protected onEnable(): void {
        this.m_view.on(Node.EventType.SIZE_CHANGED, this.delayUpdateItemsVisible, this);
        this.node.on(Node.EventType.SIZE_CHANGED, this.delayUpdateItemsVisible, this);
        this.node.on(Node.EventType.CHILD_ADDED, this.delayUpdateItemsVisible, this);
        this.node.on(Node.EventType.CHILD_REMOVED, this.delayUpdateItemsVisible, this);
    }

    protected onDisable(): void {
        this.m_view.off(Node.EventType.SIZE_CHANGED, this.delayUpdateItemsVisible, this);
        this.node.off(Node.EventType.SIZE_CHANGED, this.delayUpdateItemsVisible, this);
        this.node.off(Node.EventType.CHILD_ADDED, this.delayUpdateItemsVisible, this);
        this.node.off(Node.EventType.CHILD_REMOVED, this.delayUpdateItemsVisible, this);
    }




    protected update(dt: number): void {

        if (this._readyUpdate) {
            this._frameCnt++;
            if (this._frameCnt >= this.m_dcOptimizeFrame) {
                this.updateItemsVisible();
                this._readyUpdate = false;
            }
        }

        if (!this._wPosition.strictEquals2f(this.node.worldPositionX, this.node.worldPositionY)) {
            this._wPosition.x = this.node.worldPositionX;
            this._wPosition.y = this.node.worldPositionY;
            this.delayUpdateItemsVisible();
        }
    }

    private delayUpdateItemsVisible() {
        if (!this._readyUpdate) {
            this._readyUpdate = true;
            this._frameCnt = 0;
        }
    }


    private updateItemsVisible() {

        this.m_view.transform.getComputeAABB(this._viewAABB);

        this._onceUpdateitemVisible.clear();

        for (let i = 0, len = this.node.children.length; i < len; i++) {
            this.setItemVisible(i);
        }
    }

    private setItemVisible(index: number) {
        const item = this.node.children[index];
        let uiOpacity = item.getComponent(UIOpacity);
        if (!uiOpacity) uiOpacity = item.addComponent(UIOpacity);


        item.transform.getComputeAABB(this._childAABB);
        let visible = geometry.intersect.aabbWithAABB(this._viewAABB, this._childAABB);

        uiOpacity.opacity = visible ? 255 : 0;
        this._onceUpdateitemVisible.set(index, visible);
    }

}