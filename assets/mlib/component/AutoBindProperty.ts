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
}