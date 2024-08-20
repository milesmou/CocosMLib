import { sys } from "cc";
import { Channel } from "../../../mlib/sdk/Channel";


/** 项目发布相关的配置和处理 */
export class Publish {
    public static getChannelInstance(): Channel {
        let chan: Channel;
        if (sys.platform == sys.Platform.ANDROID) {

        }
        chan = chan || new Channel();
        chan.initSDK();
        chan.reportEvent(mReportEvent.InitSDK)
        return chan;
    }
}