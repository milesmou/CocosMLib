import { Asset, Component, Enum, _decorator, director, js, sys } from 'cc';
const { ccclass, property } = _decorator;

import { EChannel, Publish } from '../scripts/base/publish/Publish';
import { Channel } from "./sdk/Channel";
import { AudioMgr } from "./manager/AudioMgr";
import { EventMgr } from "./module/event/EventMgr";
import { PoolMgr } from "./manager/PoolMgr";
import { StroageMgr } from "./manager/StroageMgr";
import { UIMgr } from "./module/ui/manager/UIMgr";
import { MLogger } from './module/logger/MLogger';
import { SingletonFactory } from './utils/SingletonFactory';
import { TimeMgr } from './manager/TimeMgr';
import { L10nMgr } from './module/l10n/L10nMgr';

const ELanguage = Enum({
    Auto: 0,
    SimplifiedChinese: 1,
    TraditionalChinese: 2,
    English: 3,
})

enum LanguageCode {
    ChineseSimplified = "sc",
    ChineseTraditional = "tc",
    English = "en"
}

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
    public static lang: LanguageCode;
    public static chan: Channel;
    //manager
    public static time: TimeMgr;
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
        App.lang = this.getLanguage();
        App.chan = Publish.getChannelInstance(this.channelId);
        MLogger.print(`Channel=${App.config.channel}|${js.getClassName(App.chan)} Version=${App.config.version} Language=${App.lang}`);
    }

    
    start() {
        App.audio = AudioMgr.Inst;
        App.ui = UIMgr.Inst;
    }

    onDestroy() {

    }


    /** 获取语言环境 */
    private getLanguage(): LanguageCode {
        let v: LanguageCode = LanguageCode.ChineseSimplified;
        if (this.languageId == ELanguage.Auto) {
            let code = StroageMgr.getValue(StroageMgr.UserLanguageCodeKey, "");
            if (code) {
                v = code as LanguageCode;
            }
            else {
                if (sys.languageCode == "zh") v = LanguageCode.ChineseSimplified;
                else if (sys.languageCode.startsWith("zh")) v = LanguageCode.ChineseTraditional;
                else v = LanguageCode.English;
            }
        } else if (this.languageId == ELanguage.SimplifiedChinese) {
            v = LanguageCode.ChineseSimplified;
        } else if (this.languageId == ELanguage.TraditionalChinese) {
            v = LanguageCode.ChineseTraditional;
        } else {
            v = LanguageCode.English;
        }
        return v;
    }

    /** 切换语言 */
    public static switchLanguage(languageCode: LanguageCode) {
        if (App.lang == languageCode) return;
        App.lang = languageCode;
        StroageMgr.setValue(StroageMgr.UserLanguageCodeKey, App.lang);
        App.l10n.switchLanguage();
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