import UILoading from "./ui/UILoading";

const { ccclass, property } = cc._decorator;

/** 应用程序启动入口 */
@ccclass
export default class App extends cc.Component {

    @property(cc.Prefab)
    loadPrefab: cc.Prefab = null;

    loading: UILoading = null;

    onLoad() {
        let node = cc.instantiate(this.loadPrefab);
        node.parent = this.node;
        this.loading = node.getComponent(UILoading);
    }

    start() {
        this.loading.load().then(() => {
            this.loading.node.destroy();
            console.log("加载完成");
        });
    }

}
