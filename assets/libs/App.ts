import UILoading from "./ui/UILoading";
import { UIManager } from "./ui/UIManager";
import { EventMgr, GameEvent } from "./utils/EventMgr";

const { ccclass, property } = cc._decorator;

/** 应用程序启动入口 */
@ccclass
export default class App extends cc.Component {

    @property(cc.Prefab)
    loadPrefab: cc.Prefab = null;

    loading: UILoading = null;

    onLoad() {
        EventMgr.on(GameEvent.EnterGameScene, this.enterGameScene, this);
        let node = cc.instantiate(this.loadPrefab);
        node.parent = this.node;
        this.loading = node.getComponent(UILoading);
    }

    onDestroy() {
        EventMgr.off(GameEvent.EnterGameScene, this.enterGameScene, this);
    }

    start() {
        UIManager.Inst.init().then(() => {
            this.loading.load();
        });
    }

    enterGameScene() {
        this.loading.node.destroy();
    }

}
