import { _decorator, Component, Node } from "cc";

const { ccclass, property } = _decorator;

@ccclass("ReferenceCollectorData")
export class ReferenceCollectorData {
    public key: string;

    public node: Node;
}

@ccclass("ReferenceCollector")
export class ReferenceCollector extends Component {

    @property({ type: Node })
    private _data: ReferenceCollectorData[] = [];
    @property({ type: Node })
    private get data() { return this._data; }

    private _map: Map<string, Node> = new Map();

    protected __preload(): void {
        this._map.clear();
        for (const referenceCollectorData of this.data) {
            if (!this._map.has(referenceCollectorData.key)) {
                this._map.set(referenceCollectorData.key, referenceCollectorData.node);
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

    

}
