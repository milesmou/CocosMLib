import { Component, Enum, _decorator, game, sys } from "cc";
import { Channel } from "../../../mlib/sdk/Channel";
import { ELoggerLevel, MLogger } from "../../../mlib/module/logger/MLogger";

const { ccclass, property } = _decorator;

/** 打包渠道枚举 */
export const EChannel = Enum({
    Dev: 0,
    Trial: 1,
});

const LogLevel = Enum(ELoggerLevel);

/** 项目发布相关的配置和处理 */
@ccclass("Publish")
export class Publish extends Component {
    @property({
        displayName: "帧率",
        tooltip: "帧率限制"
    })
    private frameRate = 0;

    @property({
        type: LogLevel,
        displayName: "日志级别"
    })
    private logLevel = LogLevel.Info;

    protected onLoad(): void {
        if (this.frameRate > 0) game.frameRate = this.frameRate;
        MLogger.print("日志级别", LogLevel[this.logLevel]);
        MLogger.setLevel(this.logLevel);
    }

    public static getChannelInstance(channelId: number, gameCode: string): Channel {
        let chan: Channel;
        if (sys.platform == sys.Platform.ANDROID) {

        }
        chan = chan || new Channel();
        chan.gameCode = gameCode;
        chan.initSDK();
        return chan;
    }
}