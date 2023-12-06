import { Component, Node, _decorator } from "cc";
import { MLogger } from "../../logger/MLogger";

const { ccclass, property } = _decorator;

/** 为节点添加标记 方便获取节点 */
@ccclass
export default class NodeTag extends Component {
    @property
    tag = "";

    protected onLoad(): void {
        if (!this.tag) {
            MLogger.error(`Tag不能为空`, this.node);
            return;
        }
        if (NodeTag.map.has(this.tag)) {
            MLogger.error(`${this.tag} Tag重复`, this.node);
            return;
        }
        NodeTag.map.set(this.tag, this.node);
    }

    protected onDestroy(): void {
        if (this.tag) {
            NodeTag.map.delete(this.tag);
        }
    }

    private static map: Map<string, Node> = new Map();

    public static getNodeByTag(tag: string) {
        return NodeTag.map.get(tag);
    }

}
