import { Component, Game, Node, _decorator, game } from "cc";

const { ccclass, property } = _decorator;

/** 为节点添加标记 方便获取节点 */
@ccclass
export default class NodeTag extends Component {
    @property({
        displayName: "Tag"
    })
    private m_Tag = "";

    protected onLoad(): void {
        if (!this.m_Tag) {
            mLogger.error(`Tag不能为空`, this.node);
            return;
        }
        NodeTag.add(this.m_Tag, this.node);
    }

    protected onDestroy(): void {
        NodeTag.delete(this.m_Tag);
    }

    public static map: Map<string, Node> = new Map();

    public static add(tag: string, node: Node) {
        if (NodeTag.map.has(tag)) {
            mLogger.warn(`${tag} Tag重复`, node);
            return;
        }
        NodeTag.map.set(tag, node);
    }

    public static delete(tag: string) {
        NodeTag.map.delete(tag);
    }

    public static has(tag: string) {
        return NodeTag.map.has(tag);
    }

    public static get(tag: string) {
        return NodeTag.map.get(tag);
    }

}

game.on(Game.EVENT_RESTART, () => { NodeTag.map.clear(); }, this);
