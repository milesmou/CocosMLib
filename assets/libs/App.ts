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
        {
            mm.safeSize = { top: 0, bottom: 0, left: 0, right: 0 };
            let safeArea = cc.sys.getSafeAreaRect();
            mm.safeSize.top = cc.winSize.height - safeArea.height - safeArea.y;
            mm.safeSize.bottom = safeArea.y;
            mm.safeSize.left = safeArea.x;
            mm.safeSize.right = cc.winSize.width - safeArea.width - safeArea.x;
        }
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
