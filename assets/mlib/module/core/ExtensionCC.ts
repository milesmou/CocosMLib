//扩展Cocos中的一些类 添加新的方法

import { Component } from "cc";
import { Widget } from "cc";
//@ts-ignore
import { Node } from "cc";
import { EDITOR_NOT_IN_PREVIEW } from "cc/env";

if (!EDITOR_NOT_IN_PREVIEW) {//非编辑器模式才生效

    Object.defineProperty(Node.prototype, "zIndex", {
        get() {
            return this._zIndex || 0;
        },
        set(val: number) {
            let zIndex = this._zIndex || 0;
            if (val == zIndex) return;
            this._zIndex = val;
            let self: Node = this;
            if (self.parent?.isValid) {
                self.parent.childrenSiblingIndexDirty = true;
            }
        }
    })

    Node.prototype.ensureComponent = function <T extends Component>(classConstructor: new (...args: any[]) => T): T {
        let self: Node = this;
        let comp = self.getComponent(classConstructor);
        if (!comp?.isValid) {
            comp = self.addComponent(classConstructor);
        }
        return comp;
    }

    Node.prototype.matchParent = function (immediately?: boolean) {
        let self: Node = this;
        let widget = self.ensureComponent(Widget);
        widget.isAlignTop = true;
        widget.top = 0;
        widget.isAlignBottom = true;
        widget.bottom = 0;
        widget.isAlignLeft = true;
        widget.left = 0;
        widget.isAlignRight = true;
        widget.right = 0;
        if (immediately) widget.updateAlignment();
    }

    Node.prototype.getPath = function () {
        let arr: string[] = [];
        let n: Node = this;
        while (n) {
            arr.push(n.name);
            n = n.parent;
        }
        return arr.reverse().join("/");
    }


    Node.prototype.regularSiblingIndex = function () {
        let self: Node = this;
        if (!self.childrenSiblingIndexDirty) return;
        (this._children as Node[]).sort((a, b) => a.zIndex - b.zIndex);
        this._updateSiblingIndex();
        self.childrenSiblingIndexDirty = false;
    }

    Component.prototype.getComponentInParent = function <T extends Component>(classConstructor: new (...args: any[]) => T, includeSlef = true) {
        let self: Component = this;
        let node = includeSlef ? self.node : self.node.parent;
        while (node?.isValid) {
            let comp = node.getComponent(classConstructor);
            if (comp) return comp;
            node = node.parent;
        }
        return app.getComponent(classConstructor);
    }

    Component.prototype.ensureComponent = function <T extends Component>(classConstructor: new (...args: any[]) => T) {
        let self: Component = this;
        return self.node.ensureComponent(classConstructor);
    }
}
