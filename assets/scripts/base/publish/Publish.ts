import { sys } from "cc";
import { Channel } from "../../../mlib/sdk/Channel";
import { Dev } from "./channel/Dev";


/** 项目发布相关的配置和处理 */
export class Publish {
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