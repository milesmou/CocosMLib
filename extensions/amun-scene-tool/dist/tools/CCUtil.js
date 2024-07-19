"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCUtils = void 0;
const cc_1 = require("cc");
class CCUtils {
    /*
     * 从父节点获取指定组件
     * @param [includeCurNode=false] 是否包含当前节点上的组件
     */
    static getComponentInParent(node, typeName, includeCurNode = false) {
        let n = node;
        if (!n.parent) {
            throw new Error("父节点不存在");
        }
        if (!includeCurNode)
            n = n.parent;
        while (n) {
            if (n instanceof cc_1.Scene)
                break;
            let comp = n.getComponent(typeName);
            if (comp)
                return comp;
            n = n.parent;
        }
        return null;
    }
    /*
    * 从父节点获取指定组件
    * @param [includeCurNode=false] 是否包含当前节点上的组件
    */
    static getComponentsInParent(node, typeName, includeCurNode = false) {
        let arr = [];
        let n = node;
        if (!n.parent) {
            throw new Error("父节点不存在");
        }
        if (!includeCurNode)
            n = n.parent;
        while (n) {
            if (n instanceof cc_1.Scene)
                break;
            let comp = n.getComponent(typeName);
            if (comp)
                arr.push(comp);
            n = n.parent;
        }
        return arr;
    }
}
exports.CCUtils = CCUtils;
