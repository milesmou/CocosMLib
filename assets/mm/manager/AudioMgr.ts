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

    /** 背景音乐栈 第一个元素是主BGM会特殊处理 */
    private music: number[] = [];
    /** 正在播放的音效 */
    private effect: number[] = [];

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
     * @param isMainMusic isMainMusic=true时会清空所有音乐,然后将当前音乐设为主BGM 
     * @param mode (isMainMusic=true时,此字段无效) Replace:停止上一个音乐 Additive:暂停上一个音乐,等当前音乐停止后,自动播放上一个音乐 
     * @param fadeIn 当前音乐渐入时间
     * @param fadeOut 上一个音乐渐出时间
     */
    playMusic(audio: string, params?: { isMainMusic?: boolean, mode?: "Replace" | "Additive", fadeIn?: number, fadeOut?: number, onStart?: (audioId: number) => void }) {
        let { isMainMusic, mode, fadeIn, fadeOut, onStart } = params || {};
        isMainMusic = isMainMusic !== undefined ? isMainMusic : false;
        mode = mode || "Replace";
        fadeIn = fadeIn || 0;
        fadeOut = fadeOut || 0;
        //播放主BGM,清空原来的
        if (isMainMusic) {
            this.stopAllMusic(fadeOut);
        }
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
            let audioId = -1;
            if (fadeIn > 0) {
                audioId = cc.audioEngine.play(clip, true, this.mVolume);
            } else {
                audioId = cc.audioEngine.play(clip, true, 0);
                Utils.tweenTo(0, this.mVolume, fadeOut,
                    (v) => {
                        cc.audioEngine.setVolume(audioId, v);
                    });
            }
            this.music.push(audioId);
            onStart && onStart(audioId);
        });
    }

    /**
     * 播放音效
     * loop=true时 不会触发onFinished
     */
    playEffect(audio: string | cc.AudioClip, params?: { loop?: boolean, onStart?: (audioId: number) => void, onFinished?: () => void }) {
        let { loop, onStart, onFinished } = params || {};
        loop = loop != undefined ? loop : false;
        let play = clip => {
            let audioId = cc.audioEngine.play(clip, loop, this.eVolume);
            onStart && onStart(audioId);
            this.effect.push(audioId);
            if (!loop) {
                cc.audioEngine.setFinishCallback(audioId, () => {
                    let index = this.effect.indexOf(audioId);
                    index > -1 && this.effect.splice(index, 1);
                    onFinished && onFinished();
                });
            }
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
     * 暂停或恢复当前音乐
     * @param pause true:暂停音乐 false:恢复音乐
     * @param dur 渐变时间
     */
    pauseMusic(pause: boolean, dur = 0) {
        if (this.music.length > 0) {
            let audioId = this.music[this.music.length - 1];
            if (pause) {
                if (dur > 0) {
                    Utils.tweenTo(this.mVolume, 0, dur,
                        v => {
                            cc.audioEngine.setVolume(audioId, v);
                        }, () => {
                            cc.audioEngine.pause(audioId);
                        })
                } else {
                    cc.audioEngine.pause(audioId);
                }
            } else {
                if (dur > 0) {
                    cc.audioEngine.setVolume(audioId, 0);
                    cc.audioEngine.resume(audioId);
                    Utils.tweenTo(0, this.mVolume, dur,
                        v => {
                            cc.audioEngine.setVolume(audioId, v);
                        });
                } else {
                    cc.audioEngine.resume(audioId);
                }
            }

        }
    }

    /** 
     * 强制恢复主BGM,清空其它音乐
     * @param fadeIn 主音乐渐入时间
     * @param fadeOut 其它音乐渐出时间
     */
    forceToMainMusic(params?: { fadeIn?: number, fadeOut?: number }) {
        let { fadeIn, fadeOut } = params || {};
        fadeIn = fadeIn || 0;
        fadeOut = fadeOut || 0;

        if (this.music.length > 0) {
            this.music.forEach((v, i) => {
                if (i == 0) {//主BGM
                    if (fadeIn > 0) {
                        cc.audioEngine.setVolume(v, 0);
                        cc.audioEngine.resume(v);
                        Utils.tweenTo(this.mVolume, 0, fadeOut,
                            volume => {
                                cc.audioEngine.setVolume(v, volume);
                            });
                    } else {
                        cc.audioEngine.resume(v);
                    }
                } else {
                    if (cc.audioEngine.getState(v) == cc.audioEngine.AudioState.PLAYING && fadeOut > 0) {
                        Utils.tweenTo(this.mVolume, 0, fadeOut,
                            volume => {
                                cc.audioEngine.setVolume(v, volume);
                            }, () => {
                                cc.audioEngine.stop(v);
                            });
                    } else {
                        cc.audioEngine.stop(v);
                    }
                }
            });
            this.music = [this.music[0]];
        }
    }

    /**
     *  停止播放当前音乐
     * @param autoPlay 是否自动播放上一个音乐 默认为true
     * @param fadeIn 上一个音乐渐入时间
     * @param fadeOut 当前音乐渐出时间
     */
    stopMusic(params?: { autoPlay?: boolean, fadeIn?: number, fadeOut?: number }) {
        let { autoPlay, fadeOut, fadeIn } = params || {};
        autoPlay = autoPlay === undefined ? true : autoPlay;
        fadeOut = fadeOut || 0;
        fadeIn = fadeIn || 0;

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
        if (autoPlay && this.music.length > 0) {
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

    /** 
     * 停止播放指定音效
     */
    stopEffect(audioId: number) {
        cc.audioEngine.stop(audioId);
        let index = this.effect.indexOf(audioId);
        index > -1 && this.effect.splice(index, 1);
    }

    /** 
    * 停止播放所有音效
    */
    stopAllEffect() {
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
