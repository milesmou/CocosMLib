import { Component, Node, ScrollView, Sprite, SpriteFrame, Vec3 } from "cc";
import { AssetMgr } from "../manager/AssetMgr";

export class CCUtils {

    /**
     * 加载图片到Sprite
     * @param sprite 目标Sprite组件
     * @param location 路径（本地路径不带扩展名 远程路径带扩展名）
     */
    static async loadSprite(sprite: Sprite, location: string) {

        if (!sprite?.isValid) {
            console.error("Sprite无效 " + location);
            return;
        }

        if (location.startsWith("http")) {
            let spFrame = await AssetMgr.loadAsset<SpriteFrame>(location);
            sprite.spriteFrame = spFrame;
        } else {

        }

        // let p = new Promise<void>((resolve, reject) => {
        //     let onComplete = (err: any, res: SpriteFrame | ImageAsset) => {
        //         if (err) {
        //             console.error(err);
        //             reject();
        //         } else {
        //             if (res instanceof ImageAsset) {
        //                 let spriteFrame = new SpriteFrame();
        //                 spriteFrame.texture = res._texture;
        //                 sprite.spriteFrame = spriteFrame;
        //             } else {
        //                 sprite.spriteFrame = res;
        //             }
        //             resolve();
        //         }
        //     };
        //     if (url.startsWith("http") || url.startsWith("/")) {
        //         assetManager.loadRemote(url, { ext: url.substring(url.lastIndexOf(".")) }, onComplete);
        //     } else {
        //         resources.load(url + "/spriteFrame", SpriteFrame, onComplete);
        //     }
        // })
        // return p;
    }

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
