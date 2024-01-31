import { _decorator, Component, Node } from "cc";
import { EDITOR_NOT_IN_PREVIEW } from "cc/env";
import { MLogger } from "../logger/MLogger";

const { ccclass, property, executeInEditMode, executionOrder, disallowMultiple } = _decorator;

@ccclass("ReferenceCollectorData")
class ReferenceCollectorData {
    @property({ readonly: true })
    public key = "";
    @property({ type: Node, readonly: true })
    public node: Node = null;
}

@ccclass("ReferenceCollector")
@disallowMultiple
@executeInEditMode(true)
@executionOrder(-1)
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

    @property({ type: ReferenceCollectorData, readonly: true })
    private _data: ReferenceCollectorData[] = [];
    @property({ type: ReferenceCollectorData, readonly: true })
    private get data() { return this._data; }
    private set data(val: ReferenceCollectorData[]) { this._data = val; }

    private _map: Map<string, Node> = new Map();

    protected onLoad(): void {
        if (EDITOR_NOT_IN_PREVIEW) {//处理编辑器逻辑
            this.initNodeList();
        } else {//处理运行时逻辑
            this.initNodeMap();
        }
    }

    private initNodeMap() {
        this._map.clear();
        for (const referenceCollectorData of this.data) {
            if (!this._map.has(referenceCollectorData.key)) {
                this._map.set(referenceCollectorData.key, referenceCollectorData.node);
            } else {
                MLogger.error(this.node.name, "引用的节点名字重复", referenceCollectorData.key);
            }
        }
    }

    public getNode(key: string) {
        return this._map.get(key);
    }

    public get<T extends Component>(key: string, type: new (...args: any[]) => T) {
        let node = this._map.get(key);
        if (node) return node.getComponent(type);
        return null;
    }

    //#region 编辑器逻辑

    private initNodeList() {
        if (!EDITOR_NOT_IN_PREVIEW) return;
        this.data.length = 0;
        let nodes = this.getValidNode(this.node);
        for (const node of nodes) {
            let refData = new ReferenceCollectorData();
            let name = node.name.replace("$", "").trim();
            refData.key = name;
            refData.node = node;
            this.data.push(refData);
        }
    }


    /** 获取符合需求的节点 */
    private getValidNode(root: Node) {
        if (!EDITOR_NOT_IN_PREVIEW) return;
        let arr: Node[] = [];
        let checkArr = root.children.filter(v => this.isNodeValid(v));
        arr.push(...checkArr);
        while (checkArr.length > 0) {
            let v = checkArr.shift();
            let children = v.children.filter(v => this.isNodeValid(v));
            if (children.length > 0) {
                checkArr.push(...children);
                arr.push(...children);
            }
        }
        return arr;
    }

    private isNodeValid(node: Node) {
        if (!EDITOR_NOT_IN_PREVIEW) return;
        if (node.getComponent(ReferenceCollector)) return false;
        return node.name.startsWith("$");
    }

    //#endregion


}
