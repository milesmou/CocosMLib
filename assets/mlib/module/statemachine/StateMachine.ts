
export interface IStateNode {
    name: string;
    machine: StateMachine;
    onCreate(): void;
    onEnter(): void;
    onUpdate(...args: any[]): void;
    onExit(): void;
}

/** 有限状态机 */
export class StateMachine {

    private _nodes: Map<string, IStateNode> = new Map();
    private _curNode: IStateNode;
    private _preNode: IStateNode;
    private _onStateChange: () => void;

    /** 当前运行的节点名称 */
    public get currentNodeName() { return this._curNode?.name; }
    /** 之前运行的节点名称 */
    public get previousNodeName() { return this._preNode?.name; }

    /** 更新状态机 */
    public update(...args: any[]) {
        if (this._curNode != null)
            this._curNode.onUpdate(...args);
    }

    /**
     * 启动状态机
     * @param entryNode 入口节点
     */
    public run(nodeName: string) {
        this._curNode = this._nodes.get(nodeName);
        this._preNode = this._curNode;

        if (this._curNode)
            this._curNode.onEnter();
        else
        mLogger.error(`Not found entry node : ${nodeName}`);
    }



    /** 加入一个节点 */
    public addNode(node: IStateNode) {
        if (!node)
            throw new Error("node error");

        if (!this._nodes.has(node.name)) {
            node.onCreate();
            node.machine = this;
            this._nodes.set(node.name, node);
        }
        else {
            mLogger.warn(`Node ${node.name} already existed`);
        }
    }

    /** 转换节点 */
    public changeState(nodeName: string) {
        let node = this._nodes.get(nodeName);
        if (!node) {
            mLogger.error(`Can not found node ${nodeName}`);
            return;
        }
        this._preNode = this._curNode;
        this._curNode.onExit();
        this._curNode = node;
        this._curNode.onEnter();
        this._onStateChange && this._onStateChange();
    }

    /** 监听状态变化 */
    public onStateChange(action: () => void) {
        this._onStateChange = action;
    }
}