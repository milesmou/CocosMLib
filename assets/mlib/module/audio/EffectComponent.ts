import { AudioClip, AudioSource, Component, Tween, _decorator, tween } from 'cc';
import { AssetComponent } from '../asset/AssetComponent';
import { AssetMgr } from '../asset/AssetMgr';
import { AudioMgr } from './AudioMgr';
import { AudioState } from './AudioState';
import { AudioVolume } from './AudioVolume';
import { IAudioComponent } from './IAudioComponent';

const { ccclass, property, requireComponent } = _decorator;

/** 音效播放组件 (只负责播放音效相关)*/
@ccclass("EffectComponent")
@requireComponent(AssetComponent)
export class EffectComponent extends Component implements IAudioComponent {

    @property({
        displayName: "Key"
    })
    private m_key = "";

    /** 资源加载组件 */
    protected asset: AssetComponent;

    /** 音乐音量 */
    protected get mVolume() { return AudioMgr.globalVolume.mVolume.value * this.audioVolume.mVolume.value; }
    /** 音效音量 */
    protected get eVolume() { return AudioMgr.globalVolume.eVolume.value * this.audioVolume.eVolume.value; }

    /** 音量 */
    protected audioVolume: AudioVolume;

    /** 单次播放音效的AudioSource */
    private _effectOneShot: AudioSource;
    /** 循环播放的音效 */
    private _loopEffect: AudioState[] = [];

    protected onLoad() {
        this.asset = this.ensureComponent(AssetComponent);
        this._effectOneShot = this.addComponent(AudioSource);
        this.setKey(this.m_key);
    }

    protected onDestroy(): void {
        AudioMgr.remove(this.m_key);
    }

    /** 为音频播放组件设置一个Key */
    public setKey(key: string) {
        if (!key) return;
        this.m_key = key;
        this.audioVolume = new AudioVolume(key, this.refreshMusicVolume.bind(this), this.refreshEffectVolume.bind(this));
        this._effectOneShot.volume = this.eVolume;
        AudioMgr.add(this.m_key, this);
    }

    /**
     * 播放音效
     * @param loop loop=true时不会触发onFinished
     * @param deRef 默认为false 是否在音效结束时释引用次数-1
     */
    public async playEffect(location: string, volumeScale = 1, args: { loop?: boolean, deRef?: boolean, onStart?: (audio: AudioSource) => void, onFinished?: () => void } = {}) {
        let { loop, deRef, onStart, onFinished } = args;
        let clip: AudioClip;
        if (deRef) {
            clip = await AssetMgr.loadAsset(location, AudioClip);
        } else {
            clip = await this.asset.loadAsset(location, AudioClip);
        }
        if (!this.isValid) return;
        if (loop) {
            let audioState = new AudioState(location, this.addComponent(AudioSource), volumeScale);
            this._loopEffect.push(audioState);
            audioState.audio.clip = clip;
            audioState.audio.volume = this.eVolume * volumeScale;
            audioState.audio.loop = true;
            audioState.audio.play();
            onStart && onStart(audioState.audio);
        } else {
            this._effectOneShot.playOneShot(clip, volumeScale);
            Tween.stopAllByTarget(clip);
            tween(clip)
                .delay(clip.getDuration())
                .call(() => {
                    if (deRef) AssetMgr.decRef(location);
                    onFinished && onFinished();
                })
                .start();
        }
    }

    /** 停止播放指定的循环音效 */
    public stopEffect(audio: AudioSource) {
        if (audio) {
            let index = this._loopEffect.findIndex(v => v.audio == audio);
            if (index > -1) {
                let audioState = this._loopEffect[index];
                this._loopEffect = this._loopEffect.splice(index, 1);
                if (audioState.audio?.isValid) {
                    audioState.audio.destroy();
                    this.asset.decRef(audioState.location);
                }
            }
        }
    }

    /** 停止播放所有音效 */
    public stopAllEffect() {
        this._loopEffect.forEach(v => {
            if (v.audio?.isValid) {
                this.asset.decRef(v.location);
                v.audio.destroy();
            }
        });
        this._loopEffect.length = 0;
        this._effectOneShot.stop();
    }

    /** 刷新正在播放的音乐的音量 */
    public refreshMusicVolume(dur?: number) {

    }

    /** 刷新正在播放的音效的音量 */
    public refreshEffectVolume() {
        this._loopEffect.forEach(v => {
            if (v.audio) v.audio.volume = v.volumeScale * this.eVolume;
        });
        this._effectOneShot.volume = this.eVolume;
    }

}