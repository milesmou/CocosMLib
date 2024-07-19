"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneTool = void 0;
const cc_1 = require("cc");
class SceneTool {
    /** 获取选中的节点 */
    static getNodeByUUid(uuid) {
        let node = cc_1.director.getScene();
        return this.findNodeInChildren(node, v => v.uuid == uuid);
    }
    static findNodeInChildren(node, predicate) {
        if (node.children.length == 0)
            return null;
        for (const n of node.children) {
            if (predicate(n))
                return n;
            else {
                let nn = this.findNodeInChildren(n, predicate);
                if (nn)
                    return nn;
            }
        }
    }
}
exports.SceneTool = SceneTool;
