import { Component, _decorator, director, js } from 'cc';
const { ccclass, property } = _decorator;

import { Publish } from '../scripts/base/publish/Publish';
import SDKSetting from '../scripts/base/publish/SDKSetting';
import { GameSetting } from './GameSetting';
import { AssetLoaderComponent } from './module/asset/AssetLoaderComponent';
import { AudioPlayerComponent } from "./module/audio/AudioPlayerComponent";
import NodeTag from './module/core/NodeTag';
import { TimerComponent } from './module/core/TimerComponent';
import { EventMgr } from "./module/event/EventMgr";
import { ELanguageCode } from './module/l10n/ELanguage';
import { L10nMgr } from './module/l10n/L10nMgr';
import { MLogger } from './module/logger/MLogger';
import { PoolMgr } from "./module/pool/PoolMgr";
import { StroageMgr } from "./module/stroage/StroageMgr";
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
    public static timer: TimerComponent;
    public static audio: AudioPlayerComponent;
    public static asset: AssetLoaderComponent;
    public static stroage = StroageMgr;
    public static event = EventMgr;
    public static pool = PoolMgr;
    public static ui: UIMgr;
    public static l10n = L10nMgr;

    onLoad() {
        App.Inst = this;
        director.addPersistRootNode(this.node);
        NodeTag.add("App", this.node);
        this.setCanvasResolution();
        App.timer = this.addComponent(TimerComponent);
        App.audio = this.addComponent(AudioPlayerComponent);
        App.asset = this.addComponent(AssetLoaderComponent);

        App.lang = L10nMgr.getLanguage(GameSetting.Inst.languageId);
        App.chan = Publish.getChannelInstance();
        MLogger.print(`GameSetting Channel=${GameSetting.Inst.channel}|${js.getClassName(App.chan)} Version=${GameSetting.Inst.version} Language=${App.lang}`);
        MLogger.print(`SDKSetting ${SDKSetting.Inst.getPrintInfo()}`);
    }



    start() {
        App.ui = UIMgr.Inst;
    }

    private setCanvasResolution() {
        // let winsize = screen.windowSize;
        // let ratio = winsize.width / winsize.height;
        // let drs = view.getDesignResolutionSize();
        // let drsRatio = drs.width / drs.height;
        // if (ratio > drsRatio) {
        //     view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
        // } else {
        //     view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
        // }
    }

    public static getSingleInst<T>(clazz: { new(): T }) {
        return SingletonFactory.getInstance(clazz);
    }
}

globalThis['app'] = App;