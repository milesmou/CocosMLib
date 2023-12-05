import { Node, js } from "cc";
import { CCUtils } from "../../../utils/CCUtil";
import { MLogger } from "../../logger/MLogger";

interface IMessageCache {
    target: object;
    method: Function;
}

/** 处理UI组件之间的通信 */
export class UIMessage {
    private _node: Node;

    private _messageCache: Map<string, IMessageCache> = new Map();
    private _messageUpwardCache: Map<string, IMessageCache> = new Map();
    private _messageDownwardCache: Map<string, IMessageCache> = new Map();

    constructor(node: Node) {
        this._node = node;
    }


    /** 调用此节点对象中的名为componentName组件上名为methodName的方法 */
    public send(componentName: string, methodName: string, ...args: any[]) {
        let key = componentName + "|" + methodName;
        if (this._messageCache.has(key)) {
            let cache = this._messageCache.get(key);
            cache.method.apply(cache.target, args);
        } else {
            let comp = this._node.getComponent(componentName);
            if (comp) {
                let method: Function = comp[methodName];
                if (method && typeof method === "function") {
                    this._messageCache.set(key, { target: comp, method: method });
                    method.apply(comp, args);
                } else {
                    MLogger.error(`节点上组件未找到指定方法 ${methodName} ${CCUtils.getNodePath(this._node)}`);
                }
            } else {
                MLogger.error(`节点上未找到指定组件 ${componentName} ${CCUtils.getNodePath(this._node)}`);
            }
        }
    }

    /** 调用父节点对象中的名为componentName组件上名为methodName的方法 */
    public sendUpward(componentName: string, methodName: string, ...args: any[]) {
        let key = componentName + "|" + methodName;
        if (this._messageUpwardCache.has(key)) {
            let cache = this._messageUpwardCache.get(key);
            cache.method.apply(cache.target, args);
        } else {
            let compConstructor: any = js.getClassByName(componentName);
            let comp = CCUtils.getComponentInParent(this._node, compConstructor);
            if (comp) {
                let method: Function = comp[methodName];
                if (method && typeof method === "function") {
                    this._messageUpwardCache.set(key, { target: comp, method: method });
                    method.apply(comp, args);
                } else {
                    MLogger.error(`父节点上组件未找到指定方法 ${methodName} ${CCUtils.getNodePath(this._node)}`);
                }
            } else {
                MLogger.error(`父节点上未找到指定组件 ${componentName} ${CCUtils.getNodePath(this._node)}`);
            }
        }
    }

    /** 调用子节点对象中的名为componentName组件上名为methodName的方法 */
    public sendDownward(componentName: string, methodName: string, ...args: any[]) {
        let key = componentName + "|" + methodName;
        if (this._messageDownwardCache.has(key)) {
            let cache = this._messageDownwardCache.get(key);
            cache.method.apply(cache.target, args);
        } else {
            let comp = this._node.getComponentInChildren(componentName);
            if (comp) {
                let method: Function = comp[methodName];
                if (method && typeof method === "function") {
                    this._messageDownwardCache.set(key, { target: comp, method: method });
                    method.apply(comp, args);
                } else {
                    MLogger.error(`子节点上组件未找到指定方法 ${methodName} ${CCUtils.getNodePath(this._node)}`);
                }
            } else {
                MLogger.error(`子节点上未找到指定组件 ${componentName} ${CCUtils.getNodePath(this._node)}`);
            }
        }
    }
}