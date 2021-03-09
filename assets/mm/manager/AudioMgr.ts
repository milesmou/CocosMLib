/** 音频枚举 */
export enum AudioKey{
    //音乐
    M_BGM = "sound/bg/bgm",
    //音效
    E_CLICK = "sound/effect/btn",
}

/** 音频管理工具类 */
export class AudioMgr {

    public bMusic: boolean = true;
    public bEffect: boolean = true;
    private sMusicKey: string = "MusicSwitch";
    private sEffectKey: string = "EffectSwitch";
    private nowMusicPath: string = null;
    private effect: number[] = [];
    private music: number = -1;

    constructor() {
        cc.game.on(cc.game.EVENT_SHOW, this.onShow, this);
        cc.game.on(cc.game.EVENT_HIDE, this.onHide, this);
        this.bMusic = cc.sys.localStorage.getItem(this.sMusicKey) + "" != "false";
        this.bEffect = cc.sys.localStorage.getItem(this.sEffectKey) + "" != "false";
    }

    onShow() {
        if (this.bMusic && cc.audioEngine.getState(this.music) == cc.audioEngine.AudioState.PAUSED) {
            cc.audioEngine.resume(this.music);
        }
        if (this.bEffect) {
            this.effect.forEach(v => {
                if (cc.audioEngine.getState(v) == cc.audioEngine.AudioState.PAUSED) {
                    cc.audioEngine.resume(v);
                }
            });
        }
    }

    onHide() {
        if (this.bMusic && cc.audioEngine.getState(this.music) == cc.audioEngine.AudioState.PLAYING) {
            cc.audioEngine.pause(this.music);
        }
        if (this.bEffect) {
            this.effect.forEach(v => {
                if (cc.audioEngine.getState(v) == cc.audioEngine.AudioState.PLAYING) {
                    cc.audioEngine.pause(v);
                }
            });
        }
    }

    /** 播放背景音乐 */
    playMusic(path: string) {
        this.nowMusicPath = path;
        if (this.bMusic) {
            this.stopMusic();
            cc.resources.load(path, cc.AudioClip, (err, clip: cc.AudioClip) => {
                if (err) {
                    console.log(err);
                    return;
                }
                this.music = cc.audioEngine.play(clip, true, 1);
            });
        }
    }

    /** 播放音效 */
    playEffect(audio: string | cc.AudioClip, loop = false, onFinished?: Function) {
        if (this.bEffect) {
            let play = clip => {
                let audioId = cc.audioEngine.play(clip, loop, 1);
                this.effect.push(audioId);
                cc.audioEngine.setFinishCallback(audioId, () => {
                    let index = this.effect.indexOf(audioId);
                    index > -1 && this.effect.splice(index, 1);
                    onFinished && onFinished();
                });
            }
            if (typeof audio === "string") {
                let onComplete = (err, clip: cc.AudioClip) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    play(clip);
                }
                if (audio.startsWith("http")) {
                    cc.assetManager.loadRemote(audio, cc.AudioClip, onComplete);
                } else {
                    cc.resources.load(audio, cc.AudioClip, onComplete);
                }
            } else {
                play(audio);
            }
        } else {
            onFinished && onFinished();
        }
    }

    /** 停止播放音乐 */
    stopMusic() {
        cc.audioEngine.stop(this.music);
        this.music = -1;
    }

    /** 停止播放所有音效 */
    stopEffect() {
        this.effect.forEach(v => {
            cc.audioEngine.stop(v);
        });
        this.effect = [];
    }

    /** 设置音乐开关 */
    openMusic(open: boolean) {
        if (this.bMusic == open) return;
        this.bMusic = open;
        if (open) {
            if (cc.audioEngine.getState(this.music) == cc.audioEngine.AudioState.PAUSED) {
                cc.audioEngine.resume(this.music);
            } else {
                this.playMusic(this.nowMusicPath);
            }
        } else {
            cc.audioEngine.pause(this.music);
        }
        cc.sys.localStorage.setItem(this.sMusicKey, this.bMusic);
    }

    /** 设置音效开关 */
    openEffect(open: boolean) {
        if (this.bEffect == open) return;
        this.bEffect = open;
        if (!open) {
            this.stopEffect();
        }
        cc.sys.localStorage.setItem(this.sEffectKey, this.bEffect);
    }

    setMusicVolume(volume: number, tweenDur = 0) {
        if (this.music != -1) {
            volume = cc.misc.clamp01(volume);
            if (tweenDur == 0) {
                cc.audioEngine.setVolume(this.music, volume);
            } else {
                let obj = { v: cc.audioEngine.getVolume(this.music) };
                cc.tween(obj).to(tweenDur, { v: volume }, {
                    progress: (start, end, current, ratio) => {
                        let v = start + (end - start) * ratio;
                        cc.audioEngine.setVolume(this.music, v);
                        return v;
                    }
                }).start();
            }
        }
    }

    setEffectVolume(volume: number) {
        volume = cc.misc.clamp01(volume);
        this.effect.forEach(v => {
            cc.audioEngine.setVolume(v, volume);
        });
    }

}
