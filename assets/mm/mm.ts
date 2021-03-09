import { AudioKey, AudioMgr } from "./manager/AudioMgr";
import { EventKey, EventMgr } from "./manager/EventMgr";
import { PoolKey, PoolMgr } from "./manager/PoolMgr";
import { StroageKey, StroageMgr } from "./manager/StroageMgr";
import UIMgr, { UIKey } from "./manager/UIMgr";
import { EPlatform, IPlatform, Platform } from "./platform/Platform";

const { ccclass, property } = cc._decorator;

export const ELanguage = cc.Enum({
    "Auto": 0,
    "ChineseSimplified": 1,
    "ChineseTraditional": 2,
    "English": 3,
})

/** 应用程序启动入口 */
@ccclass
export default class mm extends cc.Component {

    @property({
        type: ELanguage,
        displayName: "语言"
    })
    languageId = ELanguage.Auto;
    @property({
        type: EPlatform,
        displayName: "平台"
    })
    platformId = EPlatform.Test;
    @property({
        displayName: "版本"
    })
    version = "1.0.0";

    //environment
    public static config: { platformName: string, version: string } = {} as any;
    public static lang: string;
    public static platform: IPlatform;
    public static safeSize: { top: number, bottom: number, left: number, right: number, width: number, height: number };
    //manager
    public static audio: AudioMgr = new AudioMgr();
    public static audioKey = AudioKey;
    public static event: EventMgr = new EventMgr();
    public static eventKey = EventKey;
    public static pool: PoolMgr = new PoolMgr();
    public static poolKey = PoolKey;
    public static stroage: StroageMgr = new StroageMgr();
    public static stroageKey = StroageKey;
    public static ui: UIMgr = null;
    public static uiKey = UIKey;

    onLoad() {
        cc.game.addPersistRootNode(this.node);
        mm.config.platformName = EPlatform[this.platformId];
        mm.config.version = this.version;
        mm.lang = this.getLanguage();
        mm.platform = Platform.getPlatformInst(this.platformId);
    }

    onEnable(){
         //安全区域
         mm.safeSize = { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };
         let safeArea = cc.sys.getSafeAreaRect();
         mm.safeSize.top = cc.winSize.height - safeArea.height - safeArea.y;
         mm.safeSize.bottom = safeArea.y;
         mm.safeSize.left = safeArea.x;
         mm.safeSize.right = cc.winSize.width - safeArea.width - safeArea.x;
         mm.safeSize.width = safeArea.width;
         mm.safeSize.height = safeArea.height;
         //
         mm.ui = UIMgr.Inst;
    }

    /** 获取语言环境 */
    getLanguage = () => {
        let v = "";
        if (this.languageId == ELanguage.Auto) {
            v = mm.stroage.getString(mm.stroageKey.SysLanguage, cc.sys.languageCode);
            if (v == "zh-cn") {
                v = "zh";
            } else if (v.startsWith("zh-")) {
                v = "zh_ft";
            } else if (v.startsWith("en-")) {
                v = "en";
            }
        } else if (this.languageId == ELanguage.ChineseSimplified) {
            v = "zh";
        } else if (this.languageId == ELanguage.ChineseTraditional) {
            v = "zh_ft";
        } else if (this.languageId == ELanguage.English) {
            v = "en";
        }
        console.log("Lang:", v, " LanguageCode:", cc.sys.languageCode);
        return v;
    }

}


