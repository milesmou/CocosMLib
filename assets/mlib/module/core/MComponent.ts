import { _decorator, Component } from "cc";
import { AssetComponent } from "../asset/AssetComponent";
import { AudioComponent } from "../audio/AudioComponent";
import { TimerComponent } from "../timer/TimerComponent";
import { ReferenceCollector } from "./ReferenceCollector";

const { ccclass } = _decorator;

@ccclass("MComponent")
export class MComponent extends Component {

    private _timer: TimerComponent;
    protected get timer() {
        if (!this.node.parent) console.error("父节点不存在!");
        if (!this._timer) this._timer = this.getComponentInParent(TimerComponent) || app.timer;
        return this._timer;
    }
    private _asset: AssetComponent;
    protected get asset() {
        if (!this.node.parent) console.error("父节点不存在!");
        if (!this._asset) this._asset = this.getComponentInParent(AssetComponent) || app.asset;
        return this._asset;
    }
    private _audio: AudioComponent;
    protected get audio() {
        if (!this.node.parent) console.error("父节点不存在!");
        if (!this._audio) this._audio = this.getComponentInParent(AudioComponent) || app.audio;
        return this._audio;
    }
    private _rc: ReferenceCollector;
    protected get rc() { return this._rc || (this._rc = this.getComponent(ReferenceCollector)); }

    /** 调用自身节点上所有MComponent中的methodName方法 */
    public sendMessage(methodName: string, ...args: any[]) {
        let comps = this.getComponents(MComponent);
        for (const comp of comps) {
            let method: Function = comp[methodName];
            if (method && typeof method === "function") {
                method.apply(comp, args);
            }
        }
    }

    /** 调用自身以及父节点上所有MComponent中的methodName方法 */
    public sendMessageUpwards(methodName: string, ...args: any[]) {
        let send = (comps: MComponent[]) => {
            for (const comp of comps) {
                let method: Function = comp[methodName];
                if (method && typeof method === "function") {
                    method.apply(comp, args);
                }
            }
        }
        let n = this.node;
        while (n) {
            send(n.getComponents(MComponent));
            n = n.parent;
        }
    }

    /** 调用自身以及子节点上所有MComponent中的methodName方法 */
    public broadcastMessage(methodName: string, ...args: any[]) {
        let comps = this.getComponents(MComponent);
        comps = comps.concat(this.getComponentsInChildren(MComponent));
        for (const comp of comps) {
            let method: Function = comp[methodName];
            if (method && typeof method === "function") {
                method.apply(comp, args);
            }
        }
    }
}
