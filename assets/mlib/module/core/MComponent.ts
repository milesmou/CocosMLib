import { _decorator, Component, js } from "cc";
import { AssetComponent } from "../asset/AssetComponent";
import { AudioComponent } from "../audio/AudioComponent";
import { TimerComponent } from "../timer/TimerComponent";
import { ReferenceCollector } from "./ReferenceCollector";

const { ccclass, property, requireComponent } = _decorator;

@ccclass
export class MComponent extends Component {

    private _timer: TimerComponent;
    protected get timer() { return this._timer; }
    private _asset: AssetComponent;
    protected get asset() { return this._asset; }
    private _audio: AudioComponent;
    protected get audio() { return this._audio; }
    private _rc: ReferenceCollector;
    protected get rc() { return this._rc; }

    protected __preload(): void {
        this._timer = this.getComponentInParent(TimerComponent) || app.timer;
        this._asset = this.getComponentInParent(AssetComponent) || app.asset;
        this._audio = this.getComponentInParent(AudioComponent) || app.audio;
        this._rc = this.getComponent(ReferenceCollector);
    }

    public getComponentInParent<T extends Component>(classConstructor: new (...args: any[]) => T, includeSlef = true) {
        let node = includeSlef ? this.node : this.node.parent;
        while (node?.isValid) {
            let comp = node.getComponent(classConstructor);
            if (comp) return comp;
            node = node.parent;
        }
        return app.getComponent(classConstructor);
    }


    /** 调用此节点componentName组件的methodName方法 */
    public sendMessage(componentName: string, methodName: string, ...args: any[]) {
        let comp = this.getComponent(componentName);
        if (comp) {
            let method: Function = comp[methodName];
            if (method && typeof method === "function") {
                method.apply(comp, args);
            } else {
                logger.error(`节点上组件未找到指定方法 ${methodName}`);
            }
        } else {
            logger.error(`节点上未找到指定组件 ${componentName}`);
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
                logger.error(`父节点上组件未找到指定方法 ${methodName} NodeName=${comp.node.name}`);
            }
        } else {
            logger.error(`父节点上未找到指定组件 ${componentName}`);
        }
    }
}
