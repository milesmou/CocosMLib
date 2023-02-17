import { Component, Node, ScrollView, Sprite, SpriteFrame, Vec3 } from "cc";
import { AssetMgr } from "../manager/AssetMgr";

export class CCUtils {

    /** 从节点的一级子节点获取指定组件 */
    static getComponentInChildren<T extends Component>(node: Node, type: new (...args: any[]) => T): T {
        for (let i = 0; i < node.children.length; i++) {
            let child = node.children[i];
            let comp = child.getComponent(type);
            if (comp) return comp;
        }
        return null!;
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
}
