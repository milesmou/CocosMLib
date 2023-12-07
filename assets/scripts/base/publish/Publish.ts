import { Component, Enum, _decorator, game, sys } from "cc";
import { Channel } from "../../../mlib/sdk/Channel";
import { ELoggerLevel, MLogger } from "../../../mlib/module/logger/MLogger";

const { ccclass, property } = _decorator;

const LogLevel = Enum(ELoggerLevel);

/** 项目发布相关的配置和处理 */
@ccclass("Publish")
export class Publish extends Component {
    @property({
        displayName: "帧率",
        tooltip: "帧率限制"
    })
    private m_FrameRate = 0;

    @property({
        type: LogLevel,
        displayName: "日志级别"
    })
    private m_LogLevel = LogLevel.Info;

    protected onLoad(): void {
        if (this.m_FrameRate > 0) game.frameRate = this.m_FrameRate;
        MLogger.print("日志级别", LogLevel[this.m_LogLevel]);
        MLogger.setLevel(this.m_LogLevel);
    }

    public static getChannelInstance(): Channel {
        let chan: Channel;
        if (sys.platform == sys.Platform.ANDROID) {

        }
        chan = chan || new Channel();
        chan.initSDK();
        return chan;
    }
}