import {
    Component,
    Enum,
    EventTouch,
    Input,
    Mask,
    Node,
    Prefab,
    Tween,
    UITransform,
    Vec2,
    Vec3,
    Widget,
    _decorator,
    input,
    instantiate,
    math,
    tween
  } from 'cc';
  import { VScrollViewItem } from './VScrollViewItem';
  const { ccclass, property, menu } = _decorator;
  
  class InternalNodePool {
    private pools: Map<number, Node[]> = new Map();
    private prefabs: Prefab[] = [];
    private nodes: Node[] = [];
    private useNodeMode: boolean = false;
  
    constructor(prefabs: Prefab[], nodes?: Node[]) {
        this.prefabs = prefabs;
        this.nodes = nodes || [];
        this.useNodeMode = nodes && nodes.length > 0;
        const count = this.useNodeMode ? nodes.length : prefabs.length;
        for (let i = 0; i < count; i++) {
            this.pools.set(i, []);
        }
    }
  
    get(typeIndex: number): Node {
        const pool = this.pools.get(typeIndex);
        if (!pool) {
            console.error(`[VScrollView NodePool] 类型 ${typeIndex} 不存在`);
            return null;
        }
        if (pool.length > 0) {
            const node = pool.pop()!;
            node.active = true;
            return node;
        }
        let newNode: Node;
        if (this.useNodeMode) {
            const sourceNode = this.nodes[typeIndex];
            if (!sourceNode) {
                console.error(`[VScrollView NodePool] Node 类型 ${typeIndex} 模板不存在`);
                return null;
            }
            newNode = instantiate(sourceNode);
        } else {
            const sourcePrefab = this.prefabs[typeIndex];
            if (!sourcePrefab) {
                console.error(`[VScrollView NodePool] Prefab 类型 ${typeIndex} 模板不存在`);
                return null;
            }
            newNode = instantiate(sourcePrefab);
        }
        return newNode;
    }
  
    put(node: Node, typeIndex: number) {
        if (!node) return;
        const pool = this.pools.get(typeIndex);
        if (!pool) {
            console.error(`[VScrollView NodePool] 类型 ${typeIndex} 不存在`);
            node.destroy();
            return;
        }
        node.active = false;
        node.removeFromParent();
        pool.push(node);
    }
  
    clear() {
        this.pools.forEach(pool => {
            pool.forEach(node => node.destroy());
            pool.length = 0;
        });
        this.pools.clear();
    }
  
    getStats() {
        const stats: any = {};
        this.pools.forEach((pool, type) => {
            stats[`type${type}`] = pool.length;
        });
        return stats;
    }
  }
  
  export type RenderItemFn = (node: Node, index: number) => void;
  export type ProvideNodeFn = (index: number) => Node | Promise<Node>;
  export type OnItemClickFn = (node: Node, index: number) => void;
  export type OnItemLongPressFn = (node: Node, index: number) => void;
  export type PlayItemAppearAnimationFn = (node: Node, index: number) => void;
  export type GetItemHeightFn = (index: number) => number;
  export type GetItemTypeIndexFn = (index: number) => number;
  // 刷新状态回调
  export type OnRefreshStateChangeFn = (state: RefreshState, offset: number) => void;
  // 加载更多状态回调
  export type OnLoadMoreStateChangeFn = (state: LoadMoreState, offset: number) => void;
  // 分页吸附回调
  export type OnPageChangeFn = (pageIndex: number) => void;
  
  export enum ScrollDirection {
    VERTICAL = 0,
    HORIZONTAL = 1
  }
  
  export enum ItemCreationMode {
    NODE = 0,
    PREFAB = 1
  }
  
  // 添加刷新状态枚举
  export enum RefreshState {
    IDLE = 0, // 空闲状态
    PULLING = 1, // 正在拉动（未达到触发阈值）
    READY = 2, // 达到触发阈值，松手即可刷新
    REFRESHING = 3, // 正在刷新中
    COMPLETE = 4 // 刷新完成
  }
  
  export enum LoadMoreState {
    IDLE = 0, // 空闲状态
    PULLING = 1, // 正在上拉（未达到触发阈值）
    READY = 2, // 达到触发阈值，松手即可加载
    LOADING = 3, // 正在加载中
    COMPLETE = 4, // 加载完成
    NO_MORE = 5 // 没有更多数据
  }
  
  @ccclass('VirtualScrollView')
  @menu('2D/VirtualScrollView(虚拟滚动列表)')
  export class VirtualScrollView extends Component {
    @property({ type: Node, displayName: '容器节点', tooltip: 'content 容器节点（在 Viewport 下）' })
    public content: Node | null = null;
  
    @property({
        displayName: '启用虚拟列表',
        tooltip: '是否启用虚拟列表模式（关闭则仅提供滚动功能）'
    })
    public useVirtualList: boolean = true;
  
    @property({
        type: Enum(ScrollDirection),
        displayName: '滚动方向',
        tooltip: '滚动方向：纵向（向上）或横向（向左）'
    })
    public direction: ScrollDirection = ScrollDirection.VERTICAL;
  
    @property({
        type: Enum(ItemCreationMode),
        displayName: '创建模式',
        tooltip: '使用 Node 或 Prefab 创建子项（默认 Prefab）',
        visible(this: VirtualScrollView) {
            return this.useVirtualList;
        }
    })
    public itemCreationMode: ItemCreationMode = ItemCreationMode.PREFAB;
  
    @property({
        type: Node,
        displayName: '子项节点',
        tooltip: '可选：从 Node 创建 item（等大小模式）',
        visible(this: VirtualScrollView) {
            return this.useVirtualList && !this.useDynamicSize && this.itemCreationMode === ItemCreationMode.NODE;
        }
    })
    public itemNode: Node | null = null;
  
    @property({
        type: Prefab,
        displayName: '子项预制体',
        tooltip: '可选：从 Prefab 创建 item（等大小模式）',
        visible(this: VirtualScrollView) {
            return this.useVirtualList && !this.useDynamicSize && this.itemCreationMode === ItemCreationMode.PREFAB;
        }
    })
    public itemPrefab: Prefab | null = null;
  
    @property({
        displayName: '不等大小模式',
        tooltip: '启用不等大小模式',
        visible(this: VirtualScrollView) {
            return this.useVirtualList;
        }
    })
    public useDynamicSize: boolean = false;
  
    @property({
        displayName: '自动居中布局',
        tooltip: '当子项数量少于行/列数时，自动居中显示（适用于等大小模式）',
        visible(this: VirtualScrollView) {
            return this.useVirtualList && !this.useDynamicSize;
        }
    })
    public autoCenter: boolean = false;
  
    @property({
        displayName: '启用分页吸附',
        tooltip: '滚动结束后自动吸附到最近的 item 位置'
    })
    public enablePageSnap: boolean = false;
  
    @property({
        displayName: '===吸附动画时长',
        tooltip: '吸附动画的持续时间（秒）',
        range: [0.1, 1, 0.05],
        visible(this: VirtualScrollView) {
            return this.enablePageSnap;
        }
    })
    public pageSnapDuration: number = 0.15;
  
    @property({
        displayName: '===切页距离比例',
        tooltip: '滑动距离超过页面尺寸的此比例时翻页（0.1-0.5）',
        range: [0.1, 0.5, 0.05],
        visible(this: VirtualScrollView) {
            return this.enablePageSnap;
        }
    })
    public pageSnapDistanceRatio: number = 0.15;
  
    @property({
        displayName: '===吸附触发速度',
        tooltip: '惯性速度低于此值时触发吸附（越大越早吸附）',
        range: [50, 3000, 10],
        visible(this: VirtualScrollView) {
            return this.enablePageSnap;
        }
    })
    public pageSnapTriggerVelocity: number = 600;
  
    @property({
        displayName: '不等高模式（已废弃,仅保持兼容）',
        tooltip: '启用不等高模式（已废弃,仅保持兼容,请使用 useDynamicSize ）'
    })
    public useDynamicHeight: boolean = false;
  
    @property({
        displayName: '列数（已废弃,仅保持兼容）',
        tooltip: '列数（已废弃,请使用 gridCount 替代，仅保持兼容）'
    })
    public columns: number = 1;
  
    @property({
        displayName: '列间距（已废弃,仅保持兼容）',
        tooltip: '列间距（已废弃,请使用 gridSpacing 替代，仅保持兼容）'
    })
    public columnSpacing: number = 0;
  
    @property({
        type: [Node],
        displayName: '子项节点数组',
        tooltip: '不等大小模式：预先提供的子项节点数组（可在编辑器拖入）',
        visible(this: VirtualScrollView) {
            return this.useVirtualList && this.useDynamicSize && this.itemCreationMode === ItemCreationMode.NODE;
        }
    })
    public itemNodes: Node[] = [];
  
    @property({
        type: [Prefab],
        displayName: '子项预制体数组',
        tooltip: '不等大小模式：预先提供的子项预制体数组（可在编辑器拖入）',
        visible(this: VirtualScrollView) {
            return this.useVirtualList && this.useDynamicSize && this.itemCreationMode === ItemCreationMode.PREFAB;
        }
    })
    public itemPrefabs: Prefab[] = [];
  
    private itemMainSize: number = 100;
    private itemCrossSize: number = 100;
  
    @property({
        displayName: '行/列数',
        tooltip: '纵向模式为列数，横向模式为行数',
        range: [1, 10, 1],
        visible(this: VirtualScrollView) {
            return this.useVirtualList && !this.useDynamicSize;
        }
    })
    public gridCount: number = 1;
  
    @property({
        displayName: '副方向间距',
        tooltip: '主方向垂直方向的间距（像素）',
        range: [0, 1000, 1],
        visible(this: VirtualScrollView) {
            return this.useVirtualList && !this.useDynamicSize;
        }
    })
    public gridSpacing: number = 0;
  
    @property({
        displayName: '主方向间距',
        tooltip: '主方向的间距（像素）',
        range: [0, 1000, 1],
        visible(this: VirtualScrollView) {
            return this.useVirtualList;
        }
    })
    public spacing: number = 0;
  
    @property({
        displayName: '头部间距',
        tooltip: '列表头部的额外间距（纵向为顶部，横向为左侧）',
        range: [0, 1000, 1],
        visible(this: VirtualScrollView) {
            return this.useVirtualList;
        }
    })
    public headerSpacing: number = 0;
  
    @property({
        displayName: '尾部间距',
        tooltip: '列表尾部的额外间距（纵向为底部，横向为右侧）',
        range: [0, 1000, 1],
        visible(this: VirtualScrollView) {
            return this.useVirtualList;
        }
    })
    public footerSpacing: number = 0;
  
    @property({
        displayName: '总条数',
        tooltip: '总条数（可在运行时 setTotalCount 动态修改）',
        range: [0, 1000, 1],
        visible(this: VirtualScrollView) {
            return this.useVirtualList;
        }
    })
    public totalCount: number = 50;
  
    @property({
        displayName: '额外缓冲',
        tooltip: '额外缓冲（可视区外多渲染几条，避免边缘复用闪烁）',
        range: [0, 10, 1],
        visible(this: VirtualScrollView) {
            return this.useVirtualList;
        }
    })
    public buffer: number = 1;
  
    @property({
        displayName: '启用下拉刷新',
        tooltip: '是否启用下拉刷新功能'
    })
    public enablePullRefresh: boolean = false;
  
    @property({
        displayName: '===下拉触发距离',
        tooltip: '下拉多少距离触发刷新（像素）',
        range: [50, 500, 10],
        visible(this: VirtualScrollView) {
            return this.enablePullRefresh;
        }
    })
    public pullRefreshThreshold: number = 100;
  
    @property({
        displayName: '===下拉最大距离',
        tooltip: '下拉的最大阻尼距离（像素）',
        range: [100, 1000, 10],
        visible(this: VirtualScrollView) {
            return this.enablePullRefresh;
        }
    })
    public pullRefreshMaxOffset: number = 150;
  
    @property({
        displayName: '启用上拉加载',
        tooltip: '是否启用上拉加载更多功能'
    })
    public enableLoadMore: boolean = false;
  
    @property({
        displayName: '===上拉触发距离',
        tooltip: '距离底部多少距离触发加载（像素）',
        range: [50, 500, 10],
        visible(this: VirtualScrollView) {
            return this.enableLoadMore;
        }
    })
    public loadMoreThreshold: number = 100;
  
    @property({
        displayName: '===上拉最大距离',
        tooltip: '上拉的最大阻尼距离（像素）',
        range: [100, 1000, 10],
        visible(this: VirtualScrollView) {
            return this.enableLoadMore;
        }
    })
    public loadMoreMaxOffset: number = 150;
  
    @property({
        displayName: '拉动阻尼系数',
        tooltip: '拉动时的阻尼系数（0-1），越小越难拉',
        range: [0.1, 1, 0.05],
        visible(this: VirtualScrollView) {
            return this.enablePullRefresh || this.enableLoadMore;
        }
    })
    public pullDampingRate: number = 0.5;
  
    @property({ displayName: '像素对齐', tooltip: '是否启用像素对齐' })
    public pixelAlign: boolean = true;
  
    @property({
        displayName: '禁用越界滚动',
        tooltip: '是否禁用越界滚动（开启后将无法滚动到边界之外）'
    })
    public disableBounce: boolean = false;
  
    @property({
        displayName: '惯性阻尼系数',
        tooltip: '指数衰减系数，越大减速越快',
        range: [0, 10, 0.5]
    })
    public inertiaDampK: number = 1;
  
    @property({ displayName: '弹簧刚度', tooltip: '越界弹簧刚度 K（建议 120–240）' })
    public springK: number = 150.0;
  
    @property({ displayName: '弹簧阻尼', tooltip: '越界阻尼 C（建议 22–32）' })
    public springC: number = 26.0;
  
    @property({ displayName: '速度阈值', tooltip: '速度阈值（像素/秒），低于即停止' })
    public velocitySnap: number = 5;
  
    @property({ displayName: '速度窗口', tooltip: '速度估计窗口（秒）' })
    public velocityWindow: number = 0.08;
  
    @property({ displayName: '最大惯性速度', tooltip: '最大惯性速度（像素/秒）' })
    public maxVelocity: number = 6000;
  
    @property({ displayName: 'iOS减速曲线', tooltip: '是否使用 iOS 风格的减速曲线' })
    public useIOSDecelerationCurve: boolean = true;
  
    public renderItemFn: RenderItemFn | null = null;
    public provideNodeFn: ProvideNodeFn | null = null;
    public onItemClickFn: OnItemClickFn | null = null;
    public onItemLongPressFn: OnItemLongPressFn | null = null;
    public playItemAppearAnimationFn: PlayItemAppearAnimationFn | null = null;
    public getItemHeightFn: GetItemHeightFn | null = null;
    public getItemTypeIndexFn: GetItemTypeIndexFn | null = null;
    public onRefreshStateChangeFn: OnRefreshStateChangeFn | null = null;
    public onLoadMoreStateChangeFn: OnLoadMoreStateChangeFn | null = null;
    public onPageChangeFn: OnPageChangeFn | null = null;
  
    private _viewportSize = 0;
    private _contentSize = 0;
    private _boundsMin = 0;
    private _boundsMax = 0;
    private _velocity = 0;
    private _isTouching = false;
    private _velSamples: { t: number; delta: number }[] = [];
    private _slotNodes: Node[] = [];
    private _slots = 0;
    private _slotFirstIndex = 0;
    private _itemSizes: number[] = [];
    private _prefixPositions: number[] = [];
    private _prefabSizeCache: Map<number, number> = new Map();
    private _nodePool: InternalNodePool | null = null;
    private _slotPrefabIndices: number[] = [];
    private _needAnimateIndices: Set<number> = new Set();
    private _initSortLayerFlag: boolean = true;
    private _scrollTween: any = null;
    private _tmpMoveVec2 = new Vec2();
  
    // 私有状态变量
    private _refreshState: RefreshState = RefreshState.IDLE;
    private _loadMoreState: LoadMoreState = LoadMoreState.IDLE;
    private _pullOffset: number = 0; // 当前下拉偏移量
    private _loadOffset: number = 0; // 当前上拉偏移量
    private _isRefreshing: boolean = false;
    private _isLoadingMore: boolean = false;
    private _hasMore: boolean = true; // 是否还有更多数据
  
    // 分页吸附相关
    private _currentPageIndex: number = 0;
    private _pageStartPos: number = 0; // 记录触摸开始时的位置
  
    private _touchStartPos: Vec2 = new Vec2();
    private _hasDeterminedScrollDirection: boolean = false;
    private _shouldBlockParent: boolean = false;
    private _scrollDirectionThreshold: number = 15; // 滑动阈值（像素）
    private _scrollAngleThreshold: number = 30; // 角度阈值（度）
  
    // 等大小模式下，从 content 子节点获取的模板节点
    private _templateNode: Node | null = null;

    // 跳跃动画相关
    private _isPlayingJumpAnimation: boolean = false;
  
    private get _contentTf(): UITransform {
        this.content = this._getContentNode();
        return this.content!.getComponent(UITransform)!;
    }
  
    private get _viewportTf(): UITransform {
        return this.node.getComponent(UITransform)!;
    }
  
    private _getContentNode(): Node {
        if (!this.content) {
            console.warn(`[VirtualScrollView] :${this.node.name} 请在属性面板绑定 content 容器节点`);
            this.content = this.node.getChildByName('content');
        }
        return this.content;
    }
  
    private _isVertical(): boolean {
        return this.direction === ScrollDirection.VERTICAL;
    }
  
    private _getViewportMainSize(): number {
        return this._isVertical() ? this._viewportTf.height : this._viewportTf.width;
    }
  
    private _getContentMainPos(): number {
        return this._isVertical() ? this.content!.position.y : this.content!.position.x;
    }
  
    private _setContentMainPos(pos: number) {
        if (!Number.isFinite(pos)) return;
        if (this.pixelAlign) pos = Math.round(pos);
        const p = this.content!.position;
        if (this._isVertical()) {
            if (pos === p.y) return;
            this.content!.setPosition(p.x, pos, p.z);
        } else {
            if (pos === p.x) return;
            this.content!.setPosition(pos, p.y, p.z);
        }
    }
  
    async start() {
        this.content = this._getContentNode();
        if (!this.content) return;
        const mask = this.node.getComponent(Mask);
        if (!mask) console.warn('[VirtualScrollView] 建议在视窗节点挂一个 Mask 组件用于裁剪');
        this.gridCount = Math.max(1, Math.round(this.gridCount));
        if (!this.useVirtualList) {
            this._viewportSize = this._getViewportMainSize();
            this._contentSize = this._isVertical() ? this._contentTf.height : this._contentTf.width;
            if (this._isVertical()) {
                this._boundsMin = 0;
                this._boundsMax = Math.max(0, this._contentSize - this._viewportSize);
            } else {
                this._boundsMin = -Math.max(0, this._contentSize - this._viewportSize);
                this._boundsMax = 0;
            }
            this._bindTouch();
            this._bindGlobalTouch();
            return;
        }
  
        // 等大小模式：如果没有预制体但 content 下有子节点，保存第一个子节点作为模板
        if (!this.useDynamicSize && !this.itemPrefab && this.content.children.length > 0) {
            this._templateNode = this.content.children[0];
            this._templateNode.removeFromParent(); // 只移除，不销毁
        }
  
        this.content.removeAllChildren();
        this._viewportSize = this._getViewportMainSize();
        //兼容废弃属性
        if (this.useDynamicHeight) {
            this.useDynamicSize = true;
        }
  
        //兼容之前版本的参数
        if (this.columns && this.direction === ScrollDirection.VERTICAL) {
            this.gridCount = this.columns;
        }
        if (this.columnSpacing && this.direction === ScrollDirection.VERTICAL) {
            this.gridSpacing = this.columnSpacing;
        }
  
        if (this.useDynamicSize) await this._initDynamicSizeMode();
        else await this._initFixedSizeMode();
        this._bindTouch();
        this._bindGlobalTouch();
    }
  
    onDestroy() {
        input.off(Input.EventType.TOUCH_END, this._onGlobalTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this._onGlobalTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_START, this._onDown, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this._onMove, this);
        this.node.off(Node.EventType.TOUCH_END, this._onUp, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this._onUp, this);
        
        // 停止所有动画
        if (this._scrollTween) {
            this._scrollTween.stop();
            this._scrollTween = null;
        }
        
        // 停止所有节点的动画
        if (this.content && this.content.children && this.content.children.length > 0) {
            // 使用数组副本，避免在遍历时修改原数组
            const children = [...this.content.children];
            children.forEach(child => {
                if (child && child.isValid) {
                    Tween.stopAllByTarget(child);
                }
            });
        }
        
        // 清理对象池（会销毁池中的实例节点）
        if (this._nodePool) {
            this._nodePool.clear();
            this._nodePool = null;
        }

        // 注意：itemNode、itemNodes、itemPrefab、itemPrefabs 都是模板，不应该手动销毁
        // 它们通过 instantiate() 创建实例，销毁模板会导致无法再使用
        // 作为组件属性，引擎会自动处理资源释放
        this._templateNode = null;
    }
  
    private _bindTouch() {
        this.node.on(Node.EventType.TOUCH_START, this._onDown, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this._onMove, this);
        this.node.on(Node.EventType.TOUCH_END, this._onUp, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this._onUp, this);
    }
  
    private _bindGlobalTouch() {
        input.on(Input.EventType.TOUCH_END, this._onGlobalTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this._onGlobalTouchEnd, this);
    }
  
    private _onGlobalTouchEnd(event: EventTouch) {
        if (this._isTouching) {
            console.log('[VScrollView] Global touch end detected');
            this._onUp(event);
        }
    }
  
    private async _initFixedSizeMode() {
        if (!this.provideNodeFn) {
            this.provideNodeFn = (index: number) => {
                // Node 模式
                if (this.itemCreationMode === ItemCreationMode.NODE) {
                    if (this.itemNode) return instantiate(this.itemNode);
                    if (this._templateNode) return instantiate(this._templateNode);
                }
                // Prefab 模式
                if (this.itemCreationMode === ItemCreationMode.PREFAB) {
                    if (this.itemPrefab) return instantiate(this.itemPrefab);
                }
                // 兼容旧版本：如果没有设置模式，尝试 itemPrefab 或模板节点
                if (this.itemPrefab) return instantiate(this.itemPrefab);
                if (this._templateNode) return instantiate(this._templateNode);
                // 都没有则警告并创建默认节点
                console.warn('[VirtualScrollView] 没有提供 itemNode/itemPrefab 或模板节点');
                const n = new Node('item-auto-create');
                const size = this._isVertical() ? this._viewportTf.width : this._viewportTf.height;
                n.addComponent(UITransform).setContentSize(
                    this._isVertical() ? size : this.itemMainSize,
                    this._isVertical() ? this.itemMainSize : size
                );
                return n;
            };
        }
        let item_pre = this.provideNodeFn(0);
        if (item_pre instanceof Promise) item_pre = await item_pre;
        const uit = item_pre.getComponent(UITransform);
        if (this._isVertical()) {
            this.itemMainSize = uit.height;
            this.itemCrossSize = uit.width;
        } else {
            this.itemMainSize = uit.width;
            this.itemCrossSize = uit.height;
        }
        this._recomputeContentSize();
        const stride = this.itemMainSize + this.spacing;
        const visibleLines = Math.ceil(this._viewportSize / stride);
        this._slots = Math.max(1, (visibleLines + this.buffer + 2) * this.gridCount);
        for (let i = 0; i < this._slots; i++) {
            const n = instantiate(item_pre);
            n.parent = this.content!;
            const itf = n.getComponent(UITransform);
            if (itf) {
                if (this._isVertical()) {
                    itf.width = this.itemCrossSize;
                    itf.height = this.itemMainSize;
                } else {
                    itf.width = this.itemMainSize;
                    itf.height = this.itemCrossSize;
                }
            }
            this._slotNodes.push(n);
        }
        this._slotFirstIndex = 0;
        this._layoutSlots(this._slotFirstIndex, true);
    }
  
    private async _initDynamicSizeMode() {
        if (this.getItemHeightFn) {
            console.log('[VirtualScrollView] 使用外部提供的 getItemHeightFn');
            this._itemSizes = [];
            for (let i = 0; i < this.totalCount; i++) {
                this._itemSizes.push(this.getItemHeightFn(i));
            }
            this._buildPrefixSum();
            // Node 模式
            if (this.itemCreationMode === ItemCreationMode.NODE && this.itemNodes.length > 0) {
                console.log('[VirtualScrollView] 初始化节点池（Node 模式）');
                this._nodePool = new InternalNodePool([], this.itemNodes);
            }
            // Prefab 模式
            else if (this.itemCreationMode === ItemCreationMode.PREFAB && this.itemPrefabs.length > 0) {
                console.log('[VirtualScrollView] 初始化节点池（Prefab 模式）');
                this._nodePool = new InternalNodePool(this.itemPrefabs);
            }
            // 兼容旧版本
            else if (this.itemPrefabs.length > 0) {
                console.log('[VirtualScrollView] 初始化节点池（兼容模式）');
                this._nodePool = new InternalNodePool(this.itemPrefabs);
            } else {
                console.error('[VirtualScrollView] 需要至少一个 itemNode 或 itemPrefab');
                return;
            }
            this._initDynamicSlots();
            return;
        }
        // Node 模式
        const useNodeMode = this.itemCreationMode === ItemCreationMode.NODE;
        const hasNodes = this.itemNodes.length > 0;
        const hasPrefabs = this.itemPrefabs.length > 0;
  
        if ((useNodeMode && !hasNodes && !hasPrefabs) || (!useNodeMode && !hasPrefabs) || !this.getItemTypeIndexFn) {
            console.error(
                '[VirtualScrollView] 不等大小模式必须提供以下之一：\n1. getItemHeightFn 回调函数\n2. itemNodes/itemPrefabs 数组 + getItemTypeIndexFn 回调函数'
            );
            return;
        }
  
        // 根据模式选择模板源
        const templates = useNodeMode && hasNodes ? this.itemNodes : this.itemPrefabs;
        const modeName = useNodeMode && hasNodes ? 'Node' : 'Prefab';
  
        console.log(`[VirtualScrollView] 使用采样模式（从 ${modeName} 采样尺寸）`);
  
        // 初始化节点池
        if (useNodeMode && hasNodes) {
            this._nodePool = new InternalNodePool([], this.itemNodes);
        } else {
            this._nodePool = new InternalNodePool(this.itemPrefabs);
        }
  
        this._prefabSizeCache.clear();
        for (let i = 0; i < templates.length; i++) {
            const template = templates[i];
            const sampleNode = instantiate(template as any);
            const uit = sampleNode.getComponent(UITransform);
            const size = this._isVertical() ? uit?.height || 100 : uit?.width || 100;
            this._prefabSizeCache.set(i, size);
            sampleNode.destroy();
            console.log(`[VirtualScrollView] ${modeName}[${i}] 采样尺寸: ${size}`);
        }
        this._itemSizes = [];
        for (let i = 0; i < this.totalCount; i++) {
            const typeIndex = this.getItemTypeIndexFn(i);
            const size = this._prefabSizeCache.get(typeIndex);
            if (size !== undefined) {
                this._itemSizes.push(size);
            } else {
                console.warn(`[VirtualScrollView] 索引 ${i} 的类型索引 ${typeIndex} 无效，使用默认尺寸`);
                this._itemSizes.push(this._prefabSizeCache.get(0) || 100);
            }
        }
        this._buildPrefixSum();
        this._initDynamicSlots();
    }
  
    private _initDynamicSlots() {
        const avgSize = this._contentSize / this.totalCount || 100;
        const visibleCount = Math.ceil(this._viewportSize / avgSize);
        let neededSlots = visibleCount + this.buffer * 2 + 4;
        const minSlots = Math.ceil(this._viewportSize / 80) + this.buffer * 2;
        neededSlots = Math.max(neededSlots, minSlots);
        const maxSlots = Math.ceil(this._viewportSize / 50) + this.buffer * 4;
        neededSlots = Math.min(neededSlots, maxSlots);
        this._slots = Math.min(neededSlots, Math.max(this.totalCount, minSlots));
        this._slotNodes = new Array(this._slots).fill(null);
        this._slotPrefabIndices = new Array(this._slots).fill(-1);
        this._slotFirstIndex = 0;
        this._layoutSlots(this._slotFirstIndex, true);
        console.log(
            `[VScrollView] 初始化槽位: ${this._slots} (总数据: ${this.totalCount}, 视口尺寸: ${this._viewportSize})`
        );
    }
  
    private _buildPrefixSum() {
        const n = this._itemSizes.length;
        this._prefixPositions = new Array(n);
        // 从 headerSpacing 开始
        let acc = this.headerSpacing;
        for (let i = 0; i < n; i++) {
            this._prefixPositions[i] = acc;
            acc += this._itemSizes[i] + this.spacing;
        }
        // 内容总大小 = 最后一个位置 + 最后一项大小 - spacing + footerSpacing
        this._contentSize = acc - this.spacing + this.footerSpacing;
        if (this._contentSize < 0) this._contentSize = 0;
        if (this._isVertical()) this._contentTf.height = Math.max(this._contentSize, this._viewportSize);
        else this._contentTf.width = Math.max(this._contentSize, this._viewportSize);
  
        if (this._isVertical()) {
            this._boundsMin = 0;
            this._boundsMax = Math.max(0, this._contentSize - this._viewportSize);
        } else {
            this._boundsMin = -Math.max(0, this._contentSize - this._viewportSize);
            this._boundsMax = 0;
        }
    }
  
    private _posToFirstIndex(pos: number): number {
        // _prefixPositions 已经包含了 headerSpacing，直接查找即可
        if (pos <= this.headerSpacing) return 0; // 修改：如果在 header 区域内，返回 0
  
        let l = 0,
            r = this._prefixPositions.length - 1,
            ans = this._prefixPositions.length;
        while (l <= r) {
            const m = (l + r) >> 1;
            if (this._prefixPositions[m] > pos) {
                ans = m;
                r = m - 1;
            } else {
                l = m + 1;
            }
        }
        return Math.max(0, ans - 1);
    }
  
    private _calcVisibleRange(scrollPos: number): { start: number; end: number } {
        const n = this._prefixPositions.length;
        if (n === 0) return { start: 0, end: 0 };
  
        const start = this._posToFirstIndex(scrollPos);
        const endPos = scrollPos + this._viewportSize;
        let end = start;
  
        // 找到第一个起始位置超出可视区域的 item
        while (end < n) {
            if (this._prefixPositions[end] >= endPos) break; // 恢复原来的逻辑
            end++;
        }
  
        return { start: Math.max(0, start - this.buffer), end: Math.min(n, end + this.buffer) };
    }
  
    update(dt: number) {
        if (!this.content || this._isTouching || this._scrollTween) return;
        let pos = this._getContentMainPos();
        let a = 0;
  
        const minBound = Math.min(this._boundsMin, this._boundsMax);
        const maxBound = Math.max(this._boundsMin, this._boundsMax);
  
        // 处理刷新/加载状态
        if (this._isRefreshing && this._refreshState === RefreshState.REFRESHING) {
            // 刷新中，保持在刷新位置
            const refreshPos = this._isVertical() ? -this.pullRefreshThreshold : this.pullRefreshThreshold;
            a = -this.springK * (pos - refreshPos) - this.springC * this._velocity;
        } else if (this._isLoadingMore && this._loadMoreState === LoadMoreState.LOADING) {
            // 加载中，保持在加载位置
            const loadPos = this._isVertical()
                ? this._boundsMax + this.loadMoreThreshold
                : this._boundsMin - this.loadMoreThreshold;
            a = -this.springK * (pos - loadPos) - this.springC * this._velocity;
        } else if (pos < minBound) {
            // 如果禁用越界滚动，直接限制位置并停止速度
            if (this.disableBounce) {
                this._setContentMainPos(minBound);
                this._velocity = 0;
                return;
            }
            a = -this.springK * (pos - minBound) - this.springC * this._velocity;
        } else if (pos > maxBound) {
            // 如果禁用越界滚动，直接限制位置并停止速度
            if (this.disableBounce) {
                this._setContentMainPos(maxBound);
                this._velocity = 0;
                return;
            }
            a = -this.springK * (pos - maxBound) - this.springC * this._velocity;
        } else {
            if (this.useIOSDecelerationCurve) {
                const speed = Math.abs(this._velocity);
                if (speed > 2000) this._velocity *= Math.exp(-this.inertiaDampK * 0.7 * dt);
                else if (speed > 500) this._velocity *= Math.exp(-this.inertiaDampK * dt);
                else this._velocity *= Math.exp(-this.inertiaDampK * 1.3 * dt);
            } else {
                this._velocity *= Math.exp(-this.inertiaDampK * dt);
            }
        }
  
        this._velocity += a * dt;
  
        // 分页吸附模式：使用单独的速度阈值
        if (this.enablePageSnap && Math.abs(this._velocity) < this.pageSnapTriggerVelocity && a === 0) {
            this._velocity = 0;
            this._performPageSnap();
            return;
        }
  
        if (Math.abs(this._velocity) < this.velocitySnap && a === 0) this._velocity = 0;
        if (this._velocity !== 0) {
            pos += this._velocity * dt;
  
            // 如果禁用越界滚动，限制位置在边界内
            if (this.disableBounce) {
                pos = math.clamp(pos, minBound, maxBound);
            }
  
            if (this.pixelAlign) pos = Math.round(pos);
            this._setContentMainPos(pos);
            if (this.useVirtualList) this._updateVisible(false);
        }
    }
  
    public updateItemHeight(index: number, newSize?: number) {
        if (!this.useDynamicSize) {
            console.warn('[VScrollView] 只有不等大小模式支持 updateItemHeight');
            return;
        }
        if (index < 0 || index >= this.totalCount) {
            console.warn(`[VScrollView] 索引 ${index} 超出范围`);
            return;
        }
        let size = newSize;
        if (size === undefined) {
            if (this.getItemHeightFn) {
                size = this.getItemHeightFn(index);
            } else {
                console.error('[VScrollView] 没有提供 newSize 参数，且未设置 getItemHeightFn');
                return;
            }
        }
        if (this._itemSizes[index] === size) return;
        this._itemSizes[index] = size;
        this._rebuildPrefixSumFrom(index);
        this._updateVisible(true);
    }
  
    private _rebuildPrefixSumFrom(startIndex: number) {
        if (startIndex === 0) {
            this._buildPrefixSum();
            return;
        }
        let acc = this._prefixPositions[startIndex - 1] + this._itemSizes[startIndex - 1] + this.spacing;
        for (let i = startIndex; i < this._itemSizes.length; i++) {
            this._prefixPositions[i] = acc;
            acc += this._itemSizes[i] + this.spacing;
        }
        this._contentSize = acc - this.spacing + this.footerSpacing;
        if (this._contentSize < 0) this._contentSize = 0;
        if (this._isVertical()) this._contentTf.height = Math.max(this._contentSize, this._viewportSize);
        else this._contentTf.width = Math.max(this._contentSize, this._viewportSize);
  
        if (this._isVertical()) {
            this._boundsMin = 0;
            this._boundsMax = Math.max(0, this._contentSize - this._viewportSize);
        } else {
            this._boundsMin = -Math.max(0, this._contentSize - this._viewportSize);
            this._boundsMax = 0;
        }
    }
  
    public updateItemHeights(updates: Array<{ index: number; height: number }>) {
        if (!this.useDynamicSize) {
            console.warn('[VScrollView] 只有不等大小模式支持 updateItemHeights');
            return;
        }
        if (updates.length === 0) return;
        let minIndex = this.totalCount;
        let hasChange = false;
        for (const { index, height } of updates) {
            if (index < 0 || index >= this.totalCount) continue;
            if (this._itemSizes[index] !== height) {
                this._itemSizes[index] = height;
                minIndex = Math.min(minIndex, index);
                hasChange = true;
            }
        }
        if (!hasChange) return;
        this._rebuildPrefixSumFrom(minIndex);
        this._updateVisible(true);
    }
  
    public refreshList(data: any[] | number) {
        console.log('更新的数据', data);
        if (!this.useVirtualList) {
            console.warn('[VirtualScrollView] 简单滚动模式不支持 refreshList');
            return;
        }
        if (typeof data === 'number') this.setTotalCount(data);
        else this.setTotalCount(data.length);
    }
  
    public setTotalCount(count: number) {
        this._getContentNode();
        if (!this.useVirtualList) {
            console.warn('[VScrollView] 非虚拟列表模式，不支持 setTotalCount');
            return;
        }
        this._upWidgetAlignment();
        const oldCount = this.totalCount;
        this.totalCount = Math.max(0, count | 0);
        if (this.totalCount > oldCount) {
            for (let i = oldCount; i < this.totalCount; i++) {
                this._needAnimateIndices.add(i);
            }
        }
        if (this.useDynamicSize) {
            const oldLength = this._itemSizes.length;
            if (this.totalCount > oldLength) {
                for (let i = oldLength; i < this.totalCount; i++) {
                    let size = 100;
                    if (this.getItemHeightFn) {
                        size = this.getItemHeightFn(i);
                    } else if (this.getItemTypeIndexFn && this._prefabSizeCache.size > 0) {
                        const typeIndex = this.getItemTypeIndexFn(i);
                        size = this._prefabSizeCache.get(typeIndex) || 100;
                    }
                    this._itemSizes.push(size);
                }
            } else if (this.totalCount < oldLength) {
                this._itemSizes.length = this.totalCount;
            }
            this._buildPrefixSum();
            if (this.totalCount > oldCount) this._expandSlotsIfNeeded();
        } else {
            this._recomputeContentSize();
        }
        this._slotFirstIndex = math.clamp(this._slotFirstIndex, 0, Math.max(0, this.totalCount - 1));
        if (!this.useDynamicSize) {
            this._layoutSlots(this._slotFirstIndex, true);
        }
        this._updateVisible(true);
    }
  
    _upWidgetAlignment() {
        this.content?.getComponent?.(Widget)?.updateAlignment?.();
        this.node?.getComponent?.(Widget)?.updateAlignment?.();
    }
  
    private _expandSlotsIfNeeded() {
        let neededSlots = 0;
        let pos = 0;
        const endPos = this._viewportSize;
        for (let i = 0; i < this.totalCount; i++) {
            if (pos >= endPos) break;
            neededSlots++;
            pos += this._itemSizes[i] + this.spacing;
        }
        neededSlots += this.buffer * 2 + 4;
        const minSlots = Math.ceil(this._viewportSize / 80) + this.buffer * 2;
        neededSlots = Math.max(neededSlots, minSlots);
        const maxSlots = Math.ceil(this._viewportSize / 50) + this.buffer * 4;
        neededSlots = Math.min(neededSlots, maxSlots);
        if (neededSlots > this._slots) {
            const oldSlots = this._slots;
            this._slots = neededSlots;
            for (let i = oldSlots; i < this._slots; i++) {
                this._slotNodes.push(null);
                this._slotPrefabIndices.push(-1);
            }
            console.log(`[VScrollView] 槽位扩展: ${oldSlots} -> ${this._slots} (总数据: ${this.totalCount})`);
        }
    }
  
    private _scrollToPosition(targetPos: number, animate = false, duration?: number) {
        targetPos = math.clamp(targetPos, this._boundsMin, this._boundsMax);
        if (this._scrollTween) {
            this._scrollTween.stop();
            this._scrollTween = null;
        }
        this._velocity = 0;
        // 注意：不在这里设置 _isTouching = false，因为如果用户正在触摸，这会干扰触摸状态
        // _onDown 会正确处理触摸状态
        this._velSamples.length = 0;
        if (!animate) {
            this._setContentMainPos(this.pixelAlign ? Math.round(targetPos) : targetPos);
            this._updateVisible(true);
        } else {
            const currentPos = this._getContentMainPos();
            const distance = Math.abs(targetPos - currentPos);
            // 如果提供了 duration 则使用，否则根据距离自动计算
            const finalDuration = duration !== undefined ? duration : Math.max(0.2, distance / 3000);
            const targetVec = this._isVertical() ? new Vec3(0, targetPos, 0) : new Vec3(targetPos, 0, 0);
            this._scrollTween = tween(this.content!)
                .to(
                    finalDuration,
                    { position: targetVec },
                    {
                        easing: 'smooth',
                        onUpdate: () => {
                            this._updateVisible(false);
                        }
                    }
                )
                .call(() => {
                    this._updateVisible(true);
                    this._scrollTween = null;
                    this._velocity = 0;
                    // 确保动画结束后，触摸状态正确恢复（如果用户没有在触摸，则保持 false）
                    // 注意：如果用户在动画过程中触摸，_onDown 会设置 _isTouching = true
                    // 这里不需要强制设置，因为 _onDown 会处理
                })
                .start();
        }
    }
  
    public scrollToTop(animate = false, duration?: number) {
        const target = this._isVertical() ? this._boundsMin : this._boundsMax;
        this._scrollToPosition(target, animate, duration);
    }
  
    public scrollToBottom(animate = false, duration?: number) {
        const target = this._isVertical() ? this._boundsMax : this._boundsMin;
        this._scrollToPosition(target, animate, duration);
    }
  
    public scrollToIndex(index: number, animate = false, duration?: number) {
        index = math.clamp(index | 0, 0, Math.max(0, this.totalCount - 1));
        let targetPos = 0;
  
        if (this.useDynamicSize) {
            // 不等大小模式：_prefixPositions 已经包含了 headerSpacing
            targetPos = this._prefixPositions[index] || 0;
        } else {
            // 等大小模式：需要手动加上 headerSpacing
            const line = Math.floor(index / this.gridCount);
            targetPos = this.headerSpacing + line * (this.itemMainSize + this.spacing);
        }
  
        // 横向模式：滚动方向相反，取负值
        if (!this._isVertical()) {
            targetPos = -targetPos;
        }
  
        this._scrollToPosition(targetPos, animate, duration);
    }
  
    /**
     * 滚动到指定索引，使该索引显示在列表底部（纵向）或右侧（横向）
     * @param index 目标索引
     * @param animate 是否使用动画
     * @param duration 动画时长（秒），不传则根据距离自动计算
     */
    public scrollToIndexBottom(index: number, animate = false, duration?: number) {
        index = math.clamp(index | 0, 0, Math.max(0, this.totalCount - 1));
        let targetPos = 0;
  
        if (this.useDynamicSize) {
            // 不等大小模式：计算 item 的结束位置（起始位置 + item 高度）
            const itemStart = this._prefixPositions[index] || 0;
            const itemSize = this._itemSizes[index] || 0;
            const itemEnd = itemStart + itemSize;
            // 目标位置 = item 结束位置 - 视口高度，使 item 底部对齐视口底部
            targetPos = itemEnd - this._viewportSize;
        } else {
            // 等大小模式：计算 item 所在行的结束位置
            const line = Math.floor(index / this.gridCount);
            const itemStart = this.headerSpacing + line * (this.itemMainSize + this.spacing);
            const itemEnd = itemStart + this.itemMainSize;
            // 目标位置 = item 结束位置 - 视口高度
            targetPos = itemEnd - this._viewportSize;
        }
  
        // 横向模式：滚动方向相反，取负值
        if (!this._isVertical()) {
            targetPos = -targetPos;
        }
  
        this._scrollToPosition(targetPos, animate, duration);
    }
  
    public onOffSortLayer(onoff: boolean) {
        this._initSortLayerFlag = onoff;
        this._onOffSortLayerOperation();
    }
  
    private _onOffSortLayerOperation() {
        for (const element of this._slotNodes) {
            const sitem = element?.getComponent(VScrollViewItem);
            if (sitem) {
                if (this._initSortLayerFlag) sitem.onSortLayer();
                else sitem.offSortLayer();
            }
        }
    }
  
    private _flashToPosition(targetPos: number) {
        targetPos = math.clamp(targetPos, this._boundsMin, this._boundsMax);
        if (this._scrollTween) {
            this._scrollTween.stop();
            this._scrollTween = null;
        }
        this._velocity = 0;
        this._isTouching = false;
        this._velSamples.length = 0;
        this._setContentMainPos(this.pixelAlign ? Math.round(targetPos) : targetPos);
        this._updateVisible(true);
    }
  
    public flashToTop() {
        const target = this._isVertical() ? this._boundsMin : this._boundsMax;
        this._flashToPosition(target);
    }
  
    public flashToBottom() {
        const target = this._isVertical() ? this._boundsMax : this._boundsMin;
        this._flashToPosition(target);
    }
  
    public flashToIndex(index: number) {
        if (!this.useVirtualList) {
            console.warn('[VirtualScrollView] 简单滚动模式不支持 flashToIndex');
            return;
        }
        index = math.clamp(index | 0, 0, Math.max(0, this.totalCount - 1));
        let targetPos = 0;
  
        if (this.useDynamicSize) {
            // 不等大小模式：_prefixPositions 已经包含了 headerSpacing
            targetPos = this._prefixPositions[index] || 0;
        } else {
            // 等大小模式：需要手动加上 headerSpacing
            const line = Math.floor(index / this.gridCount);
            targetPos = this.headerSpacing + line * (this.itemMainSize + this.spacing);
        }
  
        if (!this._isVertical()) {
            targetPos = -targetPos;
        }
  
        this._flashToPosition(targetPos);
    }
  
    public refreshIndex(index: number) {
        if (!this.useVirtualList) {
            console.warn('[VirtualScrollView] 简单滚动模式不支持 refreshIndex');
            return;
        }
        const first = this._slotFirstIndex;
        const last = first + this._slots - 1;
        if (index < first || index > last) return;
        const slot = index - first;
        const node = this._slotNodes[slot];
        if (node && this.renderItemFn) this.renderItemFn(node, index);
    }
  
    private _stopTouchEvent(e?: EventTouch) {
        if (!e) return;
  
        // 如果已经确定要阻止父级，直接阻止
        if (this._shouldBlockParent) {
            e.propagationStopped = true;
        }
    }
  
    private _onDown(e: EventTouch) {
        // 如果正在播放跳跃动画，禁用触摸
        if (this._isPlayingJumpAnimation) {
            return;
        }

        // 记录触摸起始位置
        const uiPos = e.getUILocation(this._touchStartPos);
        this._touchStartPos.set(uiPos);
        this._hasDeterminedScrollDirection = false;
        this._shouldBlockParent = false;

        // 分页模式：记录触摸开始时的内容位置
        if (this.enablePageSnap) {
            this._pageStartPos = this._getContentMainPos();
        }

        this._stopTouchEvent(e);
        this._isTouching = true;
        this._velocity = 0;
        this._velSamples.length = 0;
        if (this._scrollTween) {
            this._scrollTween.stop();
            this._scrollTween = null;
        }
    }
  
    private _onMove(e: EventTouch) {
        // 如果正在播放跳跃动画，禁用触摸
        if (this._isPlayingJumpAnimation) {
            return;
        }
        if (!this._isTouching) return;
  
        const uiDelta = e.getUIDelta(this._tmpMoveVec2);
        const currentPos = e.getUILocation();
  
        // 第一次移动时判断滑动方向
        if (!this._hasDeterminedScrollDirection) {
            const deltaX = currentPos.x - this._touchStartPos.x;
            const deltaY = currentPos.y - this._touchStartPos.y;
            const totalDelta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
            // 超过距离阈值才判断方向
            if (totalDelta > this._scrollDirectionThreshold) {
                this._hasDeterminedScrollDirection = true;
  
                // 计算滑动角度（相对于水平方向）
                const angle = Math.abs((Math.atan2(deltaY, deltaX) * 180) / Math.PI);
  
                // 判断是否为纵向滑动：角度在 [90° - 阈值, 90° + 阈值] 范围内
                const isVerticalScroll =
                    angle > 90 - this._scrollAngleThreshold && angle < 90 + this._scrollAngleThreshold;
  
                // 判断是否为横向滑动：角度在 [0°, 阈值] 或 [180° - 阈值, 180°] 范围内
                const isHorizontalScroll =
                    angle < this._scrollAngleThreshold || angle > 180 - this._scrollAngleThreshold;
  
                const isListVertical = this._isVertical();
  
                // 方向一致时才考虑拦截
                if ((isListVertical && isVerticalScroll) || (!isListVertical && isHorizontalScroll)) {
                    // 检查是否在边界
                    const pos = this._getContentMainPos();
                    const minBound = Math.min(this._boundsMin, this._boundsMax);
                    const maxBound = Math.max(this._boundsMin, this._boundsMax);
                    const delta = this._isVertical() ? uiDelta.y : uiDelta.x;
  
                    // 判断滑动方向
                    const scrollingToStart = this._isVertical() ? delta > 0 : delta < 0;
                    const scrollingToEnd = this._isVertical() ? delta < 0 : delta > 0;
  
                    // 只有在非边界位置，或者在边界但向内滑动时才拦截
                    const atStartBound = this._isVertical() ? pos <= minBound : pos >= maxBound;
                    const atEndBound = this._isVertical() ? pos >= maxBound : pos <= minBound;
  
                    if (
                        (!atStartBound && !atEndBound) ||
                        (atStartBound && scrollingToEnd) ||
                        (atEndBound && scrollingToStart)
                    ) {
                        this._shouldBlockParent = true;
                    }
                }
            }
        }
  
        this._stopTouchEvent(e);
        // const uiDelta = e.getUIDelta(this._tmpMoveVec2);
        const delta = this._isVertical() ? uiDelta.y : uiDelta.x;
        let pos = this._getContentMainPos();
        const minBound = Math.min(this._boundsMin, this._boundsMax);
        const maxBound = Math.max(this._boundsMin, this._boundsMax);
  
        // 计算是否需要下拉刷新或上拉加载
        let finalDelta = delta;
        let isPullingRefresh = false;
        let isPullingLoadMore = false;
  
        // console.log(`delta: ${delta}, pos: ${pos}, minBound: ${minBound}, maxBound: ${maxBound}`);
  
        if (this.enablePullRefresh && !this._isRefreshing) {
            // 纵向：顶部下拉（pos < minBound 且向下拉）
            // 横向：左侧右拉（pos > maxBound 且向右拉）
            const atTopBound = this._isVertical() ? pos <= minBound : pos >= maxBound;
            const pullingDown = this._isVertical() ? delta < 0 : delta > 0;
  
            if (atTopBound && pullingDown) {
                isPullingRefresh = true;
                const overOffset = this._isVertical() ? minBound - pos : pos - maxBound;
                const resistance = 1 - Math.min(overOffset / this.pullRefreshMaxOffset, 1) * (1 - this.pullDampingRate);
                finalDelta = delta * resistance;
                this._pullOffset = Math.min(overOffset + Math.abs(finalDelta), this.pullRefreshMaxOffset);
                // console.log(`[VScrollView] 下拉偏移: ${this._pullOffset}`);
  
                // 更新刷新状态
                if (this._pullOffset >= this.pullRefreshThreshold) {
                    this._updateRefreshState(RefreshState.READY, this._pullOffset);
                } else {
                    this._updateRefreshState(RefreshState.PULLING, this._pullOffset);
                }
            }
        }
  
        if (this.enableLoadMore && !this._isLoadingMore && this._hasMore) {
            // 纵向：底部上拉（pos > maxBound 且向上拉）
            // 横向：右侧左拉（pos < minBound 且向左拉）
            const atBottomBound = this._isVertical() ? pos >= maxBound : pos <= minBound;
            const pullingUp = this._isVertical() ? delta > 0 : delta < 0;
  
            if (atBottomBound && pullingUp) {
                isPullingLoadMore = true;
                const overOffset = this._isVertical() ? pos - maxBound : minBound - pos;
                const resistance = 1 - Math.min(overOffset / this.loadMoreMaxOffset, 1) * (1 - this.pullDampingRate);
                finalDelta = delta * resistance;
                this._loadOffset = Math.min(overOffset + Math.abs(finalDelta), this.loadMoreMaxOffset);
  
                // console.log(`[VScrollView] 上拉偏移: ${this._loadOffset}`);
                // 更新加载状态
                if (this._loadOffset >= this.loadMoreThreshold) {
                    this._updateLoadMoreState(LoadMoreState.READY, this._loadOffset);
                } else {
                    this._updateLoadMoreState(LoadMoreState.PULLING, this._loadOffset);
                }
            }
        }
  
        // 如果禁用越界滚动，限制位置在边界内
        if (this.disableBounce) {
            const newPos = pos + finalDelta;
            // 不允许越界，直接限制在边界范围内
            if (newPos < minBound) {
                finalDelta = minBound - pos;
            } else if (newPos > maxBound) {
                finalDelta = maxBound - pos;
            }
        }
  
        // 应用位置变化
        pos += finalDelta;
        if (this.pixelAlign) pos = Math.round(pos);
        this._setContentMainPos(pos);
  
        // 记录速度采样
        const t = performance.now() / 1000;
        this._velSamples.push({ t, delta: finalDelta });
        const t0 = t - this.velocityWindow;
        while (this._velSamples.length && this._velSamples[0].t < t0) this._velSamples.shift();
        if (this.useVirtualList) this._updateVisible(false);
    }
  
    private _onUp(e?: EventTouch) {
        // 重置方向判断标志
        this._hasDeterminedScrollDirection = false;
        this._shouldBlockParent = false;
  
        this._stopTouchEvent(e);
        if (!this._isTouching) return;
        this._isTouching = false;
  
        // 检查是否触发刷新
        if (this._refreshState === RefreshState.READY && !this._isRefreshing) {
            this._triggerRefresh();
            this._velSamples.length = 0;
            return;
        }
  
        // 检查是否触发加载
        if (this._loadMoreState === LoadMoreState.READY && !this._isLoadingMore) {
            this._triggerLoadMore();
            this._velSamples.length = 0;
            return;
        }
  
        // 重置状态
        if (this._refreshState !== RefreshState.REFRESHING) {
            this._pullOffset = 0;
            this._updateRefreshState(RefreshState.IDLE, 0);
        }
        if (this._loadMoreState !== LoadMoreState.LOADING) {
            this._loadOffset = 0;
            this._updateLoadMoreState(LoadMoreState.IDLE, 0);
        }
  
        // 计算速度
        if (this._velSamples.length >= 2) {
            let sum = 0;
            let dtSum = 0;
            const sampleCount = Math.min(this._velSamples.length, 5);
            const startIndex = this._velSamples.length - sampleCount;
            for (let i = startIndex + 1; i < this._velSamples.length; i++) {
                sum += this._velSamples[i].delta;
                dtSum += this._velSamples[i].t - this._velSamples[i - 1].t;
            }
            if (dtSum > 0.001) {
                this._velocity = sum / dtSum;
                this._velocity = math.clamp(this._velocity, -this.maxVelocity, this.maxVelocity);
            } else {
                this._velocity =
                    this._velSamples.length > 0
                        ? math.clamp(
                              this._velSamples[this._velSamples.length - 1].delta * 60,
                              -this.maxVelocity,
                              this.maxVelocity
                          )
                        : 0;
            }
        } else if (this._velSamples.length === 1) {
            this._velocity = math.clamp(this._velSamples[0].delta * 60, -this.maxVelocity, this.maxVelocity);
        } else {
            this._velocity = 0;
        }
        this._velSamples.length = 0;
  
        // 分页吸附模式：根据滑动距离判断翻页
        if (this.enablePageSnap) {
            this._performPageSnapByDistance();
        }
    }
  
    // 更新刷新状态
    private _updateRefreshState(state: RefreshState, offset: number) {
        if (this._refreshState === state) return;
        this._refreshState = state;
        if (this.onRefreshStateChangeFn) {
            this.onRefreshStateChangeFn(state, offset);
        }
    }
  
    // 更新加载状态
    private _updateLoadMoreState(state: LoadMoreState, offset: number) {
        if (this._loadMoreState === state) return;
        this._loadMoreState = state;
        if (this.onLoadMoreStateChangeFn) {
            this.onLoadMoreStateChangeFn(state, offset);
        }
    }
  
    // 触发刷新
    private _triggerRefresh() {
        this._isRefreshing = true;
        this._velocity = 0;
        this._updateRefreshState(RefreshState.REFRESHING, this.pullRefreshThreshold);
    }
  
    // 触发加载更多
    private _triggerLoadMore() {
        this._isLoadingMore = true;
        this._velocity = 0;
        this._updateLoadMoreState(LoadMoreState.LOADING, this.loadMoreThreshold);
    }
  
    /**
     * 完成刷新（外部调用）
     * @param success 是否刷新成功
     */
    public finishRefresh(success: boolean = true) {
        if (!this._isRefreshing) return;
        this._isRefreshing = false;
        this._pullOffset = 0;
        this._updateRefreshState(success ? RefreshState.COMPLETE : RefreshState.IDLE, 0);
  
        // 延迟重置到 IDLE 状态
        this.scheduleOnce(() => {
            if (this._refreshState === RefreshState.COMPLETE) {
                this._updateRefreshState(RefreshState.IDLE, 0);
            }
        }, 0.3);
    }
  
    /**
     * 完成加载更多（外部调用）
     * @param hasMore 是否还有更多数据
     */
    public finishLoadMore(hasMore: boolean = true) {
        if (!this._isLoadingMore) return;
        this._isLoadingMore = false;
        this._loadOffset = 0;
        this._hasMore = hasMore;
  
        if (!hasMore) {
            this._updateLoadMoreState(LoadMoreState.NO_MORE, 0);
        } else {
            this._updateLoadMoreState(LoadMoreState.COMPLETE, 0);
            // 延迟重置到 IDLE 状态
            this.scheduleOnce(() => {
                if (this._loadMoreState === LoadMoreState.COMPLETE) {
                    this._updateLoadMoreState(LoadMoreState.IDLE, 0);
                }
            }, 0.3);
        }
    }
  
    /**
     * 重置加载更多状态（当数据清空或重新加载时调用）
     */
    public resetLoadMoreState() {
        this._hasMore = true;
        this._isLoadingMore = false;
        this._loadOffset = 0;
        this._updateLoadMoreState(LoadMoreState.IDLE, 0);
    }
  
    private _updateVisible(force: boolean) {
        if (!this.useVirtualList) return;
        let scrollPos = this._getContentMainPos();
        let searchPos: number;
        if (this._isVertical()) {
            searchPos = math.clamp(scrollPos, 0, this._contentSize);
        } else {
            searchPos = math.clamp(-scrollPos, 0, this._contentSize);
        }
  
        let newFirst = 0;
        if (this.useDynamicSize) {
            const range = this._calcVisibleRange(searchPos);
            newFirst = range.start;
        } else {
            const stride = this.itemMainSize + this.spacing;
            // 减去 headerSpacing 后再计算行号
            const adjustedPos = Math.max(0, searchPos - this.headerSpacing);
            const firstLine = Math.floor(adjustedPos / stride);
            const first = firstLine * this.gridCount;
            newFirst = math.clamp(first, 0, Math.max(0, this.totalCount - 1));
        }
        if (this.totalCount < this._slots) newFirst = 0;
        if (force) {
            this._slotFirstIndex = newFirst;
            this._layoutSlots(this._slotFirstIndex, true);
            return;
        }
        const diff = newFirst - this._slotFirstIndex;
        if (diff === 0) return;
        if (Math.abs(diff) >= this._slots) {
            this._slotFirstIndex = newFirst;
            this._layoutSlots(this._slotFirstIndex, true);
            return;
        }
        const absDiff = Math.abs(diff);
        if (diff > 0) {
            const moved = this._slotNodes.splice(0, absDiff);
            this._slotNodes.push(...moved);
            if (this.useDynamicSize && this._slotPrefabIndices.length > 0) {
                const movedIndices = this._slotPrefabIndices.splice(0, absDiff);
                this._slotPrefabIndices.push(...movedIndices);
            }
            this._slotFirstIndex = newFirst;
            for (let i = 0; i < absDiff; i++) {
                const slot = this._slots - absDiff + i;
                const idx = this._slotFirstIndex + slot;
                if (idx >= this.totalCount) {
                    const node = this._slotNodes[slot];
                    if (node) node.active = false;
                } else {
                    this._layoutSingleSlot(this._slotNodes[slot], idx, slot);
                }
            }
        } else {
            const moved = this._slotNodes.splice(this._slotNodes.length + diff, absDiff);
            this._slotNodes.unshift(...moved);
            if (this.useDynamicSize && this._slotPrefabIndices.length > 0) {
                const movedIndices = this._slotPrefabIndices.splice(this._slotPrefabIndices.length + diff, absDiff);
                this._slotPrefabIndices.unshift(...movedIndices);
            }
            this._slotFirstIndex = newFirst;
            for (let i = 0; i < absDiff; i++) {
                const idx = this._slotFirstIndex + i;
                if (idx >= this.totalCount) {
                    const node = this._slotNodes[i];
                    if (node) node.active = false;
                } else {
                    this._layoutSingleSlot(this._slotNodes[i], idx, i);
                }
            }
        }
    }
  
    private async _layoutSingleSlot(node: Node | null, idx: number, slot: number) {
        if (!this.useVirtualList) return;
        if (this.useDynamicSize) {
            let targetPrefabIndex = this.getItemTypeIndexFn(idx);
            const currentPrefabIndex = this._slotPrefabIndices[slot];
            let newNode: Node | null = null;
            if (currentPrefabIndex === targetPrefabIndex && this._slotNodes[slot]) {
                newNode = this._slotNodes[slot];
            } else {
                if (this._slotNodes[slot] && this._nodePool && currentPrefabIndex >= 0) {
                    this._nodePool.put(this._slotNodes[slot], currentPrefabIndex);
                }
                if (this._nodePool) {
                    newNode = this._nodePool.get(targetPrefabIndex);
                    if (!newNode) {
                        console.error(`[VScrollView] 无法获取类型 ${targetPrefabIndex} 的节点`);
                        return;
                    }
                    newNode.parent = this.content;
                    this._slotNodes[slot] = newNode;
                    this._slotPrefabIndices[slot] = targetPrefabIndex;
                }
            }
            if (!newNode) {
                console.error(`[VScrollView] 槽位 ${slot} 节点为空，索引 ${idx}`);
                return;
            }
            newNode.active = true;
            this._updateItemClickHandler(newNode, idx);
            if (this.renderItemFn) this.renderItemFn(newNode, idx);
            if (this.getItemHeightFn) {
                const expectedSize = this.getItemHeightFn(idx);
                if (this._itemSizes[idx] !== expectedSize) {
                    this.updateItemHeight(idx, expectedSize);
                    return;
                }
            } else {
                const uit = newNode.getComponent(UITransform);
                const actualSize = this._isVertical() ? uit?.height || 100 : uit?.width || 100;
                if (Math.abs(this._itemSizes[idx] - actualSize) > 1) {
                    this.updateItemHeight(idx, actualSize);
                    return;
                }
            }
            const uit = newNode.getComponent(UITransform);
            const size = this._itemSizes[idx];
            const itemStart = this._prefixPositions[idx];
            if (this._isVertical()) {
                const anchorY = uit?.anchorY ?? 0.5;
                const anchorOffsetY = size * (1 - anchorY);
                const nodeY = itemStart + anchorOffsetY;
                const y = -nodeY;
                newNode.setPosition(0, this.pixelAlign ? Math.round(y) : y);
            } else {
                // 修改：横向模式下，itemStart 是正值，但 content.x 是负值
                // 所以 item 的 x 位置应该直接使用 itemStart（因为 content 整体向左移动）
                const anchorX = uit?.anchorX ?? 0.5;
                const anchorOffsetX = size * anchorX;
                const nodeX = itemStart + anchorOffsetX;
                // 不需要取负，因为 content 本身已经是负值了
                const x = nodeX;
                newNode.setPosition(this.pixelAlign ? Math.round(x) : x, 0);
            }
            if (this._needAnimateIndices.has(idx)) {
                if (this.playItemAppearAnimationFn) this.playItemAppearAnimationFn(newNode, idx);
                else this._playDefaultItemAppearAnimation(newNode, idx);
                this._needAnimateIndices.delete(idx);
            }
        } else {
            // 等大小模式
            if (!node) return;
            node.active = true;
            const stride = this.itemMainSize + this.spacing;
            const line = Math.floor(idx / this.gridCount);
            const gridPos = idx % this.gridCount;
            const uit = node.getComponent(UITransform);
  
            // 1. 计算基础位置（包含 headerSpacing）
            const itemStart = this.headerSpacing + line * stride;
  
            // 2. 计算全局偏移（视口居中）- 只在内容小于视口时生效
            let globalOffset = 0;
            let shouldAutoCenter = false; // 是否应该居中
            if (this.autoCenter) {
                const totalLines = Math.ceil(this.totalCount / this.gridCount);
                const totalContentSize = this.headerSpacing + totalLines * stride - this.spacing + this.footerSpacing;
                // 只有当内容小于视口时才居中
                if (totalContentSize < this._viewportSize) {
                    shouldAutoCenter = true;
                    globalOffset = (this._viewportSize - totalContentSize) / 2;
                }
            }
  
            if (this._isVertical()) {
                // 纵向模式：主方向是 Y，副方向是 X
                const anchorY = uit?.anchorY ?? 0.5;
                const anchorOffsetY = this.itemMainSize * (1 - anchorY);
                const nodeY = itemStart + anchorOffsetY + globalOffset;
                const y = -nodeY;
  
                // 3. 计算当前行的实际子项数量（行内居中）- 只在启用居中且内容小于视口时生效
                let actualCountInLine = this.gridCount;
                if (shouldAutoCenter) {
                    const startIdxOfLine = line * this.gridCount;
                    const endIdxOfLine = Math.min(startIdxOfLine + this.gridCount, this.totalCount);
                    actualCountInLine = endIdxOfLine - startIdxOfLine;
                }
  
                // 根据实际数量计算总宽度和位置
                const totalWidth = actualCountInLine * this.itemCrossSize + (actualCountInLine - 1) * this.gridSpacing;
                const x = gridPos * (this.itemCrossSize + this.gridSpacing) - totalWidth / 2 + this.itemCrossSize / 2;
  
                node.setPosition(this.pixelAlign ? Math.round(x) : x, this.pixelAlign ? Math.round(y) : y);
                if (uit) {
                    uit.width = this.itemCrossSize;
                    uit.height = this.itemMainSize;
                }
            } else {
                // 横向模式：主方向是 X，副方向是 Y
                const anchorX = uit?.anchorX ?? 0.5;
                const anchorOffsetX = this.itemMainSize * anchorX;
                const nodeX = itemStart + anchorOffsetX + globalOffset;
                const x = nodeX;
  
                // 3. 计算当前列的实际子项数量（列内居中）- 只在启用居中且内容小于视口时生效
                let actualCountInLine = this.gridCount;
                if (shouldAutoCenter) {
                    const startIdxOfLine = line * this.gridCount;
                    const endIdxOfLine = Math.min(startIdxOfLine + this.gridCount, this.totalCount);
                    actualCountInLine = endIdxOfLine - startIdxOfLine;
                }
  
                // 根据实际数量计算总高度和位置
                const totalHeight = actualCountInLine * this.itemCrossSize + (actualCountInLine - 1) * this.gridSpacing;
                const y = totalHeight / 2 - gridPos * (this.itemCrossSize + this.gridSpacing) - this.itemCrossSize / 2;
  
                node.setPosition(this.pixelAlign ? Math.round(x) : x, this.pixelAlign ? Math.round(y) : y);
                if (uit) {
                    uit.width = this.itemMainSize;
                    uit.height = this.itemCrossSize;
                }
            }
            this._updateItemClickHandler(node, idx);
            if (this.renderItemFn) this.renderItemFn(node, idx);
            if (this._needAnimateIndices.has(idx)) {
                if (this.playItemAppearAnimationFn) this.playItemAppearAnimationFn(node, idx);
                else this._playDefaultItemAppearAnimation(node, idx);
                this._needAnimateIndices.delete(idx);
            }
        }
    }
  
    private _playDefaultItemAppearAnimation(node: Node, index: number) {}
  
    private _updateItemClickHandler(node: Node, index: number) {
        if (!this.useVirtualList) return;
        let itemScript = node.getComponent(VScrollViewItem);
        if (!itemScript) itemScript = node.addComponent(VScrollViewItem);
        this._initSortLayerFlag ? itemScript.onSortLayer() : itemScript.offSortLayer();
        itemScript.useItemClickEffect = this.onItemClickFn ? true : false;
        if (!itemScript.onClickCallback) {
            itemScript.onClickCallback = (idx: number) => {
                if (this.onItemClickFn) this.onItemClickFn(node, idx);
            };
        }
        if (!itemScript.onLongPressCallback) {
            itemScript.onLongPressCallback = (idx: number) => {
                if (this.onItemLongPressFn) this.onItemLongPressFn(node, idx);
            };
        }
        itemScript.setDataIndex(index);
    }
  
    private _layoutSlots(firstIndex: number, forceRender: boolean) {
        if (!this.useVirtualList) return;
        for (let s = 0; s < this._slots; s++) {
            const idx = firstIndex + s;
            const node = this._slotNodes[s];
            if (idx >= this.totalCount) {
                if (node) node.active = false;
            } else {
                this._layoutSingleSlot(node, idx, s);
            }
        }
    }
  
    private _recomputeContentSize() {
        if (!this.useVirtualList) {
            this._contentSize = this._isVertical() ? this._contentTf.height : this._contentTf.width;
            if (this._isVertical()) {
                this._boundsMin = 0;
                this._boundsMax = Math.max(0, this._contentSize - this._viewportSize);
            } else {
                this._boundsMin = -Math.max(0, this._contentSize - this._viewportSize);
                this._boundsMax = 0;
            }
            return;
        }
        if (this.useDynamicSize) return;
        const stride = this.itemMainSize + this.spacing;
        const totalLines = Math.ceil(this.totalCount / this.gridCount);
        // 添加 headerSpacing 和 footerSpacing
        this._contentSize =
            totalLines > 0 ? this.headerSpacing + totalLines * stride - this.spacing + this.footerSpacing : 0;
        if (this._isVertical()) this._contentTf.height = Math.max(this._contentSize, this._viewportSize);
        else this._contentTf.width = Math.max(this._contentSize, this._viewportSize);
  
        if (this._isVertical()) {
            this._boundsMin = 0;
            this._boundsMax = Math.max(0, this._contentSize - this._viewportSize);
        } else {
            this._boundsMin = -Math.max(0, this._contentSize - this._viewportSize);
            this._boundsMax = 0;
        }
    }
  
    /**
     * 获取当前页索引
     */
    public getCurrentPageIndex(): number {
        return this._currentPageIndex;
    }
  
    /**
     * 滚动到指定页
     */
    public scrollToPage(pageIndex: number, animate: boolean = true) {
        if (!this.enablePageSnap) {
            console.warn('[VScrollView] 未启用分页吸附模式');
            return;
        }
  
        const maxPage = this._getMaxPageIndex();
        pageIndex = math.clamp(pageIndex, 0, maxPage);
  
        const targetPos = this._getPagePosition(pageIndex);
        this._scrollToPosition(targetPos, animate, this.pageSnapDuration);
  
        this._updateCurrentPage(pageIndex);
    }
  
    /**
     * 获取最大页索引
     */
    private _getMaxPageIndex(): number {
        if (this.useDynamicSize) {
            return Math.max(0, this.totalCount - 1);
        } else {
            const totalLines = Math.ceil(this.totalCount / this.gridCount);
            return Math.max(0, totalLines - 1);
        }
    }
  
    /**
     * 根据当前位置计算最近的页索引
     */
    private _getNearestPageIndex(): number {
        const pos = this._getContentMainPos();
        const searchPos = this._isVertical() ? pos : -pos;
  
        if (this.useDynamicSize) {
            // 不等大小模式：根据 item 的中心位置判断
            let nearestIdx = 0;
            let minDist = Infinity;
  
            for (let i = 0; i < this.totalCount; i++) {
                const itemStart = this._prefixPositions[i];
                const itemSize = this._itemSizes[i];
                const itemCenter = itemStart + itemSize / 2;
                const dist = Math.abs(searchPos - itemStart);
  
                if (dist < minDist) {
                    minDist = dist;
                    nearestIdx = i;
                }
            }
            return nearestIdx;
        } else {
            // 等大小模式：根据行/列计算
            const stride = this.itemMainSize + this.spacing;
            const adjustedPos = Math.max(0, searchPos - this.headerSpacing);
            const line = Math.round(adjustedPos / stride);
            return math.clamp(line, 0, this._getMaxPageIndex());
        }
    }
  
    /**
     * 根据页索引计算目标位置
     */
    private _getPagePosition(pageIndex: number): number {
        let targetPos = 0;
  
        if (this.useDynamicSize) {
            targetPos = this._prefixPositions[pageIndex] || 0;
        } else {
            targetPos = this.headerSpacing + pageIndex * (this.itemMainSize + this.spacing);
        }
  
        // 横向模式取负值
        if (!this._isVertical()) {
            targetPos = -targetPos;
        }
  
        // 限制在边界范围内
        return math.clamp(targetPos, this._boundsMin, this._boundsMax);
    }
  
    /**
     * 更新当前页并触发回调
     */
    private _updateCurrentPage(pageIndex: number) {
        if (this._currentPageIndex !== pageIndex) {
            this._currentPageIndex = pageIndex;
            if (this.onPageChangeFn) {
                this.onPageChangeFn(pageIndex);
            }
        }
    }
  
    /**
     * 执行分页吸附
     */
    private _performPageSnap() {
        if (!this.enablePageSnap) return;
  
        // 如果正在 tween 吸附中，不重复执行
        if (this._scrollTween) return;
  
        const nearestPage = this._getNearestPageIndex();
        const targetPage = math.clamp(nearestPage, 0, this._getMaxPageIndex());
  
        const targetPos = this._getPagePosition(targetPage);
        const currentPos = this._getContentMainPos();
  
        // 如果已经在目标位置，只更新页码
        if (Math.abs(targetPos - currentPos) < 1) {
            this._updateCurrentPage(targetPage);
            return;
        }
  
        this._velocity = 0;
        this._scrollToPosition(targetPos, true, this.pageSnapDuration);
  
        this._updateCurrentPage(targetPage);
    }
    /**
     * 根据滑动距离执行分页吸附
     */
    private _performPageSnapByDistance() {
        if (!this.enablePageSnap) return;
        if (this._scrollTween) return;
  
        const currentPos = this._getContentMainPos();
        const dragDistance = currentPos - this._pageStartPos; // 滑动距离
  
        // 获取当前页的尺寸
        const pageSize = this._getCurrentPageSize();
  
        // 判断翻页的距离阈值
        const threshold = pageSize * this.pageSnapDistanceRatio;
  
        // 基于当前页索引计算目标页
        let targetPage = this._currentPageIndex;
        const maxPage = this._getMaxPageIndex();
  
        if (this._isVertical()) {
            // 纵向：dragDistance > 0 表示向下滑（看上一页），< 0 表示向上滑（看下一页）
            if (dragDistance > threshold) {
                targetPage = this._currentPageIndex + 1;
            } else if (dragDistance < -threshold) {
                targetPage = this._currentPageIndex - 1;
            }
        } else {
            // 横向：dragDistance < 0 表示向左滑（看下一页），> 0 表示向右滑（看上一页）
            if (dragDistance < -threshold) {
                targetPage = this._currentPageIndex + 1;
            } else if (dragDistance > threshold) {
                targetPage = this._currentPageIndex - 1;
            }
        }
  
        // 限制范围
        targetPage = math.clamp(targetPage, 0, maxPage);
  
        const targetPos = this._getPagePosition(targetPage);
  
        // 如果已经在目标位置，只更新页码
        if (Math.abs(targetPos - currentPos) < 1) {
            this._updateCurrentPage(targetPage);
            this._velocity = 0;
            return;
        }
  
        this._velocity = 0;
        this._scrollToPosition(targetPos, true, this.pageSnapDuration);
        this._updateCurrentPage(targetPage);
    }
  
    /**
     * 获取当前页的尺寸
     */
    private _getCurrentPageSize(): number {
        if (this.useDynamicSize) {
            const pageIndex = math.clamp(this._currentPageIndex, 0, this.totalCount - 1);
            return this._itemSizes[pageIndex] || 100;
        } else {
            return this.itemMainSize + this.spacing;
        }
    }
  
    /**
     * 根据位置计算页索引
     */
    private _getPageIndexByPosition(pos: number): number {
        const searchPos = this._isVertical() ? pos : -pos;
  
        if (this.useDynamicSize) {
            return this._posToFirstIndex(searchPos);
        } else {
            const stride = this.itemMainSize + this.spacing;
            const adjustedPos = Math.max(0, searchPos - this.headerSpacing);
            const line = Math.floor(adjustedPos / stride);
            return math.clamp(line, 0, this._getMaxPageIndex());
        }
    }
  
    //播放跳跃动画
    public playJumpAnimation(params: { startIndex: number; endIndex: number; minNum: number; cb: () => void }) {
        const { startIndex, endIndex, minNum, cb } = params;
        
        // 检查组件是否有效
        if (!this.node || !this.node.isValid) {
            if (cb) cb();
            return;
        }
        
        // 设置标志，禁用触摸
        this._isPlayingJumpAnimation = true;
        
        // 关闭渲染排序
        this.onOffSortLayer(false);
        
        //先滚动到startIndex位置,让startindex位置在最下方
        this.scrollToIndexBottom(startIndex, false);
  
        // 从content.children中查找对应dataIndex的节点
        const getNodeByDataIndex = (dataIndex: number): Node | null => {
            if (!this.content) return null;
            for (const child of this.content.children) {
                const itemScript = child.getComponent(VScrollViewItem);
                if (itemScript && itemScript.dataIndex === dataIndex) {
                    return child;
                }
            }
            return null;
        };
  
        //当前的item
        const currentItem = getNodeByDataIndex(startIndex);
        if (!currentItem) {
            console.error(`[VScrollView] 无法找到索引 ${startIndex} 的节点`);
            this._isPlayingJumpAnimation = false;
            this.onOffSortLayer(true);
            if (cb) cb();
            return;
        }
  
        //克隆当前位置的item
        const cloneItem = instantiate(currentItem);
        this.node.addChild(cloneItem);
        cloneItem.setWorldPosition(currentItem.getWorldPosition());
        currentItem.active = false;
        
        //判断差距是否滚动到endIndex位置
        const distance = Math.abs(endIndex - startIndex);
        if (distance > minNum) {
            this._standUpAnimation({
                cloneItem,
                endIndex,
                startIndex,  // 传入起始索引
                getNodeByDataIndex,
                totalTime: 0.4,
                cb
            });
        } else {
            const endItem = getNodeByDataIndex(endIndex);
            this._jumpAnimation({
                cloneItem,
                endItem,
                endIndex,
                startIndex,  // 传入起始索引
                totalTime: 0.5,
                cb: () => {
                    // 恢复标志，启用触摸
                    this._isPlayingJumpAnimation = false;
                    // 打开渲染排序
                    this.onOffSortLayer(true);
                    if (cb) cb();
                }
            });
        }
    }
  
    //距离太长了，先起立
    private _standUpAnimation(params: {
        cloneItem: Node;
        endIndex: number;
        startIndex: number;  // 新增：起始索引
        getNodeByDataIndex: (dataIndex: number) => Node | null;
        totalTime?: number;
        cb: () => void;
    }) {
        const { cloneItem, endIndex, startIndex, getNodeByDataIndex, cb } = params;
        const totalTime = params.totalTime ?? 0.4;
        
        // 检查组件是否有效
        if (!this.node || !this.node.isValid) {
            if (cloneItem && cloneItem.isValid) {
                cloneItem.destroy();
            }
            // 恢复标志，启用触摸
            this._isPlayingJumpAnimation = false;
            this.onOffSortLayer(true);
            if (cb) cb();
            return;
        }
        
        if (!cloneItem || !cloneItem.isValid) {
            // 恢复标志，启用触摸
            this._isPlayingJumpAnimation = false;
            this.onOffSortLayer(true);
            if (cb) cb();
            return;
        }
        
        const standUpTime = 0.4;
        const height = cloneItem.getComponent(UITransform)!.height;
        const currentWorldPos = cloneItem.getWorldPosition();
        const endScale = new Vec3(1.2, 1.2, 1);
        const endWorldPos = new Vec3(currentWorldPos.x, currentWorldPos.y + height * 0.6, currentWorldPos.z);
        
        // 转换为相对于this.node的本地坐标（因为cloneItem是this.node的子节点）
        const nodeTransform = this.node.getComponent(UITransform);
        const targetLocalPos = nodeTransform ? nodeTransform.convertToNodeSpaceAR(endWorldPos) : endWorldPos;
        
        //滚动到目标位置
        this.scrollToIndex(endIndex - 1, true, standUpTime);
        
        //起立动画：使用backOut缓动，有回弹效果
        tween(cloneItem)
            .to(standUpTime * 0.6, { 
                position: targetLocalPos, 
                scale: endScale 
            }, { 
                easing: 'backOut' 
            })
            .to(standUpTime * 0.4, { 
                scale: new Vec3(1.1, 1.1, 1) 
            }, { 
                easing: 'sineOut' 
            })
            .call(() => {
                // 检查组件是否有效
                if (!this.node || !this.node.isValid) {
                    if (cloneItem && cloneItem.isValid) {
                        cloneItem.destroy();
                    }
                    // 恢复标志，启用触摸
                    this._isPlayingJumpAnimation = false;
                    this.onOffSortLayer(true);
                    if (cb) cb();
                    return;
                }
                
                // 滚动完成后，重新获取endItem（因为滚动后节点位置会改变）
                const endItem = getNodeByDataIndex(endIndex);
                if (endItem) {
                    // 直接调用_jumpAnimation
                    this._jumpAnimation({
                        cloneItem,
                        endItem,
                        endIndex,
                        startIndex,  // 传入起始索引
                        totalTime,
                        cb: () => {
                            // 恢复标志，启用触摸
                            this._isPlayingJumpAnimation = false;
                            // 打开渲染排序
                            this.onOffSortLayer(true);
                            if (cb) cb();
                        }
                    });
                } else {
                    if (cloneItem && cloneItem.isValid) {
                        cloneItem.destroy();
                    }
                    // 恢复标志，启用触摸
                    this._isPlayingJumpAnimation = false;
                    // 打开渲染排序
                    this.onOffSortLayer(true);
                    if (cb) cb();
                }
            })
            .start();
    }
  
    //直接播放跳跃动画
    private _jumpAnimation(params: {
        cloneItem: Node;
        endItem: Node;
        endIndex: number;
        startIndex: number;  // 新增：起始索引
        totalTime?: number;
        cb: () => void;
    }) {
        const { cloneItem, endItem, endIndex, startIndex, cb } = params;
        const totalTime = params.totalTime ?? 0.5;
        
        // 检查组件是否有效
        if (!this.node || !this.node.isValid) {
            if (cloneItem && cloneItem.isValid) {
                cloneItem.destroy();
            }
            this._isPlayingJumpAnimation = false;
            this.onOffSortLayer(true);
            if (cb) cb();
            return;
        }
        
        if (!endItem || !cloneItem || !endItem.isValid || !cloneItem.isValid) {
            this._isPlayingJumpAnimation = false;
            this.onOffSortLayer(true);
            if (cb) cb();
            return;
        }
  
        const startWorldPos = cloneItem.getWorldPosition();
        const endWorldPos = endItem.getWorldPosition();
        
        // 将坐标转换为相对于this.node的本地坐标
        const nodeTransform = this.node.getComponent(UITransform)!;
        const startLocalPos = nodeTransform.convertToNodeSpaceAR(startWorldPos);
        const endLocalPos = nodeTransform.convertToNodeSpaceAR(endWorldPos);
  
        // 计算中间点（抛物线顶点）
        const midLocalPos = new Vec3(
            (startLocalPos.x + endLocalPos.x) / 2,
            Math.max(startLocalPos.y, endLocalPos.y) + 100, // 抛物线高度
            startLocalPos.z
        );
  
        // 找到需要让位的节点：从 endIndex 到 startIndex 之间的节点（不包括 startIndex）
        if (!this.content) return;
        const nodesToMove = this.content.children.filter(child => {
            const itemScript = child.getComponent(VScrollViewItem);
            if (!itemScript) return false;
            // 只移动目标位置到开始位置之间的节点
            return itemScript.dataIndex >= endIndex && itemScript.dataIndex < startIndex;
        });

        // 需要让位的节点往下移动（提前开始，制造流畅感）
        // 不等高模式：使用目标位置的实际高度（从_itemSizes获取或使用endItem的高度）
        // 等高模式：使用cloneItem的高度
        let moveHeight: number;
        if (this.useDynamicSize && this._itemSizes && this._itemSizes[endIndex] !== undefined) {
            // 不等高模式：使用目标位置的实际高度
            moveHeight = this._itemSizes[endIndex];
        } else if (endItem && endItem.isValid) {
            // 使用endItem的实际高度
            moveHeight = endItem.getComponent(UITransform)!.height;
        } else {
            // 兜底：使用cloneItem的高度
            moveHeight = cloneItem.getComponent(UITransform)!.height;
        }
        // 让位距离 = 节点高度 + 间距
        const moveDistance = moveHeight + this.spacing;
        const contentTransform = this.content.getComponent(UITransform);
        nodesToMove.forEach(child => {
            if (!child || !child.isValid) return;
            const worldPos = child.getWorldPosition();
            const targetWorldPos = new Vec3(worldPos.x, worldPos.y - moveDistance, worldPos.z);
            const targetLocalPos = contentTransform
                ? contentTransform.convertToNodeSpaceAR(targetWorldPos)
                : targetWorldPos;
            
            // 使用backOut缓动，有弹性效果
            tween(child)
                .to(totalTime * 0.8, { position: targetLocalPos }, { easing: 'backOut' })
                .start();
        });
  
        // 跳跃动画：分为上升和下降两个阶段
        const upTime = totalTime * 0.4;
        const downTime = totalTime * 0.6;
        
        // 上升阶段：快速上升+放大
        tween(cloneItem)
            .parallel(
                tween().to(upTime, { 
                    position: midLocalPos 
                }, { 
                    easing: 'quadOut' // 快出慢进
                }),
                tween().to(upTime, { 
                    scale: new Vec3(1.35, 1.35, 1) 
                }, { 
                    easing: 'backOut' // 有回弹的放大
                })
            )
            .call(() => {
                // 下降阶段：加速下降+缩小
                tween(cloneItem)
                    .parallel(
                        tween().to(downTime, { 
                            position: endLocalPos 
                        }, { 
                            easing: 'cubicIn' // 加速落下
                        }),
                        tween().to(downTime * 0.7, { 
                            scale: new Vec3(1.1, 1.1, 1) 
                        }, { 
                            easing: 'quadIn' 
                        })
                        .to(downTime * 0.3, { 
                            scale: new Vec3(1, 1, 1) 
                        }, { 
                            easing: 'backOut' // 落地时有轻微回弹
                        })
                    )
                    .call(() => {
                        // 落地后的"震动"效果
                        tween(cloneItem)
                            .to(0.08, { scale: new Vec3(1.05, 0.95, 1) })
                            .to(0.08, { scale: new Vec3(1, 1, 1) })
                            .call(() => {
                                // 检查组件是否有效
                                if (!this.node || !this.node.isValid) {
                                    if (cloneItem && cloneItem.isValid) {
                                        cloneItem.destroy();
                                    }
                                    this._isPlayingJumpAnimation = false;
                                    this.onOffSortLayer(true);
                                    if (cb) cb();
                                    return;
                                }
                                
                                // 动画完成后，停止所有被位移节点的动画
                                nodesToMove.forEach(child => {
                                    if (child && child.isValid) {
                                        Tween.stopAllByTarget(child);
                                    }
                                });
                                // 销毁克隆节点
                                if (cloneItem && cloneItem.isValid) {
                                    cloneItem.destroy();
                                }
                                // 执行回调
                                if (cb) cb();
                            })
                            .start();
                    })
                    .start();
            })
            .start();
    }
  }
  