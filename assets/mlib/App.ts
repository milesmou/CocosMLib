import { Asset, Component, Enum, TextAsset, _decorator, director, game, sys } from 'cc';
const { ccclass, property } = _decorator;

import { Channel, EChannel, IChannel } from "./channel/Channel";
import { AudioMgr } from "./manager/AudioMgr";
import { EventMgr } from "./manager/EventMgr";
import { PoolMgr } from "./manager/PoolMgr";
import { StroageMgr } from "./manager/StroageMgr";
import { UIMgr } from "./manager/UIMgr";
import { SingletonFactory } from './utils/SingletonFactory';

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
    Remote: 1,
    PreferRemote: 2,
})

/** 应用程序启动入口 */
@ccclass('App')
export class App extends Component {
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
    private platformId = EChannel.Debug;
    @property({
        displayName: "版本"
    })
    private version = "1.0.0";

    @property({
        type: TextAsset,
        displayName: "本地配置文件",
        visible: function () { return this.gameConfigType == EGameConfigType.Local; }
    })
    private gameConfigAsset: TextAsset = null;

    @property({
        displayName: "配置地址",
        tooltip: "远程配置的地址,地址中的渠道使用{0}替代",
        visible: function () { return this.gameConfigType != EGameConfigType.Local; }
    })
    private gameConfigUrl = "";

    @property({
        type: Asset,
        displayName: "热更清单文件",
        tooltip: "本地project.manifest清单文件",
    })
    private hotupdateManifest: Asset = null;

    //environment
    public static config: { gameConfigType: number, gameConfigText: string, gameConfigUrl: string, hotupdateManifest: Asset, channel: string, version: string }
    public static lang: LanguageCode;
    public static chan: IChannel;
    //manager
    public static stroage = StroageMgr;
    public static event = EventMgr;
    public static pool = PoolMgr;
    public static audio: AudioMgr;
    public static ui: UIMgr;

    onLoad() {
        director.addPersistRootNode(this.node);
        game.frameRate = 45;
        App.config = {
            gameConfigType: this.gameConfigType, gameConfigText: this.gameConfigAsset.text, gameConfigUrl: this.gameConfigUrl.replace("{0}", EChannel[this.platformId]),
            hotupdateManifest: this.hotupdateManifest, channel: EChannel[this.platformId], version: this.version
        };
        this.gameConfigAsset.destroy();
        App.lang = this.getLanguage();
        App.chan = Channel.getInstance(this.platformId);
        console.log(`Channel=${App.config.channel} Version=${App.config.version} Language=${App.lang}`);
    }

    onDestroy() {

    }

    start() {
        App.audio = AudioMgr.Inst;
        App.ui = UIMgr.Inst;
    }

    /** 获取语言环境 */
    getLanguage(): LanguageCode {
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

    static init() {

    }

    static getSingleInst<T>(clazz: { new(): T }, onInst?: (t: T) => void) {
        return SingletonFactory.getInstance(clazz, onInst);
    }
}
