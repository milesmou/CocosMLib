import { UIManager } from "./ui/UIManager";
import UILoading from "./ui/UILoading";

const { ccclass, property } = cc._decorator;

/** 应用程序启动入口 */
@ccclass
export default class App extends cc.Component {

    @property(cc.Prefab)
    prefab: cc.Prefab = null;

    loading: UILoading = null;

    onLoad() {
        let node = cc.instantiate(this.prefab);
        node.parent = this.node;
        this.loading = node.getComponent(UILoading);
    }

    start() {
        this.loading.loadRes().then(() => {
            this.loading.node.destroy();
            console.log("加载完成");
        });
    }

}
