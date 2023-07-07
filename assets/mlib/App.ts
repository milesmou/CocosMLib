import { Component, Enum, TextAsset, _decorator, director, game, sys, view } from 'cc';
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
        type: TextAsset,
        displayName: "配置文件",
        tooltip: "本地配置的配置文件",
        visible: function () { return this.gameConfigType == EGameConfigType.Local; }
    })
    private gameConfigAsset: TextAsset = null;

    @property({
        displayName: "配置地址",
        tooltip: "远程配置的地址",
        visible: function () { return this.gameConfigType != EGameConfigType.Local; }
    })
    private gameConfigUrl = "";

    @property({
        displayName: "渠道",
        type: EChannel
    })
    private platformId = EChannel.Debug;
    @property({
        displayName: "版本"
    })
    private version = "1.0.0";

    //environment
    public static config: { gameConfigType: number, gameConfigText: string, gameConfigUrl: string, channel: string, version: string }
    public static lang: LanguageCode;
    public static channel: IChannel;
    public static safeSize: { top: number, bottom: number, left: number, right: number, width: number, height: number };
    //manager
    public static stroage = StroageMgr;
    public static event = EventMgr;
    public static pool = PoolMgr;
    public static audio: AudioMgr;
    public static ui: UIMgr;

    onLoad() {
        director.addPersistRootNode(this.node);
        game.frameRate = 45;
        App.config = { gameConfigType: this.gameConfigType, gameConfigText: this.gameConfigAsset.text, gameConfigUrl: this.gameConfigUrl, channel: (EChannel as any)[this.platformId], version: this.version };
        this.gameConfigAsset.destroy();
        App.lang = this.getLanguage();
        App.channel = Channel.getPlatformInst(this.platformId);
        console.log(`Channel=${App.config.channel} Version=${App.config.version} Language=${App.lang}`);
    }

    onDestroy() {

    }

    start() {
        App.audio = AudioMgr.Inst;
        App.ui = UIMgr.Inst;
        App.safeSize = this.getSafeArea();
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

    getSafeArea() {
        let winSize = view.getVisibleSize();
        let safeSize = { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };
        let safeArea = sys.getSafeAreaRect();
        safeSize.top = winSize.height - safeArea.height - safeArea.y;
        safeSize.bottom = safeArea.y;
        safeSize.left = safeArea.x;
        safeSize.right = winSize.width - safeArea.width - safeArea.x;
        safeSize.width = safeArea.width;
        safeSize.height = safeArea.height;
        return safeSize;
    }


    static init() {

    }

    static getSingleInst<T>(clazz: { new(): T }, onInst?: (t: T) => void) {
        return SingletonFactory.getInstance(clazz, onInst);
    }
}
