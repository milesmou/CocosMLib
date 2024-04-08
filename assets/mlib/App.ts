import { Component, ResolutionPolicy, _decorator, director, js, view } from 'cc';
const { ccclass, property } = _decorator;

import { Publish } from '../scripts/base/publish/Publish';
import SDKSetting from '../scripts/base/publish/SDKSetting';
import { TipMsg } from '../scripts/base/tipmsg/TipMsg';
import { GameSetting } from './GameSetting';
import { AssetComponent } from './module/asset/AssetComponent';
import { AudioComponent } from "./module/audio/AudioComponent";
import NodeTag from './module/core/NodeTag';
import { TimerComponent } from './module/core/TimerComponent';
import { EventMgr } from "./module/event/EventMgr";
import { L10nMgr } from './module/l10n/L10nMgr';
import { MLogger } from './module/logger/MLogger';
import { PoolMgr } from "./module/pool/PoolMgr";
import { LocalStorage } from './module/stroage/LocalStorage';
import { UIMgr } from "./module/ui/manager/UIMgr";
import { Channel } from "./sdk/Channel";
import { SingletonFactory } from './utils/SingletonFactory';


/** 应用程序启动入口 */
@ccclass('App')
export class App extends Component {

    public static Inst: App;

    public static chan: Channel;
    //manager
    public static timer: TimerComponent;
    public static audio: AudioComponent;
    public static asset: AssetComponent;
    public static stroage = LocalStorage;
    public static event = EventMgr;
    public static pool = PoolMgr;
    public static ui: UIMgr;
    public static tipMsg = TipMsg;
    public static l10n = L10nMgr;

    protected onLoad() {
        App.Inst = this;
        director.addPersistRootNode(this.node);
        NodeTag.add("App", this.node);
        this.setCanvasResolution();

        App.timer = this.addComponent(TimerComponent);
        App.audio = this.addComponent(AudioComponent);
        App.audio.setKey("App");
        App.asset = this.addComponent(AssetComponent);

        App.chan = Publish.getChannelInstance();

        MLogger.print(`GameSetting Channel=${GameSetting.Inst.channel}|${js.getClassName(App.chan)} Version=${GameSetting.Inst.version} Language=${L10nMgr.lang}`);
        MLogger.print(`SDKSetting ${SDKSetting.Inst.getPrintInfo()}`);
    }

    protected start() {
        App.ui = UIMgr.Inst;
    }

    protected onDestroy(): void {
        SingletonFactory.clear();
        EventMgr.clear();
        PoolMgr.clear();
    }

    private setCanvasResolution() {
        let size = view.getVisibleSize();
        let min = Math.min(size.width, size.height);
        let max = Math.max(size.width, size.height);
        let ratio = max / min;
        if (size.width > size.height) {//横屏
            if (ratio > 1.77) {//手机
                view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
            } else {//平板
                view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
            }
        } else {//竖屏
            if (ratio > 1.77) {//手机
                view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
            } else {//平板
                view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
            }
        }
    }

    public static getSingleInst<T>(clazz: { new(): T }) {
        return SingletonFactory.getInstance(clazz);
    }
}