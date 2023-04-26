import { Component, director, Enum, sys, view, _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { Channel, EChannel, IChannel } from "./channel/Channel";
import { AudioMgr } from "./manager/AudioMgr";
import { EventKey, EventMgr } from "./manager/EventMgr";
import { PoolKey, PoolMgr } from "./manager/PoolMgr";
import { StroageMgr } from "./manager/StroageMgr";
import { UIKey, UIMgr } from "./manager/UIMgr";
import { SingletonFactory } from './utils/SingletonFactory';

export const ELanguage = Enum({
    Auto: 0,
    ChineseSimplified: 1,
    ChineseTraditional: 2,
    English: 3,
})

/** 应用程序启动入口 */
@ccclass('App')
export class App extends Component {
    @property({
        displayName: "语言",
        type: ELanguage
    })
    private languageId = ELanguage.Auto;
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
    public static config: { channelName: string, version: string };
    public static lang: string;
    public static channel: IChannel;
    public static safeSize: { top: number, bottom: number, left: number, right: number, width: number, height: number };
    // //manager
    public static stroage = StroageMgr;
    public static audio: AudioMgr;
    public static event: EventMgr;
    public static eventKey = EventKey;
    public static pool: PoolMgr;
    public static poolKey = PoolKey;
    public static ui: UIMgr;
    public static uiKey = UIKey;

    onLoad() {
        director.addPersistRootNode(this.node);
    }

    start() {
        App.event = new EventMgr();
        App.pool = new PoolMgr();
        App.audio = AudioMgr.Inst;
        App.ui = UIMgr.Inst;

        App.config = { channelName: (EChannel as any)[this.platformId], version: this.version };
        App.lang = this.getLanguage();
        App.channel = Channel.getPlatformInst(this.platformId);
        App.safeSize = this.getSafeArea();
        console.log(`Channel = ${App.config.channelName} Version = ${App.config.version} Language = ${App.lang}`);
    }

    /** 获取语言环境 */
    getLanguage = () => {
        let v = "";
        if (this.languageId == ELanguage.Auto) {
            v = "zh";
        } else if (this.languageId == ELanguage.ChineseSimplified) {
            v = "zh";
        } else if (this.languageId == ELanguage.ChineseTraditional) {
            v = "zh_ft";
        } else if (this.languageId == ELanguage.English) {
            v = "en";
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

    static getSingleInst<T>(clazz: { new(): T }, onInst?: (t: T) => void) {
        return SingletonFactory.getInstance(clazz, onInst);
    }
}
