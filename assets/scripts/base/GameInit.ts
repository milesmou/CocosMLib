import { App } from "../../mlib/App";
import { L10nMgr } from "../../mlib/module/l10n/L10nMgr";
import { GameDataPost } from "./GameDataPost";
import { GameRedDot } from "./GameRedDot";

/** 进入主界面前 初始化游戏内容 */
export class GameInit {
    public static async init() {
        GameDataPost.Inst.initGameData();
        GameRedDot.Inst.init();
        await L10nMgr.init();
        App.chan.initIAP();

    }
}