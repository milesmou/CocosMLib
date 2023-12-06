import { Component, Node, js } from "cc";
import { CCUtils } from "../../../utils/CCUtil";
import { MLogger } from "../../logger/MLogger";

export class PropertyBase {
    private _target: Node;

    constructor(target: Node) {
        this._target = target;
    }

    private autoBindCompCache: { [key: string]: Component } = {}
    private autoBindNodeCache: { [path: string]: Node } = {}

    getComp<T extends Component>(path: string, type: { new(): T }): T {
        let key = `${js.getClassName(type)}+${path}`;

        if (this.autoBindCompCache[key]?.isValid) {
            return this.autoBindCompCache[key] as T;
        }

        if (this.autoBindNodeCache[path]?.isValid) {
            return this.autoBindNodeCache[path].getComponent(type);
        } else {
            let comp = CCUtils.getComponentAtPath(this._target, path, type);
            if (comp?.isValid) {
                this.autoBindCompCache[key] = comp;
                this.autoBindNodeCache[path] = comp.node;
            } else {
                MLogger.error(`[${this._target.name}]节点指定路径未找到组件 ${key}`);
            }
            return comp;
        }
    }

    getNode(path: string) {
        if (this.autoBindNodeCache[path]?.isValid) {
            return this.autoBindNodeCache[path];
        } else {
            let node = CCUtils.getNodeAtPath(this._target, path);
            if (node?.isValid) {
                this.autoBindNodeCache[path] = node;
            } else {
                MLogger.error(`[${this._target.name}]节点指定路径未找到 ${path}`);
            }
            return node;
        }
    }
}