import { AudioClip, AudioSource, Component, Tween, _decorator, tween } from 'cc';
import { AssetComponent } from '../asset/AssetComponent';
import { AudioVolume } from './AudioVolume';
import { AudioMgr } from './AudioMgr';
import { AudioState } from './AudioState';
import { IAudioComponent } from './IAudioComponent';
import { SortedMap } from './SortedMap';

const { ccclass, property } = _decorator;

/** 音频播放组件 */
@ccclass("AudioComponent")
export class AudioComponent extends Component implements IAudioComponent {

    @property({
        displayName: "Key"
    })
    private m_key = "";

    /** 资源加载组件 */
    private _asset: AssetComponent;

    /** 音乐音量 */
    private get mVolume() { return AudioMgr.globalVolume.mVolume.value * this.audioVolume.mVolume.value; }
    /** 音效音量 */
    private get eVolume() { return AudioMgr.globalVolume.eVolume.value * this.audioVolume.eVolume.value; }

    /** 音量 */
    public audioVolume: AudioVolume;

    /** 当前音乐是否暂停 */
    private _pause = false;
    public get pause() { return this._pause; }

    /** 音乐的音轨栈 */
    public stack: SortedMap<string> = new SortedMap<string>();
    /** 音乐播放状态 */
    public music: Map<string, AudioState> = new Map<string, AudioState>();
    /** 单次播放音效的AudioSource */
    private _effectOneShot: AudioSource;
    /** 循环播放的音效 */
    private _loopEffect: AudioState[] = [];

    protected onLoad() {
        this._asset = this.getComponent(AssetComponent) || this.addComponent(AssetComponent);
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

    private musicGet(priority: number, audioName: string) {
        let value: AudioState = this.music.get(priority + "_" + audioName);
        return value?.audio?.isValid ? value : null;
    }

    private musicAdd(priority, audioName, audioState: AudioState) {
        this.music.set(priority + "_" + audioName, audioState);
    }

    private musicRemove(priority, audioName) {
        this.music.delete(priority + "_" + audioName);
    }

    /** 播放背景音乐 */
    public async playMusic(location: string, priority = 0, volumeScale = 1, args: { fadeIn?: number, fadeOut?: number, onLoaded?: (clip: AudioClip) => void } = {}) {
        priority = Math.max(0, priority);
        let { fadeIn, fadeOut, onLoaded } = args;
        fadeIn = fadeIn === undefined ? 0 : fadeIn;
        fadeOut = fadeOut === undefined ? 0 : fadeOut;

        if (this.stack.has(priority, location)) return; //已在播放列表则忽略

        if (this.stack.size > 0) {
            if (this.stack.hasKey(priority)) {//停止原来同优先级的音乐并释放
                let audioState = this.musicGet(priority, this.stack.get(priority));
                this.fadeOutMusic(priority == this.stack.topKey ? fadeOut : 0, audioState, true);
            } else if (priority > this.stack.topKey) {//优先级更大则暂停当前音乐
                let nowAudioState = this.musicGet(this.stack.topKey, this.stack.topValue);
                this.fadeOutMusic(fadeOut, nowAudioState, false);
            }
        }

        /* -------播放或恢复音乐------ */
        let audioState = this.musicGet(priority, location) || new AudioState(location, this.addComponent(AudioSource), volumeScale);
        this.stack.set(priority, location); //加入栈中
        this.musicAdd(priority, location, audioState);
        if (audioState.audio?.isValid && audioState.audio.clip?.isValid) { //恢复音乐
            if (this.stack.isTop(priority, location) && !this._pause) {
                this.fadeInMusic(fadeIn, audioState);
            }
        } else { //播放音乐
            let clip = await this._asset.loadAsset<AudioClip>(location, AudioClip);
            if (!this.isValid) return;
            if (!clip) return;
            if (!this.stack.has(priority, location)) {//未加载音乐完就已停止
                this._asset.decRef(location);
                return;
            }
            onLoaded && onLoaded(clip);
            audioState.audio.clip = clip;
            audioState.audio.volume = this.mVolume * volumeScale;
            audioState.audio.loop = true;
            if (!this.stack.isTop(priority, location)) {//不是优先级最高的音乐暂停播放 
                return;
            }
            if (!this._pause) {
                if (fadeIn > 0) {
                    audioState.audio.volume = 0;
                    audioState.audio.play();
                    this.fadeInMusic(fadeIn, audioState);
                }
                else {
                    audioState.audio.play();
                }
            }
        }
    }

    /**
     * 播放音效
     * @param loop loop=true时不会触发onFinished
     * @param deRef 默认为true 是否在音效结束时释引用次数-1
     */
    public async playEffect(location: string, volumeScale = 1, args: { loop?: boolean, deRef?: boolean, onStart?: (clip: AudioClip) => void, onFinished?: () => void } = {}) {
        let { loop, deRef, onStart, onFinished } = args;
        deRef = deRef === undefined ? true : deRef;
        let clip = await this._asset.loadAsset(location, AudioClip);
        if (!this.isValid) return;
        if (loop) {
            let audioState = new AudioState(location, this.addComponent(AudioSource), volumeScale);
            this._loopEffect.push(audioState);
            audioState.audio.clip = clip;
            audioState.audio.volume = this.eVolume * volumeScale;
            audioState.audio.loop = true;
            audioState.audio.play();
            onStart && onStart(clip);
        } else {
            this._effectOneShot.playOneShot(clip, volumeScale);
            Tween.stopAllByTarget(clip);
            tween(clip)
                .delay(clip.getDuration())
                .call(() => {
                    if (deRef) this._asset.decRef(location);
                    onFinished && onFinished();
                })
                .start();
        }
    }

    /** 暂停恢复音乐 */
    public pauseMusic(isPause: boolean, dur = 0) {
        this._pause = isPause;
        if (this.stack.size > 0) {
            let audioState = this.musicGet(this.stack.topKey, this.stack.topValue);
            if (isPause) {
                this.fadeOutMusic(dur, audioState);
            }
            else {
                this.fadeInMusic(dur, audioState);
            }
        }
    }

    /**
     * 停止播放当前音乐
     * @param location 停止指定名字音乐的地址 默认停止当前音乐
     * @param priority 音乐的优先级
     * @param autoPlay 是否自动播放上一个音乐 默认为true
     * @param fadeIn 上一个音乐渐入时间
     * @param fadeOut 当前音乐渐出时间
     */
    public stopMusic(location?: string, priority = 0, autoPlay = true, fadeIn = 0, fadeOut = 0) {
        let isTop = false;
        if (location === undefined) {
            isTop = true;
            priority = this.stack.topKey;
            location = this.stack.topValue;
        } else {
            isTop = this.stack.isTop(priority, location);
        }
        //停止指定音乐
        if (this.stack.has(priority, location)) {
            this.stack.delete(priority, location);
            this.fadeOutMusic(isTop ? fadeOut : 0, this.musicGet(priority, location), true);
            this.musicRemove(priority, location);
        }
        //恢复上一个音乐
        if (autoPlay && isTop && !this._pause) {
            this.pauseMusic(false, fadeIn);
        }
    }

    /**
     * 停止播放所有音乐
     * @param fadeOut 音乐渐出时间
     */
    public stopAllMusic(fadeOut = 0) {
        if (this.stack.size > 0) {
            for (let key in this.music) {
                this.fadeOutMusic(fadeOut, this.music[key], true);
            }
            this.stack.clear();
            this.music.clear();
        }
    }

    /** 停止播放指定的循环音效 */
    public stopEffect(audioClip: AudioClip) {
        if (audioClip) {
            let index = this._loopEffect.findIndex(v => v.audio.clip == audioClip);
            if (index > -1) {
                let audioState = this._loopEffect[index];
                this._loopEffect = this._loopEffect.splice(index, 1);
                if (audioState.audio?.isValid) {
                    audioState.audio.destroy();
                    this._asset.decRef(audioState.location);
                }
            }
        }
    }

    /** 停止播放所有音效 */
    public stopAllEffect() {
        this._loopEffect.forEach(v => {
            if (v.audio?.isValid) {
                this._asset.decRef(v.location);
                v.audio.destroy();
            }
        });
        this._loopEffect.length = 0;
        this._effectOneShot.stop();
    }

    /** 刷新正在播放的音乐的音量 */
    public refreshMusicVolume(dur?: number) {
        if (this.stack.size > 0) {
            if (dur > 0) {
                this.stack.forEach((priority, audioName) => {
                    let state = this.musicGet(audioName, priority);
                    if (state?.audio)
                        tween(state.audio).to(dur, { volume: state.volumeScale * this.mVolume }).start();
                });
            }
            else {
                this.stack.forEach((audioName, priority) => {
                    let state = this.musicGet(priority, audioName);
                    if (state?.audio) state.audio.volume = state.volumeScale * this.mVolume;
                });
            }
        }
    }

    /** 刷新正在播放的音效的音量 */
    public refreshEffectVolume() {
        this._loopEffect.forEach(v => {
            if (v.audio) v.audio.volume = v.volumeScale * this.eVolume;
        });
        this._effectOneShot.volume = this.eVolume;
    }

    private fadeInMusic(dur: number, audioState: AudioState) {
        if (audioState == null || !audioState.audio?.isValid) return;
        if (dur > 0) {
            audioState.audio.volume = 0;
            audioState.audio.play();
            tween(audioState.audio).to(dur, { volume: audioState.volumeScale * this.mVolume }).start();
        }
        else {
            audioState.audio.play();
        }
    }

    private fadeOutMusic(dur: number, audioState: AudioState, stop = false) {
        if (audioState == null || !audioState.audio?.isValid) return;
        let audioSource = audioState.audio;
        let onEnd = () => {
            if (stop) {
                audioSource?.isValid && audioSource.destroy();
                this._asset.decRef(audioState.location);
            }
            else {
                audioSource.pause();
            }
        };
        if (dur > 0) {
            tween(audioSource).to(dur, { volume: 0 }, {
                onComplete: () => {
                    onEnd();
                }
            }).start();
        }
        else {
            onEnd();
        }
    }

}