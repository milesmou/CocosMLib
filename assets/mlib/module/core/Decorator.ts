import { Component, director, Director, game, Game, js, Node } from "cc";
import { EDITOR_NOT_IN_PREVIEW } from "cc/env";


/** 将组件添加到常驻节点上 */
export function persistNode<T extends Component>(target: { Inst?: T, new(): T }) {
    if (EDITOR_NOT_IN_PREVIEW) return;
    director.on(Director.EVENT_AFTER_SCENE_LAUNCH, () => {
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
}

/** 可以让一个静态方法在脚本加载时执行 */
export function invokeOnLoad(target: any, propertyKey: string) {
    if (EDITOR_NOT_IN_PREVIEW) return;
    let func: () => void = target[propertyKey]
    if (typeof func === "function") {
        func.call(target);
        game.on(Game.EVENT_RESTART, func, target);
    } else {
        console.error("invokeOnLoad只能添加到静态方法上");
    }
}

export function view(name: string) {

}


export function entity(viewName: string) {

}