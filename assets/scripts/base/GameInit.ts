import { BYTEDANCE } from "cc/env";
import { L10nMgr } from "../../mlib/module/l10n/L10nMgr";
import { MButton } from "../../mlib/module/ui/extend/MButton";
import { MToggle } from "../../mlib/module/ui/extend/MToggle";
import { UIMgr } from "../../mlib/module/ui/manager/UIMgr";
import { UIConstant } from "../gen/UIConstant";
import { GameDataPost } from "./GameDataPost";
import { GamePopUp } from "./GamePopUp";
import { GameRedDot } from "./GameRedDot";

/** 初始化游戏内容 */
export class GameInit {

    /** 加载配置前的初始化 */
    public static async initBeforeLoadConfig() {
        //加载提示信息预制件
        await UIMgr.Inst.showResident(UIConstant.UITipMsg);
    }


    /** 进入主界面前的初始化 */
    public static async initBeforeEnterHUD() {
        GameDataPost.Inst.initGameData();
        GameRedDot.Inst.init();
        await L10nMgr.init();
        await UIMgr.Inst.showResident(UIConstant.UIGuide);
        MButton.DefaultClickAudio = "audio/ButtonClick";
        MToggle.DefaultClickAudio = "audio/ButtonClick";
    }

    /** 进入主界面后的初始化 */
    public static async initAfterEnterHUD() {
        if (BYTEDANCE) {
            tt.reportScene({ sceneId: 7001 });
            let info = tt.getLaunchOptionsSync();
            if (info.scene && (info.scene as string).endsWith("3041")) {
                let feed_game_scene = info.query?.feed_game_scene;
                mLogger.info("推荐流直出场景", feed_game_scene);
            }
        }
        app.chan.initIAP();
        GamePopUp.Inst.checkPopUp();
    }
}