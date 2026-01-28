import { _decorator, BitMask, Component, director, Enum } from 'cc';
import { EDITOR_NOT_IN_PREVIEW, PREVIEW } from 'cc/env';
import { EChannel } from '../scripts/base/publish/EChannel';
import { ELanguage } from './module/l10n/ELanguage';
import { ELoggerLevel } from './module/logger/ELoggerLevel';
const { ccclass, property, executeInEditMode } = _decorator;

const CEChannel = Enum(EChannel);
const CBMChannel = BitMask({ ...EChannel });

const CEGameConfigType = Enum({
    Local: 0,
    Remote: 1
})

const CELogLevel = Enum({
    Auto: 0,
    ...ELoggerLevel
});

@ccclass('ServerConfig')
class ServerConfig {
    @property({
        displayName: "CDN",
        tooltip: "项目的CDN地址"
    })
    public cdnUrl: string = "";
    @property({
        displayName: "Server",
        tooltip: "项目的常用的服务端功能地址"
    })
    public serverUrl: string = "";
}

@ccclass('ChannnelServerConfig')
class ChannnelServerConfig extends ServerConfig {
    @property({
        type: CBMChannel,
        displayName: "Channels",
        tooltip: "应用的渠道(多选)"
    })
    public channels = 0;
}

@ccclass('HotupdateConfig')
class HotupdateConfig {
    @property
    private _appVersion = "1.0";
    @property({
        displayName: "App Version",
        tooltip: "整包版本号，两位数字表示 x.x"
    })
    public get appVersion() { return this._appVersion; }
    private set appVersion(val: string) { this._appVersion = val.trim(); }

    @property
    private _patchVersion = "";
    @property({
        displayName: "Pactch Version",
        tooltip: "补丁版本号,一位数字 x 发布整包时填0"
    })
    public get patchVersion() { return this._patchVersion; }
    private set patchVersion(val: string) { this._patchVersion = val.trim() || "0"; }
}


@ccclass('GameSetting')
@executeInEditMode
class GameSetting extends Component {

    @property
    protected _scriptName: string = "GameSetting";

    /** 配置文件类型 */
    public readonly ConfigType = CEGameConfigType;

    @property private _gameName: string = "";
    @property({
        displayName: "游戏名",
        tooltip: "名字会用来拼接CND地址，上报事件等"
    })
    public get gameName() { return this._gameName; }
    private set gameName(val: string) { this._gameName = val; this.saveGameSetting(); }

    @property private _channelId = CEChannel.Dev;
    @property({
        displayName: "渠道",
        type: CEChannel
    })
    public get channelId() { return this._channelId; }
    private set channelId(val: number) { this._channelId = val; this.saveGameSetting(); }

    @property private _version = "1.0.0";
    @property({
        displayName: "版本",
        tooltip: "使用3位版本号(x.x.x),第三位表示补丁版本,热更会用前两位表示App版本"
    })
    public get version() { return this._version; }
    private set version(val: string) { this._version = val.trim(); this.saveGameSetting(); }

    @property({
        type: ServerConfig,
        displayName: "服务端配置 (默认)",
    })
    public serverConfig: ServerConfig = null;

    @property({
        type: ChannnelServerConfig,
        displayName: "服务端配置 (渠道)",
        tooltip: "渠道特定的服务端配置,没有配置时使用默认配置"
    })
    public channelServerConfigs: ChannnelServerConfig[] = [];

    @property private _languageId = ELanguage.ChineseSimplified;
    @property({
        displayName: "语言",
        type: ELanguage
    })
    public get languageId() { return this._languageId; }
    private set languageId(val: number) { this._languageId = val; }

    @property private _gameConfigType = CEGameConfigType.Local;
    @property({
        displayName: "配置",
        type: CEGameConfigType,
        tooltip: "配置类型 Local:使用本地配置 Remote:使用远程配置"
    })
    public get gameConfigType() { return this._gameConfigType; }
    private set gameConfigType(val: number) { this._gameConfigType = val; }
    public get gameConfigTypeStr() { return CEGameConfigType[this._gameConfigType]; }

    @property private _hotupdate = true;
    @property({
        displayName: "热更",
        tooltip: "是否启用热更,仅支持原生平台",
    })
    public get hotupdate() { return this._hotupdate; }
    private set hotupdate(val: boolean) { this._hotupdate = val; this.saveGameSetting(); }

    @property private _hotupdateConfig = null;
    @property({
        type: HotupdateConfig,
        displayName: "热更配置(仅用于原生平台热更)",
        tooltip: "发布整包时，必须更新AppVersion,否则会有缓存问题, 发布补丁时，必须保持AppVersion和线上版本一致,仅更新PatchVersion",
        visible: function () { return (this as GameSetting).hotupdate; },
    })
    public get hotupdateConfig() { return this._hotupdateConfig; }
    private set hotupdateConfig(val: HotupdateConfig) { this._hotupdateConfig = val; this.saveGameSetting(); }

    @property private _logLevel = CELogLevel.Auto;
    @property({
        type: CELogLevel,
        displayName: "日志级别",
        tooltip: "默认为Auto,编辑器预览时日志级别为Debug,发布后日志级别为Info"
    })
    public get logLevel() { return this._logLevel; }
    private set logLevel(val: number) { this._logLevel = val; }

    @property
    private _modifyTime = "";
    /** GameSetting最后修改时间 */
    public get modifyTime() { return this._modifyTime; }

    /** 最终的服务端配置 */
    private _serverConfig: ServerConfig = null;

    /** 服务端地址 */
    public get serverUrl() { return this._serverConfig.serverUrl; }

    /**  渠道名字 */
    public get channel(): string { return CEChannel[this._channelId]; }
    private _gameCode: string;
    /** 游戏识别码 游戏名_渠道名 */
    public get gameCode() { return this._gameCode; }
    private _gameConfigUrl: string;
    /** 远程配置地址 */
    public get gameConfigUrl() { return this._gameConfigUrl; }
    private _remoteResUrl: string;
    private _commonRemoteResUrl: string;
    /** 远程资源地址(渠道专用) */
    public get remoteResUrl() { return this._remoteResUrl; }
    /** 远程资源地址(项目公用) */
    public get commonRemoteResUrl() { return this._commonRemoteResUrl; }

    protected onLoad(): void {
        //@ts-ignore
        globalThis.mGameSetting = this;
        this.initServerConfig();
        this._gameCode = this._gameName + "_" + this.channel
        this._commonRemoteResUrl = `${this._serverConfig.cdnUrl}/${this._gameName}/Resources`;
        this._remoteResUrl = `${this._serverConfig.cdnUrl}/${this._gameName}/Channel/${this.channel}/Resources`;
        this._gameConfigUrl = `${this._serverConfig.cdnUrl}/${this._gameName}/Channel/${this.channel}/Config/${this._version}.txt`;

        if (EDITOR_NOT_IN_PREVIEW) {
            this.saveGameSetting();
            return;
        }
        director.addPersistRootNode(this.node);
        this.setLogLevel();
    }

    private setLogLevel() {
        if (this.logLevel == CELogLevel.Auto) {
            if (PREVIEW) {
                mLogger.setLevel(CELogLevel.Debug);
            } else {
                mLogger.setLevel(CELogLevel.Info);
            }
        } else {
            mLogger.setLevel(this.logLevel);
        }
    }

    /** 初始化服务端配置 */
    private initServerConfig() {
        this._serverConfig = this.channelServerConfigs.find(v => (v.channels & this.channelId) != 0);
        if (!this._serverConfig) {
            this._serverConfig = this.serverConfig;
        }
    }

    /** 是否指定渠道 */
    public isChannel(channelId: number) {
        return this.channelId == channelId;
    }

    /** 编辑器保存配置到本地 */
    private saveGameSetting() {
        if (!EDITOR_NOT_IN_PREVIEW) return;
        this.initServerConfig();
        let date = new Date();
        this._modifyTime = date.toLocaleString();
        //小游戏远程资源使用季度缓存
        let quarter = date.getFullYear().toString() + (Math.floor(date.getMonth() / 3) + 1);
        let gameSetting = {
            /** 游戏名 */
            gameName: this.gameName,
            /** 渠道名 */
            channel: this.channel,
            /** 版本号(全) */
            version: this.version,
            /** App版本号(只有2位 X.X) */
            appVersion: this.hotupdateConfig.appVersion,
            /** 补丁版本号(只有1位 X) */
            patchVersion: this.hotupdateConfig.patchVersion,
            /** CDN地址 */
            cdnUrl: this._serverConfig.cdnUrl,
            /** 热更开关 */
            hotupdate: this.hotupdate,
            /** 热更资源地址 */
            hotupdateServer: `${this._serverConfig.cdnUrl}/${this.gameName}/Channel/${this.channel}/ResPkg/HotUpdate/${this.hotupdateConfig.appVersion}`,
            /** 热更资源OSS上传目录 */
            hotupdateResOSSUploadDir: `${this.gameName}/Channel/${this.channel}/ResPkg/HotUpdate/${this.hotupdateConfig.appVersion}/`,
            /** 远程资源地址 */
            remoteResServer: `${this._serverConfig.cdnUrl}/${this.gameName}/Channel/${this.channel}/ResPkg/${quarter}/`,
            /** 远程资源OSS上传目录 */
            remoteResOSSUploadDir: `${this.gameName}/Channel/${this.channel}/ResPkg/${quarter}/`
        };
        Editor.Message.send("miles-editor-tool", "saveGameSetting", JSON.stringify(gameSetting));
    }
}


declare global {
    /** 防止使用编辑器接口报错(仅在编辑器环境可用) */
    const Editor: any;
    /** 游戏的配置 */
    const mGameSetting: GameSetting;
}