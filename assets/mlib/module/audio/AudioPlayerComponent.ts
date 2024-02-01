import { AudioClip, AudioSource, Component, Pool, Tween, _decorator, misc, tween } from 'cc';
import { AssetMgr } from '../asset/AssetMgr';
import { StroageMgr } from '../stroage/StroageMgr';
import { AudioState } from './AudioState';
import { SortedMap } from './SortedMap';

const { ccclass } = _decorator;

/** 音频播放组件 */
@ccclass("AudioPlayerComponent")
export class AudioPlayerComponent extends Component {

    private get sMusicVolume() { return "MusicVolume_" + this.node.name; }
    private get sEffectVolume() { return "EffectVolume_" + this.node.name; };

    /** 音乐音量 */
    private _mVolume: number = 1;
    public get mVolume() { return this._mVolume; }
    /** 音效音量 */
    private _eVolume: number = 1;
    public get eVolume() { return this._eVolume; }
    /** 当前音乐是否暂停 */
    private _pause = false;
    public get pause() { return this._pause; }

    /** 音乐的音轨栈 */
    public stack: SortedMap<string> = new SortedMap<string>();
    /** 音乐播放状态 */
    public music: Map<string, AudioState> = new Map<string, AudioState>();
    /** 单次播放音效的AudioSource */
    private effectOneShot: AudioSource;
    /** 循环播放的音效 */
    private loopEffect: AudioState[] = [];

    onLoad() {
        this._mVolume = StroageMgr.getValue(this.sMusicVolume, 1);
        this._eVolume = StroageMgr.getValue(this.sEffectVolume, 1);
        this.effectOneShot = this.addComponent(AudioSource);
        this.effectOneShot.volume = this._eVolume;
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
    async playMusic(location: string, priority = 0, volumeScale = 1, args: { fadeIn?: number, fadeOut?: number, onLoadComplete?: (clip: AudioClip) => void } = {}) {
        priority = Math.max(0, priority);
        let { fadeIn, fadeOut, onLoadComplete } = args;
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
            let clip = await AssetMgr.loadAsset<AudioClip>(location, AudioClip);
            if (!clip) return;
            if (!this.stack.isTop(priority, location)) {//未加载音乐完就已停止
                AssetMgr.DecRef(location);
                return;
            }
            onLoadComplete && onLoadComplete(clip);
            audioState.audio.clip = clip;
            audioState.audio.volume = this._mVolume * volumeScale;
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
    async playEffect(location: string, volumeScale = 1, args: { loop?: boolean, deRef?: boolean, onStart?: (clip: AudioClip) => void, onFinished?: () => void } = {}) {
        let { loop, deRef, onStart, onFinished } = args;
        deRef = deRef === undefined ? true : deRef;
        var clip = await AssetMgr.loadAsset(location, AudioClip);
        if (loop) {
            let audioState = new AudioState(location, this.addComponent(AudioSource), volumeScale);
            this.loopEffect.push(audioState);
            audioState.audio.clip = clip;
            audioState.audio.volume = this._eVolume * volumeScale;
            audioState.audio.loop = true;
            audioState.audio.play();
            onStart && onStart(clip);
        } else {
            this.effectOneShot.playOneShot(clip, volumeScale);
            Tween.stopAllByTarget(clip);
            tween(clip)
                .delay(clip.getDuration())
                .call(() => {
                    if (deRef) AssetMgr.DecRef(location);
                    onFinished && onFinished();
                })
                .start();
        }
    }

    /** 暂停恢复音乐 */
    pauseMusic(isPause: boolean, dur = 0) {
        this._pause = isPause;
        if (this.stack.size > 0) {
            var audioState = this.musicGet(this.stack.topKey, this.stack.topValue);
            if (isPause) {
                this.fadeOutMusic(dur, audioState);
            }
            else {
                this.fadeInMusic(dur, audioState);
            }
        }
    }


    //停止播放当前音乐
    //location 停止指定名字音乐的地址 默认停止当前音乐
    //priority 音乐的优先级
    //autoPlay 是否自动播放上一个音乐 默认为true
    //fadeIn 上一个音乐渐入时间
    //fadeOut 当前音乐渐出时间
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

    //停止播放所有音乐
    //fadeOut 音乐渐出时间
    public stopAllMusic(fadeOut = 0) {
        if (this.stack.size > 0) {
            for (let key in this.music) {
                this.fadeOutMusic(fadeOut, this.music[key], true);
            }
            this.stack.clear();
            this.music.clear();
        }
    }

    // 停止播放指定的循环音效
    public stopEffect(audioClip: AudioClip) {
        if (audioClip) {
            let index = this.loopEffect.findIndex(v => v.audio.clip == audioClip);
            if (index > -1) {
                let audioState = this.loopEffect[index];
                this.loopEffect = this.loopEffect.splice(index, 1);
                if (audioState.audio?.isValid) {
                    audioState.audio.destroy();
                    AssetMgr.DecRef(audioState.location);
                }
            }
        }
    }

    // 停止播放所有音效
    public stopAllEffect() {
        this.loopEffect.forEach(v => {
            if (v.audio?.isValid) {
                AssetMgr.DecRef(v.location);
                v.audio.destroy();
            }
        });
        this.loopEffect.length = 0;
        this.effectOneShot.stop();
    }

    /* 设置音乐音量 */
    public setMusicVolume(volume: number, dur = 0) {
        volume = misc.clampf(volume, 0, 1);
        if (this.stack.size > 0) {
            if (dur > 0) {
                this.stack.forEach((priority, audioName) => {
                    let state = this.musicGet(audioName, priority);
                    if (state?.audio)
                        tween(state.audio).to(dur, { volume: state.volumeScale * volume }).start();
                });
            }
            else {
                this.stack.forEach((audioName, priority) => {
                    let state = this.musicGet(priority, audioName);
                    if (state?.audio) state.audio.volume = state.volumeScale * volume;
                });
            }
        }

        this._mVolume = volume;
        StroageMgr.setValue(this.sMusicVolume, this._mVolume);
    }

    /** 设置音效音量 */
    public setEffectVolume(volume: number) {
        volume = misc.clampf(volume, 0, 1);
        this.loopEffect.forEach(v => {
            if (v.audio) v.audio.volume = v.volumeScale * volume;
        });
        this.effectOneShot.volume = volume;
        this._eVolume = volume;
        StroageMgr.setValue(this.sEffectVolume, this._eVolume);
    }

    private fadeInMusic(dur: number, audioState: AudioState) {
        if (audioState == null || !audioState.audio?.isValid) return;
        if (dur > 0) {
            audioState.audio.volume = 0;
            audioState.audio.play();
            tween(audioState.audio).to(dur, { volume: audioState.volumeScale * this._mVolume }).start();
        }
        else {
            audioState.audio.play();
        }
    }

    private fadeOutMusic(dur: number, audioState: AudioState, stop = false) {
        if (audioState == null || !audioState.audio?.isValid) return;
        var audioSource = audioState.audio;
        let onEnd = () => {
            if (stop) {

                audioSource?.isValid && audioSource.destroy();
                AssetMgr.DecRef(audioState.location);
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