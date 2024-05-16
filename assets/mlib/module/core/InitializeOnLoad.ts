//在引擎初始化后注册一些类的扩展方法

import { AnimationState, Component, sp } from "cc";
import { MLogger } from "../logger/MLogger";

function registerToGlobal(key: string, value: any) {
    (globalThis as any)[key] = value;
}
registerToGlobal("registerToGlobal", registerToGlobal);
registerToGlobal("logger", MLogger);


Component.prototype.getComponentInParent = function <T extends Component>(classConstructor: new (...args: any[]) => T, includeSlef = true) {
    let self: Component = this;
    let node = includeSlef ? self.node : self.node.parent;
    while (node?.isValid) {
        let comp = node.getComponent(classConstructor);
        if (comp) return comp;
        node = node.parent;
    }
    return app.getComponent(classConstructor);
}

Array.prototype.delete = function <T>(itemOrPredicate: T | ((value: T, index: number, obj: T[]) => unknown)) {
    let self: T[] = this;
    let index = -1;
    if (typeof itemOrPredicate === "function") {
        index = self.findIndex(itemOrPredicate as any);
    } else {
        index = self.indexOf(itemOrPredicate);
    }
    if (index > -1) {
        self.splice(index, 1);
        return true;
    }
    return false;
}

Object.defineProperty(Array.prototype, "first", {
    get: function () {
        let self: any[] = this;
        if (self.length == 0) return undefined;
        return self[0];
    }
})

Object.defineProperty(Array.prototype, "last", {
    get: function () {
        let self: any[] = this;
        if (self.length == 0) return undefined;
        return self[self.length - 1];
    }
})

Array.prototype.disarrange = function <T>() {
    let self: T[] = this;
    for (let i = 0; i < self.length; i++) {
        let index = Math.floor(Math.random() * self.length);
        let tmp = self[i];
        self[i] = self[index];
        self[index] = tmp;
    }
}

String.prototype.upperFirst = function () {
    let self = this;
    if (!self) return self;
    if (self.length < 2) return self.toUpperCase();
    return self[0].toUpperCase() + self.substring(1);
}

String.prototype.lowerFirst = function () {
    let self = this;
    if (!self) return self;
    if (self.length < 2) return self.toLowerCase();
    return self[0].toLowerCase() + self.substring(1);
}


