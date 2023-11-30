import { Component, Node, _decorator, error } from "cc";
import { CCUtils } from "../../utils/CCUtil";
import { MLogger } from "../logger/MLogger";


const { ccclass } = _decorator;

/** 自动绑定字段的脚本 需配合插件和AutoBindPropertyEditor组件一起使用 */
@ccclass
export class AutoBindProperty extends Component {

    private autoBindCompCache: { [key: string]: Component } = {}
    private autoBindNodeCache: { [path: string]: Node } = {}

    getAutoBindComp<T extends Component>(path: string, type: { new(): T }): T {
        let key = `${type.name}+${path}`;
        if (this.autoBindCompCache[key]?.isValid) return this.autoBindCompCache[key] as T;

        if (this.autoBindNodeCache[path]?.isValid) {
            return this.autoBindNodeCache[path].getComponent(type);
        } else {
            let comp = CCUtils.getComponentAtPath(this.node, path, type);
            if (comp?.isValid) {
                this.autoBindCompCache[key] = comp;
                this.autoBindNodeCache[path] = comp.node;
            } else {
                error(`[${this.node.name}]节点指定路径未找到组件 ${key}`);
            }
            return comp;
        }
    }

    getAutoBindNode(path: string) {
        if (this.autoBindNodeCache[path]?.isValid) {
            return this.autoBindNodeCache[path];
        } else {
            let node = CCUtils.getNodeAtPath(this.node, path);
            if (node?.isValid) {
                this.autoBindNodeCache[path] = node;
            } else {
                error(`[${this.node.name}]节点指定路径未找到 ${path}`);
            }
            return node;
        }
    }

    /** 调用当前节点上其它组件的方法 */
    sendMessage(methodName: string, ...args: any[]) {
        methodName = methodName.trim();
        for (const comp of this.node["_components"]) {
            if (comp[methodName] && typeof comp[methodName] === "function") {
                (comp[methodName] as Function).apply(comp, args);
                return;
            }
        }
        MLogger.warn(`节点上未找到指定方法 ${methodName} ${CCUtils.getNodePath(this.node)}`);
    }

    /** 调用祖先节点上组件的方法 */
    sendMessageUpwards(methodName: string, ...args: any[]) {
        let node = this.node.parent;
        while (node?.isValid) {
            for (const comp of node["_components"]) {
                if (comp[methodName] && typeof comp[methodName] === "function") {
                    (comp[methodName] as Function).apply(comp, args);
                    return;
                }
            }
            node = node.parent;
        }
        MLogger.warn(`祖先节点上未找到指定方法 ${methodName} ${CCUtils.getNodePath(this.node)}`);
    }
}