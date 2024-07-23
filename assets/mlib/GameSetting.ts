import { _decorator, Component, director, Enum, Event, game, Node } from 'cc';
import { EDITOR_NOT_IN_PREVIEW, PREVIEW } from 'cc/env';
import { EChannel } from '../scripts/base/publish/EChannel';
import { ELanguage } from './module/l10n/ELanguage';
import { ELoggerLevel } from './module/logger/ELoggerLevel';
const { ccclass, property, integer, executeInEditMode } = _decorator;

const EGameConfigType = Enum({
    Local: 0,
    Remote: 1
})

const LogLevel = Enum({
    Auto: -1,
    ...ELoggerLevel
});

@ccclass('GameSetting')
@executeInEditMode
class GameSetting extends Component {
    /** 配置文件类型 */
    public readonly ConfigType = EGameConfigType;

    @property private _gameName: string = "";
    @property({
        displayName: "游戏名",
        tooltip: "名字会用来拼接CND地址，上报事件等"
    })
    public get gameName() { return this._gameName; }
    private set gameName(val: string) { this._gameName = val; this.saveGameSetting(); }

    @property private _channelId = EChannel.Dev;
    @property({
        displayName: "渠道",
        type: EChannel
    })
    public get channelId() { return this._channelId; }
    private set channelId(val: number) { this._channelId = val; this.saveGameSetting(); }

    @property private _version = "1.0.0";
    @property({
        displayName: "版本",
        tooltip: "整包使用3位版本号(x.x.x),补丁包使用4位版本号(x.x.x.x)\n与远程资源相关的都只会使用前3位版本号"
    })
    public get version() { return this._version; }
    private set version(val: string) { this._version = val.trim(); this.saveGameSetting(); }

    @property private _cdnUrl = "";
    @property({
        displayName: "CDN",
        tooltip: "项目的CDN地址"
    })
    public get cdnUrl() { return this._cdnUrl; }
    private set cdnUrl(val: string) { this._cdnUrl = val; this.saveGameSetting(); }



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

    @property private _nodeEvent = false;
    @property({
        displayName: "节点事件",
        tooltip: "打印节点触发的事件，方便调试",
    })
    public get nodeEvent() { return this._nodeEvent; }
    private set nodeEvent(val: boolean) { this._nodeEvent = val; }

    @property({
        type: LogLevel,
        displayName: "日志级别",
        tooltip: "默认为Auto,编辑器预览时日志级别为Info,发布后日志级别为Warn"
    })
    private m_LogLevel = LogLevel.Info;

    /**  渠道名字 */
    public get channel() { return EChannel[this._channelId]; }
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
        //@ts-ignore
        globalThis["gameSetting"] = this;
        this._mainVersion = this.getMainVersion();
        this._gameCode = this._gameName + "_" + this.channel
        this._gameConfigUrl = `${this._cdnUrl}/${this._gameName}/Channel/${this.channel}/${this._mainVersion}/GameConfig.txt`;
        this._remoteResUrl = `${this._cdnUrl}/${this._gameName}/Resources`;
        if (EDITOR_NOT_IN_PREVIEW) return;
        director.addPersistRootNode(this.node);
        this.setFrameRate();
        this.setLogLevel();
    }

    private setFrameRate() {
        if (this.m_FrameRate > 0) {
            game.frameRate = this.m_FrameRate;
        }
    }

    private setLogLevel() {
        if (this.m_LogLevel == LogLevel.Auto) {
            if (!PREVIEW) {
                logger.setLevel(LogLevel.Warn);
            } else {
                logger.setLevel(LogLevel.Info);
            }
        } else {
            logger.setLevel(this.m_LogLevel);
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

    private enableNodeEvent() {
        if (this._nodeEvent) {
            Node.prototype.dispatchEvent = function (event: Event) {
                let self: Node = this;
                if (!event.type.startsWith("mouse-")) {//忽略鼠标事件
                    console.log("[NodeEvent]", event.type, self.getPath());
                    this._eventProcessor.dispatchEvent(event);
                }
            }
        }
    }

    private saveGameSetting() {
        if (!EDITOR_NOT_IN_PREVIEW) return;
        let gameSetting = {
            gameName: this._gameName,
            channel: this.channel,
            version: this._version,
            cdnUrl: this._cdnUrl,
            mainVersion: this.mainVersion,
            hotupdateServer: `${this._cdnUrl}/${this._gameName}/Channel/${this.channel}/${this._version}/ResPkg`,
            minigameServer: `${this._cdnUrl}/${this._gameName}/Channel/${this.channel}/${this._version}/ResPkg/`,
        };
        Editor.Message.send("amun-editor-tool", "saveGameSetting", JSON.stringify(gameSetting));
    }
}


declare global {
    /** 游戏的配置 */
    const gameSetting: GameSetting;
}