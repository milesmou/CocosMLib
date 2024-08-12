//扩展Cocos中的一些类 添加新的方法

import { Component, UITransform, Widget } from "cc";
//@ts-ignore
import { Node } from "cc";
import { EDITOR_NOT_IN_PREVIEW } from "cc/env";

if (!EDITOR_NOT_IN_PREVIEW) {//非编辑器模式才生效

    Object.defineProperty(Node.prototype, "transform", {
        get: function () {
            let self: Node = this;
            let transform = self['_transform'];
            if (!transform) {
                transform = self.getComponent(UITransform);
                self['_transform'] = transform;
            }
            return transform;
        }
    })

    Object.defineProperty(Node.prototype, "zIndex", {
        get() {
            return this._zIndex || 0;
        },
        set(val: number) {
            let zIndex = this._zIndex;//这不给默认值 避免赋予值等于默认值时不生效
            if (val == zIndex) return;
            this._zIndex = val;
            let self: Node = this;
            if (self.parent?.isValid) {
                self.parent.childrenSiblingIndexDirty = true;
            }
        }
    })

    Object.defineProperty(Node.prototype, "worldPositionX", {
        get() {
            let self: Node = this;
            return self.worldPosition.x;
        },
        set(val: number) {
            let self: Node = this;
            let worldPosition = self.worldPosition;
            self.setWorldPosition(val, worldPosition.y, worldPosition.z);
        }
    })

    Object.defineProperty(Node.prototype, "worldPositionY", {
        get() {
            let self: Node = this;
            return self.worldPosition.y;
        },
        set(val: number) {
            let self: Node = this;
            let worldPosition = self.worldPosition;
            self.setWorldPosition(worldPosition.x, val, worldPosition.z);
        }
    })

    Object.defineProperty(Node.prototype, "worldPositionZ", {
        get() {
            let self: Node = this;
            return self.worldPosition.z;
        },
        set(val: number) {
            let self: Node = this;
            let worldPosition = self.worldPosition;
            self.setWorldPosition(worldPosition.x, worldPosition.y, val);
        }
    })

    Object.defineProperty(Node.prototype, "positionX", {
        get() {
            let self: Node = this;
            return self.position.x;
        },
        set(val: number) {
            let self: Node = this;
            let position = self.position;
            self.setPosition(val, position.y, position.z);
        }
    })

    Object.defineProperty(Node.prototype, "positionY", {
        get() {
            let self: Node = this;
            return self.position.y;
        },
        set(val: number) {
            let self: Node = this;
            let position = self.position;
            self.setPosition(position.x, val, position.z);
        }
    })

    Object.defineProperty(Node.prototype, "positionZ", {
        get() {
            let self: Node = this;
            return self.position.z;
        },
        set(val: number) {
            let self: Node = this;
            let position = self.position;
            self.setPosition(position.x, position.y, val);
        }
    })

    Node.prototype.getComponentInParent = function <T extends Component>(ctorOrClassName: (new (...args: any[]) => T) | string, includeSlef = true) {
        let self: Node = this;
        let node = includeSlef ? self : self.parent;
        while (node?.isValid) {
            let comp = node.getComponent(ctorOrClassName as any);
            if (comp) return comp;
            node = node.parent;
        }
        return null;
    }

    Node.prototype.ensureComponent = function <T extends Component>(ctorOrClassName: (new (...args: any[]) => T) | string): T {
        let self: Node = this;
        let comp = self.getComponent(ctorOrClassName as any);
        if (!comp?.isValid) {
            comp = self.addComponent(ctorOrClassName as any);
        }
        return comp as T;
    }

    Node.prototype.matchParent = function (immediately?: boolean) {
        let self: Node = this;
        if (!self.getComponent(UITransform)) {
            console.warn("仅2D节点可以使用此方法");
            return;
        }
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

    Component.prototype.getComponentInParent = function <T extends Component>(ctorOrClassName: (new (...args: any[]) => T) | string, includeSlef = true) {
        let self: Component = this;
        let node = includeSlef ? self.node : self.node.parent;
        while (node?.isValid) {
            let comp = node.getComponent(ctorOrClassName as any);
            if (comp) return comp;
            node = node.parent;
        }
        return null;
    }

    Component.prototype.ensureComponent = function <T extends Component>(ctorOrClassName: (new (...args: any[]) => T) | string) {
        let self: Component = this;
        return self.node.ensureComponent(ctorOrClassName);
    }
}

//CC中使用DOM的Node、Animation时进行提示
declare global {
    /**
    * @deprecated TMD这是DOM的Node,不要使用它
    */
    interface Node { }

    /**
     * @deprecated TMD这是DOM的Animation,不要使用它
     */
    interface Animation { }
}

//扩展CC中的一些类
declare module "cc" {
    interface Component {
        /** 
         * 从任意父节点上获取组件
         * @param includeSlef 是否包含自身所在节点 默认为true
         */
        getComponentInParent<T extends Component>(ctorOrClassName: (new (...args: any[]) => T) | string, includeSlef?: boolean);

        /** 确保组件存在 不存在则添加 */
        ensureComponent<T extends Component>(ctorOrClassName: (new (...args: any[]) => T) | string): T;

    }

    interface Node {
        /** 
         * 从任意父节点上获取组件
         * @param includeSlef 是否包含自身所在节点 默认为true
         */
        getComponentInParent<T extends Component>(ctorOrClassName: (new (...args: any[]) => T) | string, includeSlef?: boolean);

        /** 确保组件存在 不存在则添加 */
        ensureComponent<T extends Component>(ctorOrClassName: (new (...args: any[]) => T) | string): T;

        /** 
         * 节点尺寸匹配父节点大小(通过widget组件来完成)
         * @param immediately 是否立即生效，只有当你需要在当前帧结束前生效才传true，默认为false
         */
        matchParent(immediately?: boolean): void;

        /** 获取节点在场景树的路径 */
        getPath(): void;

        /** 根据zIndex的值更新子节点的SiblingIndex */
        regularSiblingIndex(): void;

        /** 2d节点的UITransform组件 */
        get transform(): UITransform;

        /** 模拟2.x中zIndex,刷新层级需要调用父节点的regularSiblingIndex方法 */
        zIndex: number;

        /** 在子节点zIndex值改变时修改父节点此属性为true，表示需要更新子节点的SiblingIndex */
        childrenSiblingIndexDirty: boolean;

        /** 世界坐标X */
        worldPositionX: number;

        /** 世界坐标Y */
        worldPositionY: number;

        /** 世界坐标Z */
        worldPositionZ: number;

        /** 本地坐标X */
        positionX: number;

        /** 本地坐标Y */
        positionY: number;

        /** 本地坐标Z */
        positionZ: number;

    }
}