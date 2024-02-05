import { _decorator, Component, js } from "cc";
import { AssetComponent } from "../asset/AssetComponent";
import { MLogger } from "../logger/MLogger";
import NodeTag from "./NodeTag";
import { ReferenceCollector } from "./ReferenceCollector";
import { TimerComponent } from "./TimerComponent";

const { ccclass, property, requireComponent } = _decorator;

@ccclass
export class MComponent extends Component {

    private get appNode() { return NodeTag.getNodeByTag("App"); }

    private _timer: TimerComponent;
    protected get timer() { return this._timer; }
    private _asset: AssetComponent;
    protected get asset() { return this._asset; }
    private _rc: ReferenceCollector;
    protected get rc() { return this._rc; }

    protected __preload(): void {
        this._timer = this.getComponentInParent(TimerComponent);
        this._asset = this.getComponentInParent(AssetComponent);
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
