//扩展Cocos中的一些类 添加新的方法

import { Asset, Component, EventTouch, math, misc, ScrollView, Touch, Tween, TweenAction, TweenSystem, UITransform, Widget } from "cc";
//@ts-ignore
import { Node } from "cc";
//@ts-ignore
import { Animation } from "cc";
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

    Object.defineProperty(Node.prototype, "wpX", {
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

    Object.defineProperty(Node.prototype, "wpY", {
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

    Object.defineProperty(Node.prototype, "wpZ", {
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

    Object.defineProperty(Node.prototype, "lpX", {
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

    Object.defineProperty(Node.prototype, "lpY", {
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

    Object.defineProperty(Node.prototype, "lpZ", {
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

    Node.prototype.getChildsByName = function (name: string) {
        let self: Node = this;
        let result: Node[] = [];
        for (const child of self.children) {
            if (child.name == name) result.push(child);
        }
        return result;
    }

    Node.prototype.findNode = function (name: string) {
        let self: Node = this;
        let list: Node[] = self.children;
        let list2: Node[];

        while (list.length > 0) {
            list2 = [];
            for (const child of list) {
                if (child.name == name) {
                    return child;
                } else if (child.children.length > 0) {
                    list2.push(...child.children);
                }
            }
            list = list2;
        }
        return undefined;
    }

    Node.prototype.findNodes = function (name: string) {
        let self: Node = this;
        let result: Node[] = [];
        let list: Node[] = self.children;
        let list2: Node[];

        while (list.length > 0) {
            list2 = [];
            for (const child of list) {
                if (child.name == name) {
                    result.push(child);
                }
                if (child.children.length > 0) {
                    list2.push(...child.children);
                }
            }
            list = list2;
        }
        return result;
    }


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
        return this.node.getComponentInParent(ctorOrClassName as any, includeSlef);
    }

    Component.prototype.ensureComponent = function <T extends Component>(ctorOrClassName: (new (...args: any[]) => T) | string) {
        return this.node.ensureComponent(ctorOrClassName as any);
    }

    ScrollView.prototype.stop = function () {
        let self: ScrollView = this;
        const event = new EventTouch([], true, Node.EventType.TOUCH_CANCEL);
        event.touch = new Touch(0, 0);
        self.node.dispatchEvent(event);
    }

    Animation.prototype.setSpeed = function (speed: number, name?: string) {
        let self: Animation = this;
        if (name) {
            let state = self.getState(name);
            if (state) {
                state.speed = speed;
            } else {
                console.warn(`组件onLoad未执行 或 动画不存在:${name}`);
            }
        } else {
            for (const clip of self.clips) {
                let state = self.getState(clip.name);
                if (state) {
                    state.speed = speed;
                }
            }
        }
    }

    Animation.prototype.setTime = function (name?: string, time = 0) {
        let self: Animation = this;
        name = name || self.defaultClip?.name;
        if (!name) {
            console.warn(`未指定动画且默认动画不存在`);
            return;
        }
        let state = self.getState(name);
        if (state) {
            time = math.clamp(time, 0, state.duration);
            state.setTime(time);
            state.sample();
        } else {
            console.warn(`组件onLoad未执行 或 动画不存在:${name}`);
        }

    }

    Tween.setTimeScaleByTag = function (tag: number, timeScale: number) {
        const hashTargets: Map<unknown, { actions: any[] }> = TweenSystem.instance.ActionManager['_hashTargets'];
        hashTargets.forEach((element) => {
            for (let i = element.actions.length - 1; i >= 0; --i) {
                const action = element.actions[i];
                if (action && action.getTag() === tag) {
                    action.setSpeed(timeScale);
                }
            }
        });
    }

    Object.defineProperty(Tween.prototype, "finalAction", {
        get: function () {
            return this['_finalAction'];
        }
    })

    Tween.prototype.finish = function () {
        let finalAction: TweenAction<any> = this['_finalAction'];
        if (finalAction) {
            if (finalAction['_repeatForever']) return;
            this.setTime(finalAction.getDuration());
        }
    }

    Tween.prototype.setTime = function (time: number) {
        let finalAction: TweenAction<any> = this['_finalAction'];
        if (finalAction) {
            let dur = finalAction.getDuration();
            time = misc.clampf(time, 0, dur);
            finalAction['_elapsed'] = time;
        }
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

    /** 游戏当前运行环境 */
    type GameEnv = "develop" | "trial" | "release";

    /** CC中的资源类型 */
    type AssetProto<T extends Asset = Asset> = new (...args: any[]) => T;

    /** CC中的组件类型 */
    type CompProto<T extends Component = Component> = new (...args: any[]) => T;
}

//扩展CC中的一些类
declare module 'cc' {

    interface Node {
        /**
         * 通过名称获取节点的子节点
         */
        getChildsByName(name: string): Node[];
        /**
         * 通过名字在当前节点下任意层级查找节点(广度优先查找)
         */
        findNode(name: string): Node;
        /**
         * 通过名字在当前节点下任意层级查找节点(广度优先查找)
         */
        findNodes(name: string): Node[];
        /** 
         * 从任意父节点上获取组件
         * @param includeSlef 是否包含自身所在节点 默认为true
         */
        getComponentInParent<T extends Component>(ctor: (new (...args: any[]) => T), includeSlef?: boolean);
        /** 
         * 从任意父节点上获取组件
         * @param includeSlef 是否包含自身所在节点 默认为true
         */
        getComponentInParent<T extends Component>(className: string, includeSlef?: boolean): T;
        /** 确保组件存在 不存在则添加 */
        ensureComponent<T extends Component>(ctor: new (...args: any[]) => T): T;
        /** 确保组件存在 不存在则添加 */
        ensureComponent<T extends Component>(className: string): T;
        /** 
         * 节点尺寸匹配父节点大小(通过widget组件来完成)
         * @param immediately 是否立即生效，只有当你需要在当前帧结束前生效才传true，默认为false
         */
        matchParent(immediately?: boolean): void;
        /** 获取节点在场景树的路径 */
        getPath(): string;
        /** 根据zIndex的值更新子节点的SiblingIndex */
        regularSiblingIndex(): void;
        /** 2d节点的UITransform组件 */
        get transform(): UITransform;
        /** 模拟2.x中zIndex,刷新层级需要调用父节点的regularSiblingIndex方法 */
        zIndex: number;
        /** 在子节点zIndex值改变时修改父节点此属性为true，表示需要更新子节点的SiblingIndex */
        childrenSiblingIndexDirty: boolean;
        /** 世界坐标X */
        wpX: number;
        /** 世界坐标Y */
        wpY: number;
        /** 世界坐标Z */
        wpZ: number;
        /** 本地坐标X */
        lpX: number;
        /** 本地坐标Y */
        lpY: number;
        /** 本地坐标Z */
        lpZ: number;
    }

    interface Component {
        /** 
         * 从任意父节点上获取组件
         * @param includeSlef 是否包含自身所在节点 默认为true
         */
        getComponentInParent<T extends Component>(ctor: (new (...args: any[]) => T) | string, includeSlef?: boolean): T;
        /** 
         * 从任意父节点上获取组件
         * @param includeSlef 是否包含自身所在节点 默认为true
         */
        getComponentInParent<T extends Component>(className: string, includeSlef?: boolean): T;
        /**
         * 确保组件存在 不存在则添加
         */
        ensureComponent<T extends Component>(ctor: new (...args: any[]) => T): T;
        /**
         *  确保组件存在 不存在则添加
         */
        ensureComponent<T extends Component>(className: string): T;
    }

    interface ScrollView {
        /** 停止滚动 (会派发一个'touch-cancel'事件给ScrollView) */
        stop(): void;
    }

    interface Animation {
        /**
         * 修改动画播放的速度 (注意调用时机,应当在组件onLoad完成后调用)
         * @param speed 速度缩放
         * @param name 动画名字，若未指定则修改所有动画的速度
         */
        setSpeed(speed: number, name?: string): void;
        /**
         * 设置动画处于指定时间 (注意调用时机,应当在组件onLoad完成后调用)
         * @param name 动画名字，若未指定则表示默认动画
         * @param time 动画所处时间，默认为0
         */
        setTime(name?: string, time?: number): void;
    }

    namespace Tween {
        /**
         * 修改指定tag的所有缓动的速度缩放(已执行start方法的缓动才会生效)
         */
        function setTimeScaleByTag(tag: number, timeScale: number): void;
    }

    interface Tween<T> {
        /**
         * 缓动开始后的动作对象
         */
        get finalAction(): TweenAction<T>;

        /** 
         * 立即完成缓动(已经start并且非永久重复的才有效)
         */
        finish(): void;

        /**
         * 立即将缓动跳到指定时间(已经start的才有效)
         * @param time [0,duration]
         */
        setTime(time: number): void;
    }

}