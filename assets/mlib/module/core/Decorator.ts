import { Component, director, Director, game, Game, js, Node } from "cc";
import { EDITOR } from "cc/env";


/** 将组件添加到常驻节点上 */
export function persistNode<T extends Component>(target: { Inst?: T, new(): T }) {
    director.on(Director.EVENT_AFTER_SCENE_LAUNCH, () => {
        if (EDITOR) return;
        let nodeName = `[${js.getClassName(target)}]`;
        let scene = director.getScene();
        if (!scene) return;
        let node = scene.getChildByName(nodeName);
        if (!node) {
            node = new Node(nodeName);
            scene.addChild(node);
            node.addComponent(target);
            director.addPersistRootNode(node);
        }
    });
    game.restart()
}

export function view(name: string) {

}


export function entity(viewName: string) {

}