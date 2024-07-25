import { Component, Node, Scene } from "cc";

export class CCUtils {

    /*
     * 从父节点获取指定组件 
     * @param [includeCurNode=false] 是否包含当前节点上的组件
     */
    static getComponentInParent(node: Node, typeName: string, includeCurNode = false): Component {
        let n = node;
        if (!n.parent) {
            throw new Error("父节点不存在");
        }
        if (!includeCurNode) n = n.parent;
        while (n) {
            if (n instanceof Scene) break;
            let comp = n.getComponent(typeName);
            if (comp) return comp;
            n = n.parent;
        }
        return null;
    }

    /*
    * 从父节点获取指定组件 
    * @param [includeCurNode=false] 是否包含当前节点上的组件
    */
    static getComponentsInParent(node: Node, typeName: string, includeCurNode = false): Component[] {
        let arr: Component[] = [];
        let n = node;
        if (!n.parent) {
            throw new Error("父节点不存在");
        }
        if (!includeCurNode) n = n.parent;
        while (n) {
            if (n instanceof Scene) break;
            let comp = n.getComponent(typeName);
            if (comp) arr.push(comp);
            n = n.parent;
        }
        return arr;
    }





}
