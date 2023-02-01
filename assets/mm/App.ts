import { _decorator, Enum, Component, game, sys, view } from 'cc';
const { ccclass, property } = _decorator;

import { AudioKey, AudioMgr } from "./manager/AudioMgr";
import { EventKey, EventMgr } from "./manager/EventMgr";
import { PoolKey, PoolMgr } from "./manager/PoolMgr";
import { StroageKey, StroageMgr } from "./manager/StroageMgr";
import { UIMgr, UIKey } from "./manager/UIMgr";
import { EPlatform, IPlatform, Platform } from "./platform/Platform";

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
        displayName: "平台",
        type: EPlatform
    })
    private platformId = EPlatform.Debug;
    @property({
        displayName: "版本"
    })
    private version = "1.0.0";
    //environment
    public static config: { platformName: string, version: string };
    public static lang: string;
    public static platform: IPlatform;
    public static safeSize: { top: number, bottom: number, left: number, right: number, width: number, height: number };
    // //manager
    public static stroage: StroageMgr;
    public static stroageKey = StroageKey;
    public static audio: AudioMgr;
    public static audioKey = AudioKey;
    public static event: EventMgr;
    public static eventKey = EventKey;
    public static pool: PoolMgr;
    public static poolKey = PoolKey;
    public static ui: UIMgr;
    public static uiKey = UIKey;

    onLoad() {
        game.addPersistRootNode(this.node);
    }

    start() {
        app.stroage = new StroageMgr();
        app.event = new EventMgr();
        app.pool = new PoolMgr();
        app.audio = AudioMgr.Inst;
        app.ui = UIMgr.Inst;

        app.config = { platformName: (EPlatform as any)[this.platformId], version: this.version };
        app.lang = this.getLanguage();
        app.platform = Platform.getPlatformInst(this.platformId);
        app.safeSize = this.getSafeArea();
        console.log(`Platform = ${app.config.platformName} Version = ${app.config.version} Language = ${app.lang}`);
    }

    /** 获取语言环境 */
    getLanguage = () => {
        let v = "";
        if (this.languageId == ELanguage.Auto) {
            v = app.stroage.getString(app.stroageKey.SysLanguage, sys.languageCode);
            if (v.includes("-")) {
                if (v == "zh-cn") {
                    v = "zh";
                } else if (v.startsWith("zh-")) {
                    v = "zh_ft";
                } else if (v.startsWith("en-")) {
                    v = "en";
                }
            }
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
}

export const app = App;
