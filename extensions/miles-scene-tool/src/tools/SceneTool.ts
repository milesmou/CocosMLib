import { Node, director } from "cc";

export class SceneTool {


    /** 获取选中的节点 */
    public static getNodeByUUid(uuid: string):Node {
        let node = director.getScene();
        return this.findNodeInChildren(node, v => v.uuid == uuid);
    }

    public static findNodeInChildren(node: Node, predicate: (child: Node) => boolean) {
        if (node.children.length == 0) return null;
        for (const n of node.children) {
            if (predicate(n)) return n;
            else {
                let nn = this.findNodeInChildren(n, predicate);
                if (nn) return nn;
            }
        }
    }
}