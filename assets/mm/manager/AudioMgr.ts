import { _decorator, AudioClip, Component, AudioSource, resources, misc, Tween, tween } from 'cc';
import { app } from '../App';

const { ccclass } = _decorator;

/** 音频枚举 */
export enum AudioKey {
    //音乐
    M_BGM1 = "sound/bgm1",
    M_BGM2 = "sound/bgm2",
    //音效
    E_Click = "sound/click",
    E_Bomb = "sound/bomb",
}


/** 音频管理工具类 */
@ccclass("AudioMgr")
export class AudioMgr extends Component {
    public static Inst: AudioMgr;
    public mVolume: number = 1;
    public eVolume: number = 1;

    private mAudioSource!: AudioSource;
    private eAudioSource!: AudioSource;

    private playingEffect: AudioClip[] = [];
    public get isPlayingMusic() { return this.mAudioSource.playing; }

    onLoad() {
        AudioMgr.Inst = this;
        this.mAudioSource = this.addComponent(AudioSource)!;
        this.mAudioSource.loop = true;
        this.mAudioSource.playOnAwake = false;
        this.eAudioSource = this.addComponent(AudioSource)!;
        this.eAudioSource.loop = false;
        this.eAudioSource.playOnAwake = false;
    }

    start() {
        this.mVolume = app.stroage.getNumber(app.stroageKey.MusicVolume, 1);
        this.eVolume = app.stroage.getNumber(app.stroageKey.EffectVolume, 1);
    }

    /** 播放背景音乐 */
    playMusic(audio: string | AudioClip, volume = 1) {
        let play = (audioClip: AudioClip) => {
            this.mAudioSource.volume = this.mVolume * volume;
            this.mAudioSource.stop();
            this.mAudioSource.clip = audioClip;
            this.mAudioSource.play();
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
        app.stroage.setValue(app.stroageKey.MusicVolume, this.mVolume);
    }

    /** 设置音效音量 */
    setEffectVolume(volume: number) {
        volume = misc.clampf(volume, 0, 1);
        this.eVolume = volume;
        this.eAudioSource.volume = this.eVolume;
        app.stroage.setValue(app.stroageKey.EffectVolume, this.eVolume);
    }
}

