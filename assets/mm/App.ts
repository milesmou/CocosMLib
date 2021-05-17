import { AudioKey, AudioMgr } from "./manager/AudioMgr";
import { EventKey, EventMgr } from "./manager/EventMgr";
import { PoolKey, PoolMgr } from "./manager/PoolMgr";
import { StroageMgr } from "./manager/StroageMgr";
import UIMgr, { UIKey } from "./manager/UIMgr";
import { EPlatform, IPlatform, Platform } from "./platform/Platform";

const { ccclass, property } = cc._decorator;

export const ELanguage = cc.Enum({
    "Auto": 0,
    "ChineseSimplified": 1,
    "ChineseTraditional": 2,
    "English": 3,
})

class A {
    a = 1;
    b = 2;
    c_dayreset = 5;
}

/** 应用程序启动入口 */
@ccclass
export default class App extends cc.Component {

    @property({
        type: ELanguage,
        displayName: "语言"
    })
    private languageId = ELanguage.Auto;
    @property({
        type: EPlatform,
        displayName: "平台"
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
    //manager
    public static stroage: StroageMgr;
    public static audio: AudioMgr;
    public static audioKey = AudioKey;
    public static event: EventMgr;
    public static eventKey = EventKey;
    public static pool: PoolMgr;
    public static poolKey = PoolKey;
    public static ui: UIMgr;
    public static uiKey = UIKey;

    onLoad() {
        cc.game.addPersistRootNode(this.node);
    }

    start() {
        app.stroage = StroageMgr.Inst;
        app.audio = new AudioMgr();
        app.event = new EventMgr();
        app.pool = new PoolMgr();
        app.ui = UIMgr.Inst;

        app.config = { platformName: EPlatform[this.platformId], version: this.version };
        app.lang = this.getLanguage();
        app.platform = Platform.getPlatformInst(this.platformId);
        app.safeSize = this.getSafeArea();

        let v = app.stroage.getProxy(new A());    
        console.log(v);
        
        console.log(`Platform=${app.config.platformName} Version=${app.config.version} Language=${app.lang}`);
    }

    /** 获取语言环境 */
    getLanguage = () => {
        let v = "";
        if (this.languageId == ELanguage.Auto) {
            v = StroageMgr.Inst.getString("SysLanguage", cc.sys.languageCode);
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
        let safeSize = { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };
        let safeArea = cc.sys.getSafeAreaRect();
        safeSize.top = cc.winSize.height - safeArea.height - safeArea.y;
        safeSize.bottom = safeArea.y;
        safeSize.left = safeArea.x;
        safeSize.right = cc.winSize.width - safeArea.width - safeArea.x;
        safeSize.width = safeArea.width;
        safeSize.height = safeArea.height;
        return safeSize;
    }
}

export const app = App;
