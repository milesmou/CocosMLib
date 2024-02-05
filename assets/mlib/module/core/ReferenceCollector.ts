import { _decorator, Asset, CCObject, Component, error, js, Node } from "cc";
import { EDITOR_NOT_IN_PREVIEW } from "cc/env";

const { ccclass, property, executeInEditMode, executionOrder, disallowMultiple } = _decorator;

@ccclass("CollectorNodeData")
class CollectorNodeData {
    @property({ readonly: true })
    public key = "";
    @property({ type: Node, readonly: true })
    public node: Node = null;
}

@ccclass("CollectorAssetData")
class CollectorAssetData {
    @property
    public key = "";
    @property({ type: Asset })
    public asset: Asset = null;
}

@ccclass("ReferenceCollector")
@disallowMultiple
@executeInEditMode(true)
@executionOrder(-100)
export class ReferenceCollector extends Component {

    @property
    private _refresh = false;
    @property({ displayName: "刷新" })
    private get refresh() { return this._refresh; }
    private set refresh(val: boolean) {
        if (EDITOR_NOT_IN_PREVIEW) {
            this.initNodeList();
        }
        this._refresh = false;
    }

    @property({ type: CollectorNodeData, readonly: true })
    private _nodes: CollectorNodeData[] = [];
    @property({ type: CollectorNodeData, readonly: true })
    private get nodes() { return this._nodes; }
    private set nodes(val: CollectorNodeData[]) { this._nodes = val; }

    @property({ type: CollectorAssetData })
    private _assets: CollectorAssetData[] = [];
    @property({ type: CollectorAssetData })
    private get assets() { return this._assets; }
    private set assets(val: CollectorAssetData[]) { this._assets = val; }

    private _nodeMap: Map<string, Node> = new Map();
    private _assetMap: Map<string, Asset> = new Map();

    protected onLoad(): void {
        if (EDITOR_NOT_IN_PREVIEW) {//处理编辑器逻辑
            this.initNodeList();
        } else {//处理运行时逻辑
            this.initNodeMap();
            this.initAssetMap();
        }
    }

    private initNodeMap() {
        this._nodeMap.clear();
        for (const collectorNodeData of this.nodes) {
            let key = collectorNodeData.key.trim();
            if (!this._nodeMap.has(key)) {
                this._nodeMap.set(key, collectorNodeData.node);
            } else {
                error("[MLogger Error]", this.node.name, "引用的节点名字重复 Key=" + key);
            }
        }
    }

    private initAssetMap() {
        this._assetMap.clear();
        for (const collectorAssetData of this.assets) {
            let key = collectorAssetData.key.trim();
            if (!this._assetMap.has(key)) {
                this._assetMap.set(key, collectorAssetData.asset);
            } else {
                error("[MLogger Error]", this.node.name, "引用的资源名字重复 Key=" + key);
            }
        }
    }

    public getNode(key: string) {
        return this._nodeMap.get(key);
    }

    public get<T extends CCObject>(key: string, type: new (...args: any[]) => T): T {
        if (js.isChildClassOf(type, Node)) {
            return this._nodeMap.get(key) as any;
        } else if (js.isChildClassOf(type, Asset)) {
            return this._assetMap.get(key) as any;
        } else if (js.isChildClassOf(type, Component)) {
            let node = this._nodeMap.get(key);
            if (node) return node.getComponent(type);
        }
        return null;
    }


    //#region 编辑器逻辑

    /** 收集名字以$开头的节点 */
    private _tag = "$";

    private initNodeList() {
        if (!EDITOR_NOT_IN_PREVIEW) return;
        this.nodes.length = 0;
        let nodes = this.getValidNode(this.node);
        for (const node of nodes) {
            let refData = new CollectorNodeData();
            let name = node.name.replace(this._tag, "").trim();
            refData.key = name;
            refData.node = node;
            this.nodes.push(refData);
        }
    }


    /** 获取符合需求的节点 */
    private getValidNode(root: Node) {
        if (!EDITOR_NOT_IN_PREVIEW) return;
        let arr: Node[] = [];
        let checkArr = root.children.filter(v => this.isNodeChildrenValid(v));
        arr.push(...checkArr);
        while (checkArr.length > 0) {
            let v = checkArr.shift();
            let arr1 = v.children.filter(v => this.isNodeValid(v));
            arr.push(...arr1);
            let arr2 = v.children.filter(v => this.isNodeChildrenValid(v));
            checkArr.push(...arr2);
        }
        return arr;
    }

    private isNodeChildrenValid(node: Node) {
        if (!EDITOR_NOT_IN_PREVIEW) return;
        if (node.getComponent(ReferenceCollector)) return false;
        return true;
    }

    private isNodeValid(node: Node) {
        if (!EDITOR_NOT_IN_PREVIEW) return;
        return node.name.startsWith(this._tag);
    }

    //#endregion


}
