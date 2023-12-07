import { Component, _decorator, director, js } from 'cc';
const { ccclass, property } = _decorator;

import { Publish } from '../scripts/base/publish/Publish';
import SDKSetting from '../scripts/base/publish/SDKSetting';
import { GameSetting } from './GameSetting';
import { AudioMgr } from "./module/audio/AudioMgr";
import { EventMgr } from "./module/event/EventMgr";
import { ELanguageCode } from './module/l10n/ELanguage';
import { L10nMgr } from './module/l10n/L10nMgr';
import { MLogger } from './module/logger/MLogger';
import { PoolMgr } from "./module/pool/PoolMgr";
import { StroageMgr } from "./module/stroage/StroageMgr";
import { TimerMgr } from './module/timer/TimerMgr';
import { UIMgr } from "./module/ui/manager/UIMgr";
import { Channel } from "./sdk/Channel";
import { SingletonFactory } from './utils/SingletonFactory';


/** 应用程序启动入口 */
@ccclass('App')
export class App extends Component {

    public static Inst: App;

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
        App.lang = L10nMgr.getLanguage(GameSetting.Inst.languageId);
        App.chan = Publish.getChannelInstance();
        MLogger.print(`GameSetting Channel=${GameSetting.Inst.channel}|${js.getClassName(App.chan)} Version=${GameSetting.Inst.version} Language=${App.lang}`);
        MLogger.print(`SDKSetting ${SDKSetting.Inst.getPrintInfo()}`);
    }


    start() {
        App.audio = AudioMgr.Default;
        App.ui = UIMgr.Inst;
    }

    onDestroy() {

    }


    public static getSingleInst<T>(clazz: { new(): T }) {
        return SingletonFactory.getInstance(clazz);
    }
}

globalThis['app'] = App;