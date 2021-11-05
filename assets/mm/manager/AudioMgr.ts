const { ccclass, property } = cc._decorator;
import { app } from "../App";
import { BiStack } from "../collection/BiStack";
import { Utils } from "../utils/Utils";

interface AudioState {
    /** 音源组件 */
    audio: cc.AudioSource;
    /** 在全局音量基础上的音量缩放 */
    volume: number;
    /** 音频文件名 */
    clip: string;
}

/** 音轨ID */
export enum AudioTrack {
    //相同优先级的音轨在同一个子栈中 优先级=Math.floor(ID/10000)
    Main,
    Quest,
    AVG = 10000,
    Battle,
}

/** 音频管理工具类 */
@ccclass
export default class AudioMgr extends cc.Component {

    public static Inst: AudioMgr;

    public mVolume = 1;
    public eVolume = 1;

    private sMusicVolume: string = "MusicVolume";
    private sEffectVolume: string = "EffectVolume";

    private pathSuffix = "audio/";

    /** 当前音乐是否被暂停 */
    private pause = false;

    /** 音乐的音轨栈 */
    private stack = new BiStack<number>();
    /** 音轨的音乐播放状态 */
    private music: Map<number, AudioState> = new Map();
    /** 正在播放的音效 */
    private effect: AudioState[] = [];

    onLoad() {
        AudioMgr.Inst = this;
        let mVolume = parseFloat(cc.sys.localStorage.getItem(this.sMusicVolume));
        this.mVolume = !isNaN(mVolume) ? mVolume : 1;
        let eVolume = parseFloat(cc.sys.localStorage.getItem(this.sEffectVolume));
        this.eVolume = !isNaN(eVolume) ? eVolume : 1;
    }

    /** 
     * 播放背景音乐
     * @param track 音乐所属轨道(每个音轨对应一个AudioClip)
     * @param fadeIn 当前音乐渐入时间
     * @param fadeOut 上一个音乐渐出时间
     */
    playMusic(audio: string, params: { track: number, volume?: number, fadeIn?: number, fadeOut?: number }) {
        let { track, volume, fadeIn, fadeOut } = params;
        volume = cc.misc.clamp01(volume == undefined ? 1 : volume);
        fadeIn = fadeIn || 0;
        fadeOut = fadeOut || 0;
        if (this.stack.top == track && this.music.get(track).clip == audio) return;//播放同样的音乐
        let priority = Math.floor(track / 10000);
        if (this.stack.length > 0) {//处理正在播放的音乐
            if (this.stack.includes(track)) {
                let trackAudioState = this.music.get(track);
                if (this.stack.top == track) {
                    this.music.delete(track);
                    this.fadeOutMusic(fadeOut, trackAudioState?.audio, true);
                } else {
                    if (trackAudioState.clip != audio) {
                        this.music.delete(track);
                        this.fadeOutMusic(0, trackAudioState?.audio, true);
                    }
                    if (priority >= Math.floor(this.stack.top / 10000)) {//优先级大于等于当前播放的音乐
                        let nowPlayingAudioState = this.music.get(this.stack.top);
                        this.fadeOutMusic(fadeOut, nowPlayingAudioState?.audio);
                    }
                }
                this.stack.delItem(track);
            } else {
                if (priority >= Math.floor(this.stack.top / 10000)) {//优先级大于等于当前播放的音乐
                    let nowPlayingAudioState = this.music.get(this.stack.top);
                    this.fadeOutMusic(fadeOut, nowPlayingAudioState?.audio);
                }
            }
        }
        this.stack.push(priority, track);
        /* -------播放或恢复音乐------ */
        let audioState: AudioState = this.music.get(track) || { audio: null, volume: volume, clip: null };
        audioState.clip = audio;
        audioState.volume = volume;
        this.music.set(track, audioState);
        if (audioState.audio) {//恢复音乐
            if (this.stack.top == track && !this.pause) {
                this.fadeInMusic(fadeIn, audioState);
            }
        } else {//重新播放音乐
            app.res.load(this.pathSuffix + audio, cc.AudioClip).then(clip => {
                let nowState = this.music.get(track);//当前的状态
                if (!nowState) return;//前一个BGM未加载成功，就已停止播放
                if (nowState.clip != audio) return;//前一个BGM未加载成功，就已播放另一个BGM
                if (nowState.audio) return//重复播放相同的音频
                clip.addRef();
                nowState.audio = this.addComponent(cc.AudioSource);
                nowState.audio.clip = clip;
                nowState.audio.volume = this.mVolume * volume;
                nowState.audio.loop = true;
                if (fadeIn > 0) {
                    if (this.stack.top == track && !this.pause) {
                        nowState.audio.volume = 0;
                        nowState.audio.play();
                        this.fadeInMusic(fadeIn, nowState);
                    }
                } else {
                    if (this.stack.top == track && !this.pause) {
                        nowState.audio.play();
                    }
                }
            });
        }
    }

    /**
     * 播放音效
     * loop=true时 不会触发onFinished
     */
    playEffect(audio: string, params?: { volume?: number, loop?: boolean, onStart?: (audioSource: cc.AudioSource) => void, onFinished?: () => void }) {
        let { volume, loop, onStart, onFinished } = params || {};
        volume = cc.misc.clamp01(volume == undefined ? 1 : volume);
        loop = loop == undefined ? false : loop;
        let audioState: AudioState = { audio: this.addComponent(cc.AudioSource), volume: volume, clip: audio };
        this.effect.push(audioState);
        app.res.load(this.pathSuffix + audio, cc.AudioClip).then(clip => {
            if (!this.effect.includes(audioState)) return;//已被停止
            audioState.audio.clip = clip;
            audioState.audio.volume = this.eVolume * volume;
            audioState.audio.loop = loop;
            audioState.audio.play();
            onStart && onStart(audioState.audio);
            if (!loop) {
                this.scheduleOnce(() => {
                    this.stopEffect(audioState.audio);
                    onFinished && onFinished();
                }, audioState.audio.getDuration() + 0.05);
            }
        });
    }

    /** 
     * 暂停或恢复当前音乐(注:暂停后需要手动恢复音乐,否则后续不会再播放任何音乐)
     * @param pause true:暂停音乐 false:恢复音乐
     * @param dur 渐变时间
     */
    pauseMusic(pause: boolean, dur = 0) {
        this.pause = pause;
        if (this.stack.length > 0) {
            let audioState = this.music.get(this.stack.top);
            if (pause) {
                this.fadeOutMusic(dur, audioState?.audio);
            } else {
                this.fadeInMusic(dur, audioState);
            }
        }
    }

    /**
     *  停止播放当前音乐
     * @param track 停止指定音轨的音乐
     * @param autoPlay 是否自动播放上一个音乐 默认为true
     * @param fadeIn 上一个音乐渐入时间
     * @param fadeOut 当前音乐渐出时间
     */
    stopMusic(params: { track: number, autoPlay?: boolean, fadeIn?: number, fadeOut?: number }) {
        let { track, autoPlay, fadeOut, fadeIn } = params;
        autoPlay = autoPlay === undefined ? true : autoPlay;
        fadeOut = fadeOut || 0;
        fadeIn = fadeIn || 0;
        let isTop = this.stack.top == track;
        //停止指定音轨音乐
        if (this.stack.includes(track)) {
            this.stack.delItem(track);
            let audioState = this.music.get(track);
            if (audioState) {
                this.fadeOutMusic(isTop ? fadeOut : 0, audioState.audio, true);
                this.music.delete(track);
            }
        }
        //恢复上一个音乐
        if (autoPlay && isTop && !this.pause) {
            this.pauseMusic(false, fadeIn)
        }
    }

    /**
     *  停止播放所有音乐
     *  fadeOut 音乐渐出时间
     */
    stopAllMusic(fadeOut = 0) {
        if (this.stack.length > 0) {
            this.music.forEach((v, k) => {
                this.fadeOutMusic(fadeOut, v.audio, true);
            });
            this.stack.clear();
            this.music = new Map();;
        }
    }

    /** 
     * 停止播放指定音效
     */
    stopEffect(audioSource: cc.AudioSource) {
        if (audioSource?.isValid) {
            audioSource.stop();
            audioSource.destroy();
            let index = this.effect.findIndex(v => v.audio == audioSource);
            index > -1 && this.effect.splice(index, 1);
        }
    }

    /** 
    * 停止播放所有音效
    */
    stopAllEffect() {
        this.effect.forEach(v => {
            if (v.audio?.isValid) {
                v.audio.stop();
                v.audio.destroy();
            }
        });
        this.effect = [];
    }

    /** 设置音乐音量 */
    setMusicVolume(volume: number, dur = 0) {
        volume = cc.misc.clamp01(volume);
        if (this.stack.length > 0) {
            if (dur > 0) {
                this.stack.forEach(trackId => {
                    let state = this.music.get(trackId);
                    Utils.tweenTo(this.mVolume, volume, dur, (v) => {
                        if (state.audio?.isValid) {
                            state.audio.volume = state.volume * volume;
                        }
                    });
                })
            } else {
                this.stack.forEach(trackId => {
                    let state = this.music.get(trackId);
                    state.audio.volume = state.volume * volume;
                })
            }
        }
        this.mVolume = volume;
        cc.sys.localStorage.setItem(this.sMusicVolume, volume);
    }

    /** 设置音效音量 */
    setEffectVolume(volume: number) {
        volume = cc.misc.clamp01(volume);
        this.effect.forEach(v => {
            if (v.audio?.isValid) {
                v.audio.volume = v.volume * volume;
            }
        });
        this.eVolume = volume;
        cc.sys.localStorage.setItem(this.sEffectVolume, volume);
    }

    private fadeInMusic(dur: number, audioState: AudioState) {
        if (!audioState?.audio?.isValid) return;
        let currentTime = audioState.audio.getCurrentTime();
        if (dur > 0) {
            currentTime == 0 ? audioState.audio.play() : audioState.audio.resume();
            audioState.audio.volume = 0;
            Utils.tweenTo(0, audioState.volume * this.mVolume, dur,
                v => {
                    if (audioState.audio.isValid) {
                        audioState.audio.volume = v;
                    }
                });
        } else {
            currentTime == 0 ? audioState.audio.play() : audioState.audio.resume();
        }
    }

    private fadeOutMusic(dur: number, audioSource: cc.AudioSource, stop = false) {
        if (!audioSource?.isValid) return;
        if (dur > 0) {
            Utils.tweenTo(audioSource.volume, 0, dur,
                (v) => {
                    if (audioSource.isValid) {
                        audioSource.volume = v;
                    }
                },
                () => {
                    if (audioSource.isValid) {
                        if (stop) {
                            audioSource.clip.decRef();
                            audioSource.destroy()
                        } else {
                            audioSource.pause();
                        }
                    }
                });
        } else {
            if (stop) {
                audioSource.clip.decRef();
                audioSource.destroy()
            } else {
                audioSource.pause();
            }
        }
    }

}
