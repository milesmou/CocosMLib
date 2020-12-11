import { EUIName, UIManager } from "./ui/UIManager";
import { EventMgr, GameEvent } from "./utils/EventMgr";

const { ccclass, property } = cc._decorator;

/** 应用程序启动入口 */
@ccclass
export default class App extends cc.Component {

    onLoad() {
        EventMgr.on(GameEvent.EnterGameScene, this.enterGameScene, this);
    }

    start() {
        mm.safeArea = this.node.getContentSize();
        UIManager.Inst.init().then(() => {
            UIManager.Inst.showUI(EUIName.UILoading);
        });
    }

    onDestroy() {
        EventMgr.off(GameEvent.EnterGameScene, this.enterGameScene, this);
    }


    enterGameScene() {
        UIManager.Inst.hideUI(EUIName.UILoading);
    }

}
