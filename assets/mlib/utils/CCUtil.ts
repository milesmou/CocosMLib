import { Animation, Button, Component, EventHandler, Layers, Node, Prefab, ScrollView, Slider, Toggle, ToggleContainer, TweenEasing, UITransform, Vec3, misc, sp, tween, v2, v3, view } from "cc";

export class CCUtils {

    /** 创建一个UI节点 */
    public static createUINode(name: string, parent?: Node) {
        let node = new Node(name);
        node.layer = parent ? parent.layer : Layers.Enum.UI_2D;
        if (parent) node.parent = parent;
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

    /** 
     * 将node1本地坐标系的位置转化为node2本地坐标下的位置
     */
    public static uiNodePosToUINodePos(node1: Node, node2: Node, pos?: Vec3) {
        if (!pos) pos = v3(0, 0);
        let screenPos = node1.transform.convertToWorldSpaceAR(pos);
        return node2.transform.convertToNodeSpaceAR(screenPos);
    }

    /** 将node本地坐标系的位置转化为屏幕坐标 */
    public static uiNodePosToScreenPos(node: Node, pos?: Vec3) {
        if (!pos) pos = v3(0, 0);
        return node.transform.convertToWorldSpaceAR(pos);
    }

    /** 将node本地坐标系的位置转化为屏幕中心为原点的坐标 */
    public static uiNodePosToScreenCenterPos(node: Node, pos?: Vec3) {
        let screenPos = this.uiNodePosToScreenPos(node, pos);
        let size = view.getVisibleSize();
        screenPos.x -= size.width / 2;
        screenPos.y -= size.height / 2;
        return screenPos;
    }


    /** 屏幕位置转节点本地坐标下的位置(UI节点) */
    public static screenPosToUINodePos(screenPos: Vec3, node: Node) {
        return node.transform.convertToNodeSpaceAR(screenPos);
    }


    public static addEventToComp(comp: Button | Toggle | ToggleContainer | ScrollView | Slider, target: Node, component: string, handler: string) {
        let evtHandler = new EventHandler();
        evtHandler.target = target;
        evtHandler.component = component;
        evtHandler.handler = handler;
        if (comp instanceof Button) {
            (comp as Button).clickEvents.push(evtHandler);
        } else if (comp instanceof Toggle || comp instanceof ToggleContainer) {
            (comp as Toggle).checkEvents.push(evtHandler);
        } else if (comp instanceof Slider) {
            (comp as Slider).slideEvents.push(evtHandler);
        } else {
            (comp as ScrollView).scrollEvents.push(evtHandler);
        }
    }

    /** 滚动到指定的Item */
    public static scrollToItem(scrollView: ScrollView, itemIndex: number, timeInSecond = 0) {
        itemIndex = misc.clampf(itemIndex, 0, scrollView.content.children.length - 1);
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


    /** 记录每次加载列表的开始时间，便于重复加载时停止上一次操作 */
    private static loadListTimeMS: Map<string, number> = new Map();

    /**
     * 分帧加载一个列表
     * @param content 列表父节点
     * @param listData 列表数据
     * @param action 数据的处理方法
     * @param args item:用于克隆的节点或预制体 frameTimeMS:每帧耗时 默认2ms appendStartIndex:从索引多少开始追加列表数据(>0时要求之前的item节点已存在)
     */
    public static loadList<T>(content: Node, listData: T[], action?: (data: T, item: Node, index: number) => void,
        args?: { item?: Node | Prefab, frameTimeMS?: number, appendStartIndex?: number }) {

        //记录加载开始时间 避免重复加载
        let timeMS = Date.now();
        this.loadListTimeMS.set(content.uuid, timeMS);

        return new Promise<void>((resolve, reject) => {
            let { item, frameTimeMS, appendStartIndex } = args || {};
            frameTimeMS = frameTimeMS === undefined ? 2 : frameTimeMS;
            appendStartIndex = appendStartIndex || 0;

            if (!content || listData == null) {
                console.error("Content或listData不正确");
                return;
            }

            if (!item && content.children.length == 0) {
                console.error("当content无子节点时 必须传入预制体");
                return;
            }

            if (appendStartIndex > content.children.length) {
                console.error("appendStartIndex>0时要求索引<appendStartIndex的item节点已存在");
                return;
            }

            if (content.children.length > appendStartIndex + listData.length) //隐藏多余的Item
            {
                for (let i = appendStartIndex + listData.length; i < content.children.length; i++) {
                    content.children[i].active = false;
                }
            }

            let comp = content.getComponent(Component);

            let gen = this.listGenerator(content, listData, action, item, appendStartIndex);

            let execute = () => {
                let startMS = Date.now();

                for (let iter = gen.next(); ; iter = gen.next()) {

                    if (!comp?.isValid) break;//组件销毁后停止加载

                    if (timeMS != this.loadListTimeMS.get(content.uuid)) break;//重复加载 本次操作需要终止

                    if (iter == null || iter.done) {
                        this.loadListTimeMS.delete(content.uuid);
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
        item: Node | Prefab = null, appendStartIndex = 0) {
        let instNode = (index: number) => {
            if (!content?.isValid) return;
            let itemIndex = appendStartIndex + index;
            let child: Node;
            if (content.children.length > itemIndex) {
                child = content.children[itemIndex];
            }
            else {
                child = item ? instantiate(item) as Node : instantiate(content.children[0]);
                child.parent = content;
            }

            child.active = true;
            action && action(listData[index], child, itemIndex);
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
    public static tweenNumber(start: number, end: number, duration: number, onUpdate: (v: number) => void, easing?: TweenEasing) {
        let o = { v: start };
        tween(o).to(duration, { v: end }, {
            onUpdate: (target?: object, ratio?: number) => {
                onUpdate && onUpdate(o.v);
            },
            easing: easing
        }).start();
    }

    /** 设置Spine同时显示多个皮肤 */
    public static setSpineSkins(spine: sp.Skeleton, skinNames: string[]) {
        if (!spine?.isValid) return;
        let skinCache: Map<string, sp.spine.Skin> = spine['_skinCache'];
        if (!skinCache) {//缓存动态创建的皮肤，否则Native平台在回收皮肤时会崩溃
            skinCache = new Map();
            spine['_skinCache'] = skinCache;
        }
        let skinCacheKey = skinNames.sort().join(",");
        let combineSkin = skinCache.get(skinCacheKey);
        const skeleton = spine._skeleton;
        if (!combineSkin) {
            const runtimeData = spine.skeletonData.getRuntimeData();
            combineSkin = new sp.spine.Skin(skinCacheKey);
            for (const skinName of skinNames) {
                let skin = runtimeData.findSkin(skinName);
                if (skin) {
                    combineSkin.addSkin(skin);
                } else {
                    console.warn("皮肤未找到:" + skinName);
                }
            }
            skinCache.set(skinCacheKey, combineSkin);
        }
        if (skeleton.skin.name != combineSkin.name) {
            skeleton.setSkin(combineSkin);
            skeleton.setSlotsToSetupPose();
        }
    }

    /** 设置spine各动画之间的融合时间 */
    public static setSpineCommonMix(spine: sp.Skeleton, dur: number) {
        if (!spine?.isValid) return;
        let anims = spine.skeletonData.getRuntimeData().animations;
        if (anims?.length > 0) {
            for (let i = 0; i < anims.length - 1; i++) {
                for (let j = i + 1; j < anims.length; j++) {
                    spine.setMix(anims[i].name, anims[j].name, dur);
                    spine.setMix(anims[j].name, anims[i].name, dur);
                }
            }
        }
    }

    /** 设置spine骨骼的显示隐藏(会影响该骨骼以及它所有的子骨骼) */
    public static setSpineBoneVisible(spine: sp.Skeleton, boneName: string, visible: boolean) {
        if (!spine?.isValid) return;
        let bone = spine.findBone(boneName);
        if (bone) {
            bone.active = visible;
            this.setBoneChildsVisible(bone, visible);
        }
    }

    private static setBoneChildsVisible(bone: sp.spine.Bone, visible: boolean) {
        if (!bone || bone.children.length == 0) return;
        for (const child of bone.children) {
            child.active = visible;
            if (child.children.length > 0) this.setBoneChildsVisible(child, visible);
        }
    }

    /**
     * 重置animation到初始状态
     */
    public static resetAnimation(anim: Animation) {
        if (!anim || !anim.isValid) return;
        if (anim.clips.length == 0) return;
        anim.clips.forEach(clip => {
            const state = anim.getState(clip.name);
            state.time = 0;
            state.sample();
        });
    }

}
