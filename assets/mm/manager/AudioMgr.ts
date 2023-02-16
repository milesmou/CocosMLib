import { AudioClip, AudioSource, Component, misc, resources, Tween, tween, _decorator } from 'cc';
import { app } from '../App';
import { AssetMgr } from './AssetMgr';
import { StroageMgr } from './StroageMgr';

const { ccclass } = _decorator;

class AudioState {
    public constructor(audio: AudioSource, volumeScale: number) {
        this.audio = audio;
        this.volumeScale = volumeScale;
        this.audio.playOnAwake = false;
    }

    ///音源组件
    public audio: AudioSource;

    ///在全局音量基础上的音量缩放
    public volumeScale: number;
}

class MapList<T>
{
    private _list: { [key: string]: T[] } = {};

    public get topKey() {
        let keys = Object.keys(this._list);
        if (keys.length > 0) return parseFloat(keys[keys.length - 1]);
        return -1;
    }

    public get topValue() {
        let topKey = this.topKey;
        if (topKey) {
            let v = this._list[topKey];
            if (v?.length > 0) {
                return v[v.length - 1];
            }
        }
        return undefined;

    }

    public isTop(key: number, item: T) {
        let topKey = this.topKey;
        if (topKey === undefined) return false;
        let topValue = this.topValue;
        if (topValue === undefined) return false;
        return key == topKey && item == topValue;
    }

    public get count() {

        let cnt = 0;
        let keys = Object.keys(this._list);
        keys.forEach(v => {
            let arr = this._list[v];
            if (arr) cnt += arr.length;
        });
        return cnt;
    }

    public clear() {
        this._list = {};
    }

    public push(key: number, item: T) {
        if (!this._list[key]) this._list[key] = [];
        this._list[key].push(item);
    }

    public remove(key: number, item: T) {
        let arr = this._list[key];
        if (arr) {
            let index = arr.indexOf(item);
            if (index > -1) {
                this._list[key] = arr.splice(index, 1);
                if (this._list[key].length == 0) delete this._list[key];
            }
        }
    }

    public contains(key: number, item: T) {
        let arr = this._list[key];
        if (arr) {
            return arr.indexOf(item) > -1;
        }
        return false;
    }

    public forEach(predicate: (item: T, key: number) => void) {
        for (const key in this._list) {
            let arr = this._list[key];
            if (arr?.length > 0) {
                arr.forEach(v => {
                    predicate && predicate(v, parseFloat(key));
                });
            }
        }
    }
}

/** 音频管理工具类 */
@ccclass("AudioMgr")
export class AudioMgr extends Component {
    public static Inst: AudioMgr;
    public mVolume: number = 1;
    public eVolume: number = 1;
    private sMusicVolume: string = "MusicVolume";
    private sEffectVolume: string = "EffectVolume";
    //当前音乐是否暂停
    private pause = false;

    //音乐的音轨栈
    public stack: MapList<string> = new MapList<string>();
    //音乐播放状态
    public music: Map<string, AudioState> = new Map<string, AudioState>();
    //单次播放音效的AudioSource
    private effectOneShot: AudioSource;
    //循环播放的音效
    private loopEffect: AudioState[] = [];

    onLoad() {
        AudioMgr.Inst = this;
        this.mVolume = StroageMgr.getValue(this.sMusicVolume, 1);
        this.eVolume = StroageMgr.getValue(this.sEffectVolume, 1);
        this.effectOneShot = this.addComponent(AudioSource);
        this.effectOneShot.volume = this.eVolume;
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
    async playMusic(location: string, priority = 0, volumeScale = 1, fadeIn = 0, fadeOut = 0, onLoadComplete?: (clip: AudioClip) => void) {
        priority = Math.max(0, priority);
        if (this.stack.isTop(priority, location)) return; //播放同样的音乐
        if (this.stack.contains(priority, location)) this.stack.remove(priority, location); //已存在则移除

        if (this.stack.count > 0 && priority >= this.stack.topKey) //暂停当前音乐
        {
            //优先级大于等于当前播放的音乐
            let nowPlayingAudioState = this.musicGet(this.stack.topKey, this.stack.topValue);
            // FadeOutMusic(fadeOut, nowPlayingAudioState, priority == stack.TopKey);
        }

        /* -------播放或恢复音乐------ */
        let audioState = this.musicGet(priority, location) ??
            new AudioState(this.addComponent(AudioSource), volumeScale);
        this.stack.push(priority, location); //加入栈中
        this.musicAdd(priority, location, audioState);
        if (audioState.audio?.isValid && audioState.audio.clip) { //恢复音乐
            if (this.stack.isTop(priority, location) && !this.pause) {
                // FadeInMusic(fadeIn, audioState);
            }
        } else { //播放音乐
            let clip = await AssetMgr.loadAsset<AudioClip>(location);
            if (!clip) return;
            if (!this.stack.isTop(priority, location)) {//未加载音乐完就已停止
                AssetMgr.DecRef(location, 1);
                return;
            }
            onLoadComplete && onLoadComplete(clip);
            audioState.audio.clip = clip;
            audioState.audio.volume = this.mVolume * volumeScale;
            audioState.audio.loop = true;
            if (!this.pause) {
                if (fadeIn > 0) {
                    audioState.audio.volume = 0;
                    audioState.audio.play();
                    // FadeInMusic(fadeIn, audioState);
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
     */
    playEffect(audio: string | AudioClip, volume = 1, args: { loop?: boolean, onStart?: (clip: AudioClip) => void, onFinished?: () => void } = {}) {
        const { loop, onStart: onStart, onFinished } = args;
        let play = (audioClip: AudioClip) => {
            this.eAudioSource.volume = this.eVolume;
            // audioClip.setLoop(loop || false);
            // audioClip.setVolume(this.eAudioSource.volume * volume);
            // audioClip.play();
            this.eAudioSource.playOneShot(audioClip, volume);
            this.playingEffect.push(audioClip);
            if (onStart) {
                onStart(audioClip);
            }
            if (!loop) {
                Tween.stopAllByTarget(audioClip);
                tween(audioClip)
                    .delay(audioClip.getDuration())
                    .call(() => {
                        onFinished && onFinished();
                        this.stopEffect(audioClip);
                    })
                    .start();
            }
        }
        if (typeof audio === "string") {
            resources.load(audio, AudioClip, (err: Error | null, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                } else {
                    play(clip);
                }
            });
        } else {
            play(audio);
        }
    }

    /** 暂停恢复音乐 */
    pauseMusic(bPause: boolean) {
        if (bPause) {
            this.mAudioSource.pause();
        } else {
            if (this.mVolume) {
                this.mAudioSource.play();
            }
        }
    }

    /** 停止播放音乐 */
    stopMusic() {
        this.mAudioSource.stop();
    }

    /** 停止播放音效 */
    stopEffect(clip?: AudioClip) {
        if (clip) {
            // clip.stop();
            let index = this.playingEffect.indexOf(clip);
            index > -1 && this.playingEffect.splice(index, 1);
        } else {
            this.playingEffect.forEach(v => {
                // v.stop();
            });
            this.playingEffect = [];
        }
    }

    /** 设置音乐音量 */
    setMusicVolume(volume: number) {
        volume = misc.clampf(volume, 0, 1);
        this.mVolume = volume;
        this.mAudioSource.volume = this.mVolume;
        app.stroage
        StroageMgr.setValue(this.musicVolumeKey, this.mVolume);
    }

    /** 设置音效音量 */
    setEffectVolume(volume: number) {
        volume = misc.clampf(volume, 0, 1);
        this.eVolume = volume;
        this.eAudioSource.volume = this.eVolume;
        StroageMgr.setValue(this.effectVolumeKey, this.eVolume);
    }
}

