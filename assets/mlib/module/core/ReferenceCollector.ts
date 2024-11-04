import { _decorator, Component, js, Node } from "cc";
import { EDITOR_NOT_IN_PREVIEW } from "cc/env";

const { ccclass, property, executeInEditMode, executionOrder, disallowMultiple } = _decorator;

@ccclass("CollectorNodeData")
class CollectorNodeData {
    @property({ readonly: true })
    public key = "";
    @property({ type: Node, readonly: true })
    public node: Node = null;
}

@ccclass("ReferenceCollector")
@disallowMultiple
@executeInEditMode(true)
@executionOrder(-100)
export class ReferenceCollector extends Component {

    @property
    private _refresh = false;
    @property({ displayName: "复制属性" })
    private get refresh() { return this._refresh; }
    private set refresh(val: boolean) {
        if (EDITOR_NOT_IN_PREVIEW) {
            this.initNodeList();
            this.genCode();
        }
        this._refresh = false;
    }

    @property({ type: CollectorNodeData, readonly: true })
    private _nodes: CollectorNodeData[] = [];
    @property({ type: CollectorNodeData, tooltip: "自动引用节点(名字以$开头的)", readonly: true })
    private get nodes() { return this._nodes; }
    private set nodes(val: CollectorNodeData[]) { this._nodes = val; }

    private _nodeMap: Map<string, Node> = new Map();

    protected onLoad(): void {
        if (EDITOR_NOT_IN_PREVIEW) {//处理编辑器逻辑
            this.initNodeList();
        } else {//处理运行时逻辑
            this.initNodeMap();
        }
    }

    private initNodeMap() {
        this._nodeMap.clear();
        for (const collectorNodeData of this.nodes) {
            let key = collectorNodeData.key.trim();
            if (!this._nodeMap.has(key)) {
                this._nodeMap.set(key, collectorNodeData.node);
            } else {
                console.error("[MLogger Error]", this.node.name, "引用的节点名字重复 Key=" + key);
            }
        }
    }

    public getNode(key: string) {
        return this._nodeMap.get(key);
    }

    public get(key: string, type: typeof Node): Node;
    public get<T extends Component>(key: string, type: new (...args: any[]) => T): T;
    public get(key: string, type: any): any {
        let node = this._nodeMap.get(key);
        if (node) {
            if (type as any === Node) {
                return node;
            } else {
                return node.getComponent(type);
            }
        }
        return undefined;
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
        let checkArr = [];
        checkArr.push(root);
        while (checkArr.length > 0) {
            let v = checkArr.shift();
            arr.push(...v.children.filter(v => this.isNodeValid(v)));
            checkArr.push(...v.children.filter(v => this.isNodeChildrenValid(v)));
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
        if (node.name.startsWith(this._tag)) return true;
        return false;
    }

    /** 生成引用节点的获取代码 并复制到剪切板 */
    private genCode() {
        if (!EDITOR_NOT_IN_PREVIEW) return;
        let text = "";
        //生成get属性 
        this.nodes.forEach(data => {
            let key = data.key;
            if (text) text += "\n";
            let name = key[0].toLowerCase() + key.substring(1);
            let line = `private get ${name}() { return this.rc.get("${key}", ${this.getPropertyType(data.node)}); }`;
            text += line;
        });
        Editor.Clipboard.write("text", text);
        console.log("已复制到剪切板");
    }

    /** 获取属性类型名字 */
    private getPropertyType(node: Node) {
        if (!EDITOR_NOT_IN_PREVIEW) return;
        
        //自定义脚本
        let comp = node.getComponent('MComponent');
        if (comp) return js.getClassName(comp);
        //自定义组件
        if (node.getComponent("Switch")) return "Switch";
        if (node.getComponent("MSlider")) return "MSlider";
        if (node.getComponent("MToggle")) return "MToggle";
        if (node.getComponent("MButton")) return "MButton";
        //UI组件
        if (node.getComponent("cc.Toggle")) return "Toggle";
        if (node.getComponent("cc.Slider")) return "Slider";
        if (node.getComponent("cc.Button")) return "Button";
        if (node.getComponent("cc.ProgressBar")) return "ProgressBar";
        if (node.getComponent("cc.ScrollView")) return "ScrollView";
        if (node.getComponent("cc.PageView")) return "PageView";
        if (node.getComponent("cc.Animation")) return "Animation";
        //渲染组件
        if (node.getComponent("cc.Sprite")) return "Sprite";
        if (node.getComponent("cc.Label")) return "Label";
        if (node.getComponent("cc.RichText")) return "RichText";
        if (node.getComponent("cc.ParticleSystem2D")) return "ParticleSystem2D";
        if (node.getComponent("sp.Skeleton")) return "sp.Skeleton";

        return "Node";
    }
    //#endregion
}
