import { BYTEDANCE } from "cc/env";
import { MButton } from "../../mlib/module/ui/extend/MButton";
import { MToggle } from "../../mlib/module/ui/extend/MToggle";
import { otherConfigTool } from "../game/otherConfigTool";
import { UIConstant } from "../gen/UIConstant";
import { DungeonModel } from "../ui/dungeon/DungeonModel";
import { InstallationModel } from "../ui/guanka/InstallationModel";
import { StageModel } from "../ui/guanka/StageModel";
import { BattleShare } from "../ui/wegame/BattleShare";
import { GameDataPost } from "./GameDataPost";
import { GamePopUp } from "./GamePopUp";
import { GameRedDot } from "./GameRedDot";
import { YXTCloudData } from "./publish/sdk/YXTCloudData";

/** 初始化游戏内容 */
export class GameInit {

    /** 加载配置前的初始化 */
    public static async initBeforeLoadConfig() {
        //加载提示信息预制件
        app.tipMsg.init();
    }


    /** 进入主界面前的初始化 */
    public static async initBeforeEnterHUD() {
        GameDataPost.Inst.init();
        GameRedDot.Inst.init();
        await app.l10n.init();
        await app.ui.showResident(UIConstant.UIGuide);
        MButton.DefaultClickAudio = "audio/ButtonClick";
        MToggle.DefaultClickAudio = "audio/ButtonClick";
        StageModel.Inst.init();
        InstallationModel.Inst.init();
        BattleShare.Inst.init();
        DungeonModel.Inst.init();
        // GuildModel.Inst.init();
        //加载服务器上otherConfig配置，公告Q群啥的
        otherConfigTool.loadOtherConfigData();
    }

    /** 进入主界面后的初始化 */
    public static async initAfterEnterHUD() {
        if (BYTEDANCE) {
            let info = tt.getLaunchOptionsSync();
            let checkGameCdkey = (obj: any) => {
                if (obj.query && obj.query['game_cdkey']) {
                    let game_cdkey = obj.query['game_cdkey'];
                    mLogger.info("直播间福袋礼包", game_cdkey);
                    YXTCloudData.verfiyDyGiftCode(game_cdkey);
                }
            };
            tt.onShow(checkGameCdkey);
            if (info.scene && (info.scene as string).endsWith("3041")) {//推流场景
                let feed_game_scene = info.query?.feed_game_scene;
                let feed_game_channel = info.query?.feed_game_channel;
                let feed_game_extra = info.query?.feed_game_extra;
                mLogger.info("推荐流直出场景", feed_game_scene, feed_game_channel, feed_game_extra);
                let delay = 0;
                if (feed_game_channel == 1) {//复访
                    if (feed_game_extra != "tili") delay = 1;
                } else {//获客
                    delay = 3;
                }
                app.timer.scheduleOnceM(() => { tt.reportScene({ sceneId: 7001 }); }, this, delay);
            } else {
                checkGameCdkey(info);
            }

        }
        app.chan.initIAP();
        //KIN进入主界面先阻挡操作，直到开始执行进游弹后，才关闭，后面的阻挡由进游弹来接手处理
        mLogger.debug("gameInit" + "---block开");
        app.ui.blockTime = 9999;
        GamePopUp.Inst.checkPopUp();
    }
}