import { Component, director, Director, js, Node } from "cc";
import { EDITOR_NOT_IN_PREVIEW } from "cc/env";


/** 将组件添加到常驻节点上 */
export function persistNode<T extends Component>(target: { Inst?: T, new(): T }) {
    if (EDITOR_NOT_IN_PREVIEW) return;
    director.on(Director.EVENT_AFTER_SCENE_LAUNCH, () => {
        let scene = director.getScene();
        if (!scene) return;
        if (typeof app === "undefined") return;
        let nodeName = `[${js.getClassName(target)}]`;
        let node = scene.getChildByName(nodeName);
        if (!node) {
            node = new Node(nodeName);
            scene.addChild(node);
            node.addComponent(target);
            director.addPersistRootNode(node);
        }
    });
}

export function view(name: string) {

}


export function entity(viewName: string) {

}