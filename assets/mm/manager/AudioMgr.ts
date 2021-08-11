import { Utils } from "../utils/Utils";

/** 音频枚举 */
export enum AudioKey {
    //音乐
    M_BGM = "bgm",
    //音效
    E_CLICK = "btn",
}

/** 音频管理工具类 */
export class AudioMgr {

    public mVolume = 1;
    public eVolume = 1;

    private sMusicVolume: string = "MusicVolume";
    private sEffectVolume: string = "EffectVolume";

    private pathSuffix = "audio/";

    /** 当前正在播放的音效 */
    private effect: number[] = [];
    /** 背景音乐栈 */
    private music: number[] = [];

    constructor() {
        cc.game.on(cc.game.EVENT_SHOW, this.onShow, this);
        cc.game.on(cc.game.EVENT_HIDE, this.onHide, this);
        let mVolume = parseFloat(cc.sys.localStorage.getItem(this.sMusicVolume));
        this.mVolume = !isNaN(mVolume) ? mVolume : 1;
        let eVolume = parseFloat(cc.sys.localStorage.getItem(this.sEffectVolume));
        this.eVolume = !isNaN(eVolume) ? eVolume : 1;
    }

    onShow() {
        if (this.music.length > 0) {
            let audioId = this.music[this.music.length - 1];
            if (cc.audioEngine.getState(audioId) == cc.audioEngine.AudioState.PAUSED) {
                cc.audioEngine.resume(audioId);
            }
        }
        if (this.effect.length > 0) {
            this.effect.forEach(v => {
                if (cc.audioEngine.getState(v) == cc.audioEngine.AudioState.PAUSED) {
                    cc.audioEngine.resume(v);
                }
            });
        }
    }

    onHide() {
        if (this.music.length > 0) {
            let audioId = this.music[this.music.length - 1];
            if (cc.audioEngine.getState(audioId) == cc.audioEngine.AudioState.PLAYING) {
                cc.audioEngine.pause(audioId);
            }
        }
        if (this.effect.length > 0) {
            this.effect.forEach(v => {
                if (cc.audioEngine.getState(v) == cc.audioEngine.AudioState.PLAYING) {
                    cc.audioEngine.pause(v);
                }
            });
        }
    }

    /** 
     * 播放背景音乐
     * mode Replace:替换上一个音乐 Additive:暂停上一个音乐,等当前音乐停止后,自动播放上一个音乐
     * fadeIn 当前音乐渐入时间
     * fadeOut 上一个音乐渐出时间
     */
    playMusic(audio: string, params?: { mode?: "Replace" | "Additive", fadeIn?: number, fadeOut?: number }) {
        let { mode, fadeIn, fadeOut } = params || {};
        mode = mode || "Replace";
        fadeIn = fadeIn || 0;
        fadeOut = fadeOut || 0;
        //处理上一个音乐
        if (this.music.length > 0) {
            let audioId = this.music[this.music.length - 1];
            if (mode == "Replace") { this.music.pop(); }
            let func = () => {
                if (mode == "Replace") {
                    cc.audioEngine.stop(audioId);
                } else {
                    cc.audioEngine.pause(audioId)
                }
            }
            if (fadeOut > 0) {
                Utils.tweenTo(this.mVolume, 0, fadeOut,
                    (v) => {
                        cc.audioEngine.setVolume(audioId, v);
                    },
                    () => {
                        func();
                    });
            } else {
                func();
            }
        }
        //播放当前音乐
        cc.resources.load(this.pathSuffix + audio, cc.AudioClip, (err, clip: cc.AudioClip) => {
            if (err) {
                console.log(err);
                return;
            }
            if (fadeIn > 0) {
                this.music.push(cc.audioEngine.play(clip, true, this.mVolume));
            } else {
                let audioId = cc.audioEngine.play(clip, true, 0);
                this.music.push(audioId);
                Utils.tweenTo(0, this.mVolume, fadeOut,
                    (v) => {
                        cc.audioEngine.setVolume(audioId, v);
                    })
            }
        });
    }

    /** 播放音效 */
    playEffect(audio: string | cc.AudioClip, loop = false, onFinished?: Function) {
        let play = clip => {
            let audioId = cc.audioEngine.play(clip, loop, this.eVolume);
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
                cc.resources.load(this.pathSuffix + audio, cc.AudioClip, onComplete);
            }
        } else {
            play(audio);
        }
    }

    /**
     *  停止播放当前音乐
     *  fadeOut 上一个音乐渐出时间
     *  fadeIn 当前音乐渐入时间
     */
    stopMusic(fadeOut = 0, fadeIn = 0) {
        //停止当前音乐
        if (this.music.length > 0) {
            let audioId = this.music.pop();
            if (fadeOut > 0) {
                Utils.tweenTo(this.mVolume, 0, fadeOut,
                    (v) => {
                        cc.audioEngine.setVolume(audioId, v);
                    },
                    () => {
                        cc.audioEngine.stop(audioId);
                    }
                )
            } else {
                cc.audioEngine.stop(audioId);
            }
        }
        //恢复上一个音乐
        if (this.music.length > 0) {
            let audioId = this.music[this.music.length - 1];
            if (fadeIn > 0) {
                cc.audioEngine.setVolume(audioId, 0);
                cc.audioEngine.resume(audioId);
                Utils.tweenTo(0, this.mVolume, fadeOut,
                    (v) => {
                        cc.audioEngine.setVolume(audioId, v);
                    }
                )
            } else {
                cc.audioEngine.resume(audioId);
            }
        }
    }

    /**
     *  停止播放所有音乐
     *  fadeOut 音乐渐出时间
     */
    stopAllMusic(fadeOut = 0) {
        if (this.music.length > 0) {
            if (fadeOut > 0) {
                this.music.forEach(id => {
                    Utils.tweenTo(this.mVolume, 0, fadeOut,
                        (v) => {
                            cc.audioEngine.setVolume(id, v);
                        },
                        () => {
                            cc.audioEngine.stop(id);
                        });
                })
            } else {
                this.music.forEach(id => {
                    cc.audioEngine.stop(id);
                })
            }
            this.music.length = 0;
        }
    }

    /** 停止播放所有音效 */
    stopEffect() {
        this.effect.forEach(v => {
            cc.audioEngine.stop(v);
        });
        this.effect = [];
    }

    /** 设置音乐音量 */
    setMusicVolume(volume: number, dur = 0) {
        volume = cc.misc.clamp01(volume);
        if (this.music.length > 0) {
            if (dur > 0) {
                this.music.forEach(id => {
                    Utils.tweenTo(this.mVolume, volume, dur, (v) => {
                        cc.audioEngine.setVolume(id, v);
                    });
                })
            } else {
                this.music.forEach(id => {
                    cc.audioEngine.setVolume(id, volume);
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
            cc.audioEngine.setVolume(v, volume);
        });
        this.eVolume = volume;
        cc.sys.localStorage.setItem(this.sEffectVolume, volume);
    }

}
