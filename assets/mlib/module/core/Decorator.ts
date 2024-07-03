import { Node } from "cc";
import { Component, director, Director, js } from "cc";
import { EDITOR } from "cc/env";

export function persistNode<T extends Component>(target: { Inst: T, new(): T }) {
    director.once(Director.EVENT_AFTER_SCENE_LAUNCH, () => {
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
}

export function view(name: string) {

}


export function entity(viewName: string) {

}