import { Component, Node, _decorator } from "cc";
import { CCUtils } from "../utils/CCUtil";

const { ccclass } = _decorator;

@ccclass('AutoBindProperty')
export class AutoBindProperty extends Component {

    private autoBindCompCache: { [key: string]: Component } = {}
    private autoBindNodeCache: { [path: string]: Node } = {}

    getAutoBindComp<T extends Component>(path: string, type: { new(): T }) {
        let key = `${type.name}+${path}`;
        if (this.autoBindCompCache[key]?.isValid) return this.autoBindCompCache[key];

        if (this.autoBindNodeCache[path]?.isValid) {
            return this.autoBindNodeCache[path].getComponent(type);
        } else {
            let comp = CCUtils.getComponentAtPath(this.node, path, type);
            if (comp?.isValid) {
                this.autoBindCompCache[key] = comp;
                this.autoBindNodeCache[path] = comp.node;
            }
            console.error(`[${this.node.name}]节点指定路径未找到组件 ${key}`);

            return comp;
        }
    }

    /** 调用当前节点上其它组件的方法 */
    sendMessage(methodName: string, ...args: any[]) {
        methodName = methodName.trim();
        for (const comp of this.node.components) {
            if (comp[methodName] && typeof comp[methodName] === "function") {
                (comp[methodName] as Function).apply(comp, args);
                return;
            }
        }
        console.warn(`节点上未找到指定方法 ${methodName} ${CCUtils.GetNodePath(this.node)}`);
    }

    /** 调用祖先节点上组件的方法 */
    sendMessageUpwards(methodName: string, ...args: any[]) {
        let node = this.node.parent;
        while (node?.isValid) {
            for (const comp of node.components) {
                if (comp[methodName] && typeof comp[methodName] === "function") {
                    (comp[methodName] as Function).apply(comp, args);
                    return;
                }
            }
            node = node.parent;
        }
        console.warn(`祖先节点上未找到指定方法 ${methodName} ${CCUtils.GetNodePath(this.node)}`);
    }
}