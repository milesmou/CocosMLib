import { Component, Enum, _decorator, director, js } from 'cc';
const { ccclass, property } = _decorator;

import { EChannel, Publish } from '../scripts/base/publish/Publish';
import { PoolMgr } from "./module/pool/PoolMgr";
import { StroageMgr } from "./module/stroage/StroageMgr";
import { TimerMgr } from './module/timer/TimerMgr';
import { AudioMgr } from "./module/audio/AudioMgr";
import { EventMgr } from "./module/event/EventMgr";
import { ELanguage, ELanguageCode } from './module/l10n/ELanguage';
import { L10nMgr } from './module/l10n/L10nMgr';
import { MLogger } from './module/logger/MLogger';
import { UIMgr } from "./module/ui/manager/UIMgr";
import { Channel } from "./sdk/Channel";
import { SingletonFactory } from './utils/SingletonFactory';



export const EGameConfigType = Enum({
    Local: 0,
    Remote: 1
})

/** 应用程序启动入口 */
@ccclass('App')
export class App extends Component {

    public static Inst: App;

    @property({
        displayName: "语言",
        type: ELanguage
    })
    private languageId = ELanguage.SimplifiedChinese;

    @property({
        displayName: "配置",
        type: EGameConfigType,
        tooltip: "配置类型 Local:使用本地配置 Remote:使用远程配置  PreferRemote:优先使用远程配置,若拉取失败使用本地配置"
    })
    private gameConfigType = EGameConfigType.Local;

    @property({
        displayName: "渠道",
        type: EChannel
    })
    private channelId = EChannel.Dev;
    private channelEnum = EChannel;//给插件使用的，不要移除

    @property({
        displayName: "版本",
        tooltip: "整包使用3位版本号(x.x.x),补丁包使用4位版本号(x.x.x.x)\n与远程资源相关的都只会使用前3位版本号"
    })
    private version = "1.0.0";

    @property({
        displayName: "CDN",
        tooltip: "项目的CDN地址"
    })
    private cdnUrl = "";

    @property({
        displayName: "热更",
        tooltip: "开启热更需要再resources中放入本地project.manifest清单文件",
    })
    private hotupdate = true;

    //environment
    public static config: {
        projectName: string, gameConfigType: number, gameConfigUrl: string, remoteResUrl: string,
        hotupdate: boolean, channel: string, version: string, mainVersion: string
    }
    public static lang: ELanguageCode;
    public static chan: Channel;
    //manager
    public static time: TimerMgr;
    public static stroage = StroageMgr;
    public static event = EventMgr;
    public static pool = PoolMgr;
    public static audio: AudioMgr;
    public static ui: UIMgr;
    public static l10n = L10nMgr;

    onLoad() {
        App.Inst = this;
        director.addPersistRootNode(this.node);
        App.config = {
            projectName: "HeroFactory",
            gameConfigType: this.gameConfigType,
            gameConfigUrl: `${this.cdnUrl}/Channel/${EChannel[this.channelId]}/${this.getMainVersion()}/GameConfig.txt`,
            remoteResUrl: `${this.cdnUrl}/Resources`,
            hotupdate: this.hotupdate,
            channel: EChannel[this.channelId],
            version: this.version,
            mainVersion: this.getMainVersion()
        };
        App.lang = L10nMgr.getLanguage(this.languageId);
        App.chan = Publish.getChannelInstance(this.channelId, "HeroFactory_" + App.config.channel);
        MLogger.print(`Channel=${App.config.channel}|${js.getClassName(App.chan)} Version=${App.config.version} Language=${App.lang}`);
    }


    start() {
        App.audio = AudioMgr.Default;
        App.ui = UIMgr.Inst;
    }

    onDestroy() {

    }




    /** 主版本号 取前三位 */
    private getMainVersion() {
        let versionArr = this.version.split(".");
        if (versionArr.length == 4) {
            return versionArr.slice(0, 3).join(".");
        }
        return this.version;
    }

    public static getSingleInst<T>(clazz: { new(): T }) {
        return SingletonFactory.getInstance(clazz);
    }
}

globalThis['app'] = App;