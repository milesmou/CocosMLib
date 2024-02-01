import { _decorator, Component, js } from "cc";
import { MLogger } from "../logger/MLogger";
import NodeTag from "./NodeTag";
import { PropertyBase } from "../ui/property/PropertyBase";
import { AssetLoaderComponent } from "./AssetLoaderComponent";
import { TimerComponent } from "./TimerComponent";
import { ReferenceCollector } from "./ReferenceCollector";

const { ccclass, property, requireComponent } = _decorator;

@ccclass
@requireComponent(ReferenceCollector)
export class MComponent extends Component {

    private get appNode() { return NodeTag.getNodeByTag("App"); }

    private _timer: TimerComponent;
    protected get timer() { return this._timer; }
    private _assetLoader: AssetLoaderComponent;
    protected get assetLoader() { return this._assetLoader; }
    private _rc: ReferenceCollector;
    protected get rc() { return this._rc; }

    protected __preload(): void {
        this._rc = this.getComponent(ReferenceCollector);
    }

    /** 从任意父节点上获取组件 */
    protected getComponentInParent<T extends Component>(classConstructor: new (...args: any[]) => T, includeSlef = true) {
        let node = includeSlef ? this.node : this.node.parent;
        while (node?.isValid) {
            let comp = node.getComponent(classConstructor);
            if (comp) return comp;
            node = node.parent;
        }

        return this.appNode.getComponent(classConstructor);
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