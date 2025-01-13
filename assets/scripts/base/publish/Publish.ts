import { sys } from "cc";
import { Channel } from "../../../mlib/sdk/Channel";
import { Dev } from "./channel/Dev";
declare global {
    /** 是否开发渠道 */
    const isDev: boolean;
}

/** 项目发布相关的配置和处理 */
export class Publish {
    public static getChannelInstance(): Channel {

	let bDev = mGameSetting.channelId == EChannel.Dev;
        //@ts-ignore
        globalThis.isDev = bDev;
        let chan: Channel;
        if (sys.platform == sys.Platform.ANDROID) {
            
        }
        chan = chan || new Dev();
        chan.initSDK();
        chan.reportEvent(mReportEvent.InitSDK)
        return chan;
    }
}