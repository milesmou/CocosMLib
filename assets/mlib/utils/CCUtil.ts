import { Component, instantiate, Node, Prefab, ScrollView, Vec3, Widget } from "cc";

export class CCUtils {

    /** 从一级子节点获取指定组件 */
    static getComponentInChildren<T extends Component>(node: Node, type: new (...args: any[]) => T): T {
        for (let i = 0; i < node.children.length; i++) {
            let child = node.children[i];
            let comp = child.getComponent(type);
            if (comp) return comp;
        }
        return null;
    }

    /** 从自身或者父节点获取指定组件 */
    static getComponentInParent<T extends Component>(node: Node, type: new (...args: any[]) => T): T {
        let n = node;
        while (n) {
            let comp = n.getComponent(type);
            if (comp) return comp;
            n = n.parent;
        }
        return null;
    }

    /** 从自身或者父节点获取指定组件 */
    static getComponentsInParent<T extends Component>(node: Node, type: new (...args: any[]) => T): T[] {
        let arr: T[] = [];
        let n = node;
        while (n) {
            let comp = n.getComponent(type);
            if (comp) arr.push(comp);
            n = n.parent;
        }
        return arr;
    }

    /** 将node1本地坐标系的位置转化为node2本地坐标下的位置 */
    static NodePosToNodeAxisPos(node1: Node, node2: Node, vec?: Vec3) {
        // if (!vec) {
        //     vec = v3(0, 0);
        // }
        // let worldPos = node1.convertToWorldSpaceAR(vec);
        // return node2.convertToNodeSpaceAR(worldPos);
    }

    /** Scrollview左右翻页  turnType -1:上一页 1:下一页*/
    static ScrollViewTurnPage(scrollView: ScrollView, turnType: -1 | 1, dur = 0.15) {
        // let currentOffset = scrollView.getScrollOffset();
        // let maxOffset = scrollView.getMaxScrollOffset();
        // let x = 0;
        // if (turnType == -1) {
        //     x = misc.clampf(currentOffset.x + scrollView.node.width, - maxOffset.x, 0);
        // } else {
        //     x = misc.clampf(currentOffset.x - scrollView.node.width, - maxOffset.x, 0);
        // }
        // scrollView.scrollToOffset(v2(-x, currentOffset.y), dur);
    }

    static GetNodePath(node: Node) {
        let arr = [];
        arr.push(node.name);
        while (node.parent) {
            node = node.parent;
            arr.push(node.name);
        }
        return arr.reverse().join("/");
    }

    static uiNodeMatchParent(node: Node) {
        let widget = node.getComponent(Widget);
        if (!widget) {
            widget = node.addComponent(Widget);
        }
        widget.isAlignTop = true;
        widget.top = 0;
        widget.isAlignBottom = true;
        widget.bottom = 0;
        widget.isAlignLeft = true;
        widget.left = 0;
        widget.isAlignRight = true;
        widget.right = 0;
    }

    static loadList<T>(content: Node, listData: T[], action?: (T, Node, number) => void,
        item: Prefab = null, frameTimeMS = 4) {

        return new Promise<void>((resolve, reject) => {
            if (!content || listData == null) return;

            if (!item && content.children.length == 0) {
                reject("当content无子节点时 必须传入预制体");
                return;
            }

            if (content.children.length > listData.length) //隐藏多余的Item
            {
                for (let i = listData.length; i < content.children.length; i++) {
                    content.children[i].active = false;
                }
            }

            let comp = content.getComponent(Component);

            let gen = this.listGenerator(content, listData, action);

            let execute = () => {
                let startMS = Date.now();

                for (let iter = gen.next(); ; iter = gen.next()) {

                    if (iter == null || iter.done) {
                        resolve();
                        return;
                    }

                    if (Date.now() - startMS > frameTimeMS) {
                        comp.scheduleOnce(() => {
                            execute();
                        });
                        return;
                    }

                }

            }
            execute();
        });
    }

    private static *listGenerator<T>(content: Node, listData: T[], action?: (T, Node, number) => void,
        item: Prefab = null) {
        let instNode = (index: number) => {
            if (!content?.isValid) return;
            let child: Node;
            if (content.children.length > index) {
                child = content[index];
            }
            else {
                child = item ? instantiate(item) : instantiate(content.children[0]);
            }

            child.active = true;
            action && action(listData[index], child, index);
        }

        for (let i = 0; i < listData.length; i++) {
            yield instNode(i);
        }
    }
}
