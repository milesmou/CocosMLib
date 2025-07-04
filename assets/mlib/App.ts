import { Component, ResolutionPolicy, _decorator, director, js, view } from 'cc';
const { ccclass, property } = _decorator;

import { Publish } from '../scripts/base/publish/Publish';
import { TipMsg } from '../scripts/base/uiTipMsg/TipMsg';
import { AssetComponent } from './module/asset/AssetComponent';
import { AudioComponent } from "./module/audio/AudioComponent";
import { AudioMgr } from './module/audio/AudioMgr';
import { EventMgr } from "./module/event/EventMgr";
import { L10nMgr } from './module/l10n/L10nMgr';
import { PoolMgr } from "./module/pool/PoolMgr";
import { LocalStorage } from './module/stroage/LocalStorage';
import { TimerComponent } from './module/timer/TimerComponent';
import { UIMgr } from "./module/ui/manager/UIMgr";
import { Channel } from "./sdk/Channel";

interface IApp {
    /** 游戏运行环境 */
    readonly env: GameEnv;
    /** 渠道能力实例 */
    readonly chan: Channel;
    /** 版本详细信息 */
    readonly verDetail: string;

    /** 时间管理组件 */
    readonly timer: TimerComponent;
    /** 音频播放组件 */
    readonly audio: AudioComponent;
    /** 资源加载组件 */
    readonly asset: AssetComponent;
    /** 本地存储 */
    readonly stroage: typeof LocalStorage;
    /** 全局事件 */
    readonly event: typeof EventMgr;
    /** 全局对象池 */
    readonly pool: typeof PoolMgr;
    /** UI管理 */
    readonly ui: UIMgr;
    /** 音频播放组件管理类 */
    readonly audioMgr: AudioMgr;
    /** 多语言 */
    readonly l10n: typeof L10nMgr;
    /** 提示信息 */
    readonly tipMsg: typeof TipMsg;

}

/** 应用程序启动入口 */
@ccclass('App')
class App extends Component implements IApp {

    public env: GameEnv;
    public chan: Channel;
    public verDetail: string;

    public timer: TimerComponent;
    public audio: AudioComponent;
    public asset: AssetComponent;
    public stroage = LocalStorage;
    public event = EventMgr;
    public pool = PoolMgr;
    public ui: UIMgr;
    public audioMgr: AudioMgr;
    public l10n = L10nMgr;
    public tipMsg = TipMsg;



    protected onLoad() {
        //@ts-ignore
        globalThis["app"] = this;
        director.addPersistRootNode(this.node);
        this.setCanvasResolution();

        this.timer = this.addComponent(TimerComponent);
        this.asset = this.addComponent(AssetComponent);
        this.audio = this.addComponent(AudioComponent);
        this.audio.setKey("App");

        this.env = Publish.getGameEnv();
        this.chan = Publish.getChannelInstance();
        this.verDetail = mGameSetting.channel + "_" + mGameSetting.version + "_" + this.env.upperFirst();

        mLogger.info(`GameSetting Env=${this.env} Channel=${mGameSetting.channel}|${js.getClassName(this.chan)} Version=${mGameSetting.version}`);
        mLogger.info(`GameSetting ConfigType=${mGameSetting.gameConfigTypeStr} Language=${L10nMgr.lang}`);
        mLogger.info(`SDKSetting ${mSdkSetting.getPrintInfo()}`);
    }

    protected start() {
        this.audioMgr = AudioMgr.Inst
        this.ui = UIMgr.Inst;
    }

    protected onDestroy(): void {
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
}

declare global {
    /** 应用程序管理单例 */
    const app: IApp;
}