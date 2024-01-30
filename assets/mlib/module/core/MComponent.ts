import { _decorator, Component, js } from "cc";
import { MLogger } from "../logger/MLogger";
import { PropertyBase } from "../ui/property/PropertyBase";
import { AssetComponent } from "./AssetComponent";
import { TimerComponent } from "./TimerComponent";

const { ccclass, property } = _decorator;

@ccclass
export class MComponent<T extends PropertyBase = PropertyBase> extends Component {

    protected timer: TimerComponent;
    protected asset: AssetComponent;
    protected property: T;

    protected __preload(): void {
        let propertyClassName = js.getClassName(this) + "Property";
        let propertyClass = js.getClassByName(propertyClassName);
        if (propertyClass) {
            this.property = new propertyClass(this.node) as T;
        }
    }

    /** 从任意父节点上获取组件 */
    protected getComponentInParent<T extends Component>(classConstructor: new (...args: any[]) => T, includeSlef = true) {
        let node = includeSlef ? this.node : this.node.parent;
        while (node?.isValid) {
            let comp = node.getComponent(classConstructor);
            if (comp) return comp;
            node = node.parent;
        }
        return undefined;
    }

    /** 调用此节点componentName组件的methodName方法 */
    public sendMessage(componentName: string, methodName: string, ...args: any[]) {
        let comp = this.getComponent(componentName);
        if (comp) {
            let method: Function = comp[methodName];
            if (method && typeof method === "function") {
                method.apply(comp, args);
            } else {
                MLogger.error(`节点上组件未找到指定方法 ${methodName}`);
            }
        } else {
            MLogger.error(`节点上未找到指定组件 ${componentName}`);
        }
    }

    /** 调用任意父节点componentName组件的methodName方法 */
    public sendMessageUpwards(componentName: string, methodName: string, ...args: any[]) {
        let compConstructor: any = js.getClassByName(componentName);
        let comp = this.getComponentInParent(compConstructor, false);
        if (comp) {
            let method: Function = comp[methodName];
            if (method && typeof method === "function") {
                method.apply(comp, args);
            } else {
                MLogger.error(`父节点上组件未找到指定方法 ${methodName} NodeName=${comp.node.name}`);
            }
        } else {
            MLogger.error(`父节点上未找到指定组件 ${componentName}`);
        }
    }
}
