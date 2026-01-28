import { Component, Node, _decorator } from "cc";

const { ccclass, property } = _decorator;

/** 
 * 为节点添加标记 方便获取节点
 * 1. 非多节点模式下，每个Tag只能绑定一个节点，重复绑定会覆盖之前的节点 onLoad时添加 onDestroy时移除
 * 2. 多节点模式下，每个Tag可以绑定多个节点，每次获取时返回最后添加的节点 onEnable时添加 onDisable时移除
 */
@ccclass("NodeTag")
export default class NodeTag extends Component {
    @property({
        displayName: "Tag"
    })
    private m_Tag = "";

    @property({
        editorOnly: true,
        tooltip: "属性仅用于编辑器写备注，运行时无效",
        displayName: "Desc"
    })
    private m_Desc = "";

    @property({
        tooltip: "扩展参数",
        displayName: "Extram"
    })
    private m_extram = "";
    @property({
        tooltip: "是否为多节点模式，多个节点共用一个Tag，每次获取时返回最后添加的节点 (非多节点模式:onLoad时添加 onDestroy时移除 多节点模式:onEnable时添加 onDisable时移除)",
        displayName: "MutilMode"
    })
    private m_mutilMode = false;

    protected onLoad(): void {
        if (this.m_mutilMode) return;
        NodeTag.add(this.m_Tag, this.node, this.m_extram, false);
    }

    protected onEnable(): void {
        if (!this.m_mutilMode) return;
        NodeTag.add(this.m_Tag, this.node, this.m_extram, true);
    }

    protected onDisable(): void {
        if (!this.m_mutilMode) return;
        NodeTag.delete(this.m_Tag);
    }

    protected onDestroy(): void {
        if (this.m_mutilMode) return;
        NodeTag.delete(this.m_Tag);
    }

    private static nodeMap: Map<string, Node> = new Map();
    private static extramMap: Map<string, string> = new Map();
    private static mutilNodeMap: Map<string, Node[]> = new Map();
    private static mutilExtramMap: Map<string, string[]> = new Map();


    /** 添加Tag */
    public static add(tag: string, node: Node, extram?: string, mutilMode = false) {
        if (!tag) {
            mLogger.error(`Tag不能为空`, node);
            return;
        }
        if (!mutilMode) {
            if (NodeTag.nodeMap.has(tag)) {
                mLogger.warn(`${tag} Tag重复`, "已存在的节点", NodeTag.nodeMap.get(tag));
                return;
            }
            NodeTag.nodeMap.set(tag, node);
            if (extram) NodeTag.extramMap.set(tag, extram);
        } else {
            if (!NodeTag.mutilNodeMap.has(tag)) {
                NodeTag.mutilNodeMap.set(tag, []);
                NodeTag.mutilExtramMap.set(tag, []);
            }
            NodeTag.mutilNodeMap.get(tag)?.push(node);
            if (extram) NodeTag.mutilExtramMap.get(tag)?.push(extram);
        }
    }

    /** 删除Tag */
    public static delete(tag: string) {
        if (NodeTag.nodeMap.has(tag)) {
            NodeTag.nodeMap.delete(tag);
            NodeTag.extramMap.delete(tag);
        } else {
            NodeTag.mutilNodeMap.get(tag)?.pop();
            NodeTag.mutilExtramMap.get(tag)?.pop();
        }
    }

    /** 是否存在该Tag */
    public static has(tag: string) {
        return NodeTag.nodeMap.has(tag);
    }

    /** 获取节点 */
    public static get(tag: string) {
        if (NodeTag.nodeMap.has(tag)) {
            return NodeTag.nodeMap.get(tag);
        } else if (NodeTag.mutilNodeMap.has(tag)) {
            return NodeTag.mutilNodeMap.get(tag)?.last;
        }
    }

    /** 获取扩展参数 */
    public static getExtra(tag: string) {
        if (NodeTag.extramMap.has(tag)) {
            return NodeTag.extramMap.get(tag);
        } else if (NodeTag.mutilExtramMap.has(tag)) {
            return NodeTag.mutilExtramMap.get(tag)?.last;
        }
    }
}