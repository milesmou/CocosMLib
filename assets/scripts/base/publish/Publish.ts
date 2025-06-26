import { sys } from "cc";
import { PREVIEW } from "cc/env";
import { Channel } from "../../../mlib/sdk/Channel";
import { Dev } from "./channel/Dev";


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

        let chan: Channel;
        if (sys.platform == sys.Platform.ANDROID) {

        }
        chan = chan || new Dev();
        chan.initSDK();
        chan.reportEvent(mReportEvent.InitSDK)
        return chan;
    }
}