import { Button, Camera, Component, EventHandler, Layers, Node, Prefab, Scene, ScrollView, Toggle, UITransform, Vec3, Widget, instantiate, misc, sp, v2 } from "cc";
import { Utils } from "./Utils";

export class CCUtils {


    /** 创建一个UI节点 */
    public static createUINode(name: string) {
        let node = new Node(name);
        node.layer = Layers.Enum.UI_2D;
        node.addComponent(UITransform);
        return node;
    }


    /** 从一级子节点获取指定组件 */
    public static getComponentInChildren<T extends Component>(node: Node, type: new (...args: any[]) => T): T {
        for (let i = 0; i < node.children.length; i++) {
            let child = node.children[i];
            let comp = child.getComponent(type);
            if (comp) return comp;
        }
        return null;
    }

    /*
     * 从父节点获取指定组件 
     * @param [includeCurNode=false] 是否包含当前节点上的组件
     */
    public static getComponentInParent<T extends Component>(node: Node, type: new (...args: any[]) => T, includeCurNode = false): T {
        let n = node;
        if (!n.parent) {
            throw new Error("父节点不存在");
        }
        if (!includeCurNode) n = n.parent;
        while (n) {
            if (n instanceof Scene) break;
            let comp = n.getComponent(type);
            if (comp) return comp;
            n = n.parent;
        }
        return null;
    }

    /*
    * 从父节点获取指定组件 
    * @param [includeCurNode=false] 是否包含当前节点上的组件
    */
    public static getComponentsInParent<T extends Component>(node: Node, type: new (...args: any[]) => T, includeCurNode = false): T[] {
        let arr: T[] = [];
        let n = node;
        if (!n.parent) {
            throw new Error("父节点不存在");
        }
        if (!includeCurNode) n = n.parent;
        while (n) {
            if (n instanceof Scene) break;
            let comp = n.getComponent(type);
            if (comp) arr.push(comp);
            n = n.parent;
        }
        return arr;
    }

    /** 通过路径获取指定组件(路径不包含根节点) */
    public static getComponentAtPath<T extends Component>(node: Node, path: string, type: new (...args: any[]) => T): T {
        path = Utils.trim(path.trim(), "/");
        let arr = path.split("/");
        let n = node;
        if (arr.length > 0) {
            for (const name of arr) {
                n = n.getChildByName(name);
                if (!n?.isValid) return null;
            }
        }
        return n.getComponent(type);
    }

    /** 通过路径获取指定节点(路径不包含根节点) */
    public static getNodeAtPath(node: Node, path: string) {
        path = Utils.trim(path.trim(), "/");
        let arr = path.split("/");
        let n = node;
        if (arr.length > 0) {
            for (const name of arr) {
                n = n.getChildByName(name);
                if (!n?.isValid) return null;
            }
        }
        return n;
    }

    /** 将node1当前的位置转化为node2本地坐标下的位置(UI节点) */
    public static uiNodeCurPosToUINodePos(node1: Node, node2: Node,) {
        return this.uiNodePosToUINodePos(node1.parent, node2, node1.position);
    }

    /** 将node1本地坐标系的位置转化为node2本地坐标下的位置(UI节点) */
    public static uiNodePosToUINodePos(node1: Node, node2: Node, vec: Vec3) {
        let screenPos = node1.getComponent(UITransform).convertToWorldSpaceAR(vec);
        return node2.getComponent(UITransform).convertToNodeSpaceAR(screenPos);
    }

    /** 屏幕位置转节点本地坐标下的位置(UI节点) */
    public static screenPosToUINodePos(screenPos: Vec3, node: Node) {
        return node.getComponent(UITransform).convertToNodeSpaceAR(screenPos);
    }

    /** 获取非UI摄像机下的节点在屏幕中的坐标(屏幕中心为原点) */
    public static getNodeScreenPosCenter(node: Node, camera: Camera) {
        // let pos = node.convertToWorldSpaceAR(v2(0, 0));
        // let cameraPos = camera.node.convertToWorldSpaceAR(v2(0, 0));
        // pos.subSelf(cameraPos).mulSelf(camera.zoomRatio);
        // return pos;
    }

    /** 获取非UI摄像机下的节点在屏幕中的坐标(屏幕左下角为原点) */
    public static getNodeScreenPos(node: Node, camera: Camera) {
        // let pos = this.getNodeScreenPosCenter(node, camera);
        // let size = view.getVisibleSize();
        // pos.x += size.width / 2;
        // pos.y += size.height / 2;
        // return pos;
    }


    public static addEventToComp(comp: Button | Toggle | ScrollView, target: Node, component: string, handler: string) {
        let evtHandler = new EventHandler();
        evtHandler.target = target;
        evtHandler.component = component;
        evtHandler.handler = handler;
        if (comp instanceof Button) {
            (comp as Button).clickEvents.push(evtHandler);
        } else if (comp instanceof Toggle) {
            (comp as Toggle).checkEvents.push(evtHandler);
        } else {
            (comp as ScrollView).scrollEvents.push(evtHandler);
        }
    }

    /** 滚动到指定的Item */
    public static scrollToItem(scrollView: ScrollView, itemIndex: number, timeInSecond = 0) {
        let targetItem = scrollView.content.children[itemIndex];
        if (targetItem) {
            //获取item左上角坐标
            let box = targetItem.getComponent(UITransform).getBoundingBox();
            let leftTop = v2(box.x, box.yMax);
            //计算距离content左上角的距离
            let contentTrans = scrollView.content.getComponent(UITransform);
            let x = contentTrans.width * contentTrans.anchorX + leftTop.x;
            let y = contentTrans.height * contentTrans.anchorY - leftTop.y;
            scrollView.scrollToOffset(v2(x, y), timeInSecond);
        }
    }

    /** Scrollview左右翻页  turnType -1:上一页 1:下一页*/
    public static scrollViewTurnPage(scrollView: ScrollView, turnType: -1 | 1, dur = 0.15) {
        let trans = scrollView.getComponent(UITransform);
        let currentOffset = scrollView.getScrollOffset();
        let maxOffset = scrollView.getMaxScrollOffset();
        let x = 0;
        if (turnType == -1) {
            x = misc.clampf(currentOffset.x + trans.width, - maxOffset.x, 0);
        } else {
            x = misc.clampf(currentOffset.x - trans.width, - maxOffset.x, 0);
        }
        scrollView.scrollToOffset(v2(-x, currentOffset.y), dur);
    }

    public static getNodePath(node: Node) {
        let arr: string[] = [];
        let n = node;
        while (n) {
            if (n instanceof Scene) break;
            arr.push(n.name);
            n = n.parent;
        }
        return arr.reverse().join("/");
    }

    public static uiNodeMatchParent(node: Node) {
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

    public static loadList<T>(content: Node, listData: T[], action?: (data: T, item: Node, index: number) => void,
        args?: { item?: Prefab, frameTimeMS?: number, comp?: Component }) {

        return new Promise<void>((resolve, reject) => {
            let { item, frameTimeMS, comp } = args || {};
            frameTimeMS = frameTimeMS === undefined ? 2 : frameTimeMS;

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

            comp = comp || this.getComponentInParent(content, Component);

            let gen = this.listGenerator(content, listData, action, item);

            let execute = () => {
                let startMS = Date.now();

                for (let iter = gen.next(); ; iter = gen.next()) {

                    if (!comp?.isValid) break;//组件销毁后停止加载

                    if (iter == null || iter.done) {
                        resolve();
                        return;
                    } else {
                        iter.value;
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

    private static *listGenerator<T>(content: Node, listData: T[], action?: (data: T, item: Node, index: number) => void,
        item: Prefab = null) {
        let instNode = (index: number) => {
            if (!content?.isValid) return;
            let child: Node;
            if (content.children.length > index) {
                child = content.children[index];
            }
            else {
                child = item ? instantiate(item) : instantiate(content.children[0]);
                child.parent = content;
            }

            child.active = true;
            action && action(listData[index], child, index);
        }

        for (let i = 0; i < listData.length; i++) {
            yield instNode(i);
        }
    }

    /** 针对节点下只有一个子节点 并需要动态切换 */
    public static loadSingleNode(parent: Node, prefab: Prefab) {
        if (parent.children.length > 0) {
            if (parent.children[0].name == prefab.name) return;
            else {
                parent.destroyAllChildren();
            }
        }
        let node = instantiate(prefab);
        node.parent = parent;
        node.active = true;
    }

    /** 缓动一个number */
    public static tweenNumber(start: number, end: number, duration: number, onUpdate: (v: number) => void, easing?: string) {
        // let o = { v: start };
        // tween(o).to(duration, { v: end }, {
        //     progress: function (s, e, t, c) {
        //         onUpdate && onUpdate(c);
        //     },
        //     easing: easing
        // }).start();
    }

    /** 设置spine各动画之间的融合时间 */
    public static setSpineCommonMix(spine: sp.Skeleton, dur: number) {
        if (!spine) return;
        let anims: any[] = spine["_skeleton"]["data"]["animations"];
        if (anims?.length) {
            for (let i = 0; i < anims.length - 1; i++) {
                for (let j = i + 1; j < anims.length; j++) {
                    spine.setMix(anims[i].name, anims[j].name, dur);
                    spine.setMix(anims[j].name, anims[i].name, dur);
                }
            }
        }
    }

}
