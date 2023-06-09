import { Component, Node, _decorator } from "cc";
import { CCUtils } from "../utils/CCUtil";

const { ccclass } = _decorator;

@ccclass('AutoBindProperty')
export class AutoBindProperty extends Component {

    private autoBindCache: { [key: string]: Node } = {}

    getAutoBindComp<T extends Component>(path: string, type: { new(): T }) {
        if (this.autoBindCache[path]?.isValid) {
            return this.autoBindCache[path].getComponent(type);
        } else {
            let comp = CCUtils.getComponentAtPath(this.node, path, type);
            if (comp?.isValid) this.autoBindCache[path] = comp.node;
            return comp;
        }
    }
}