import { _decorator, Component, director, Enum, game } from 'cc';
import { EDITOR_NOT_IN_PREVIEW } from 'cc/env';
import { EChannel } from '../scripts/base/publish/EChannel';
import { ELanguage } from './module/l10n/ELanguage';
import { ELoggerLevel } from './module/logger/ELoggerLevel';
import { MLogger } from './module/logger/MLogger';
const { ccclass, property, integer, executeInEditMode } = _decorator;


export const EGameConfigType = Enum({
    Local: 0,
    Remote: 1
})

const LogLevel = Enum(ELoggerLevel);

@ccclass('GameSetting')
@executeInEditMode
export class GameSetting extends Component {
    public static Inst: GameSetting;

    @property private _gameName: string = "";
    @property({
        displayName: "游戏名",
        tooltip: "名字会用来拼接CND地址，上报事件等"
    })
    public get gameName() { return this._gameName; }
    private set gameName(val: string) { this._gameName = val; }

    @property private _languageId = ELanguage.SimplifiedChinese;
    @property({
        displayName: "语言",
        type: ELanguage
    })
    public get languageId() { return this._languageId; }
    private set languageId(val: number) { this._languageId = val; }

    @property private _gameConfigType = EGameConfigType.Local;
    @property({
        displayName: "配置",
        type: EGameConfigType,
        tooltip: "配置类型 Local:使用本地配置 Remote:使用远程配置"
    })
    public get gameConfigType() { return this._gameConfigType; }
    private set gameConfigType(val: number) { this._gameConfigType = val; }

    @property({
        displayName: "渠道",
        type: EChannel
    })
    private m_ChannelId = EChannel.Dev;

    @property private _version = "1.0.0";
    @property({
        displayName: "版本",
        tooltip: "整包使用3位版本号(x.x.x),补丁包使用4位版本号(x.x.x.x)\n与远程资源相关的都只会使用前3位版本号"
    })
    public get version() { return this._version; }
    private set version(val: string) { this._version = val.trim(); }

    @property({
        displayName: "CDN",
        tooltip: "项目的CDN地址"
    })
    private m_CdnUrl = "";

    @property private _hotupdate = true;
    @property({
        displayName: "热更",
        tooltip: "开启热更需要再resources中放入本地project.manifest清单文件",
    })
    public get hotupdate() { return this._hotupdate; }
    private set hotupdate(val: boolean) { this._hotupdate = val; }

    @property({
        displayName: "帧率",
        slide: true,
        range: [0, 120],
        tooltip: "帧率限制,0表示不限制帧率"
    })
    @integer
    private m_FrameRate = 0;

    @property({
        type: LogLevel,
        displayName: "日志级别"
    })
    private m_LogLevel = LogLevel.Info;

    private _channel: string;
    /**  渠道名字 */
    public get channel() { return this._channel; }
    private _mainVersion: string;
    /** 游戏的主版本号 (只有3位 X.X.X) */
    public get mainVersion() { return this._mainVersion; }
    private _gameCode: string;
    /** 游戏识别码 游戏名_渠道名 */
    public get gameCode() { return this._gameCode; }
    private _gameConfigUrl: string;
    /** 远程配置地址 */
    public get gameConfigUrl() { return this._gameConfigUrl; }
    private _remoteResUrl: string;
    /** 远程资源地址 */
    public get remoteResUrl() { return this._remoteResUrl; }


    protected onLoad(): void {
        GameSetting.Inst = this;
        this._channel = EChannel[this.m_ChannelId];
        this._mainVersion = this.getMainVersion();
        this._gameCode = this._gameName + "_" + this._channel
        this._gameConfigUrl = `${this.m_CdnUrl}/${this._gameName}/Channel/${this._channel}/${this._mainVersion}/GameConfig.txt`;
        this._remoteResUrl = `${this.m_CdnUrl}/${this._gameName}/Resources`;
        if (!EDITOR_NOT_IN_PREVIEW) {
            director.addPersistRootNode(this.node);
            if (this.m_FrameRate > 0) {
                game.frameRate = this.m_FrameRate;
            }
            MLogger.setLevel(this.m_LogLevel);
        }
    }

    /** 主版本号 取前三位 */
    private getMainVersion() {
        let versionArr = this._version.split(".");
        if (versionArr.length == 4) {
            return versionArr.slice(0, 3).join(".");
        }
        return this._version;
    }
}


