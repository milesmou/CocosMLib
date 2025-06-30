import { sys } from "cc";
import { PREVIEW } from "cc/env";
import { Channel } from "../../../mlib/sdk/Channel";
import { AndroidTest } from "./channel/AndroidTest";
import { Dev } from "./channel/Dev";
import { DY_YXT } from "./channel/DY_YXT";
import { IOS_ZQY } from "./channel/IOS_ZQY";
import { KS_ZQY } from "./channel/KS_ZQY";
import { WX_ZQY } from "./channel/WX_ZQY";
import { ZFB_ZQY } from "./channel/ZFB_ZQY";
import { EChannel } from "./EChannel";

declare global {
    /** 是否掌趣游SDK支持的渠道 */
    const isZQYSDK: boolean;
}

/** 项目发布相关的配置和处理 */
export class Publish {

    public static getGameEnv(): GameEnv {
        if (PREVIEW) return "develop";
        else if (isWechat) return wxTools.env;
        else if (isDouYin) return dyTools.env;
        else if (isKuaiShou) return ksTools.env;
        else if (isZFB) return zfbTools.env;
        return "release";
    }

    public static getChannelInstance(): Channel {

        //@ts-ignore
        globalThis.isZQYSDK = isWechat || isDouYin || isZFB || isKuaiShou;

        let chan: Channel;
        if (sys.platform == sys.Platform.ANDROID) {
            chan = new AndroidTest();
        } else if (sys.platform == sys.Platform.IOS) {
            chan = new IOS_ZQY();
        } else if (mGameSetting.channelId == EChannel.WX_ZQY && isWechat) {
            chan = new WX_ZQY();
        } else if (mGameSetting.channelId == EChannel.DY_ZQY && isDouYin) {
            chan = new DY_YXT();
        } else if (mGameSetting.channelId == EChannel.ZFB_ZQY && isZFB) {
            chan = new ZFB_ZQY();
        } else if (mGameSetting.channelId == EChannel.KS_ZQY && isKuaiShou) {
            chan = new KS_ZQY();
        } else if (mGameSetting.channelId == EChannel.IOS_ZQY) {
            chan = new IOS_ZQY();
        }
        chan = chan || new Dev();

        //打点
        chan.reportEvent(mReportEvent.init_game_boot, null, "NOZQY");
        chan.reportEventDaily(mReportEvent.init_game_boot_daily, null, "NOZQY");
        //数数打点
        chan.reportEvent(mReportEvent.init_game_boot, null, "SS");
        // mLogger.debug("---------新玩家登陆流程KIN--------------" + "1打开APP");


        chan.initSDK();
        return chan;
    }


}