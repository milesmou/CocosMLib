import { Utils } from "../utils/Utils";

/** 音频枚举 */
export enum AudioKey {
    //音乐
    M_BGM = "bgm",
    //音效
    E_CLICK = "btn",
}

export enum AudioTrack {
    Quest = 10000,
    AVG,
    Battle,
}

/** 音频管理工具类 */
export class AudioMgr {

    public mVolume = 1;
    public eVolume = 1;

    private sMusicVolume: string = "MusicVolume";
    private sEffectVolume: string = "EffectVolume";

    private pathSuffix = "audio/";

    /** 音乐的音轨栈 */
    private track: number[] = [];
    /** 音轨的音频文件名 */
    private trackAudio: { [track: number]: string } = {};
    /** 音轨的音乐播放状态 */
    private music: { [track: number]: number } = {};
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
        let keys = Object.keys(this.music);
        if (keys.length > 0) {
            let audioId = this.music[keys[keys.length - 1]];
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
        let keys = Object.keys(this.music);
        if (keys.length > 0) {
            let audioId = this.music[keys[keys.length - 1]];
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
     * @param track 音乐所属轨道,默认为0,表示为主BGM (每个音轨对应一个AudioClip)
     * @param fadeIn 当前音乐渐入时间
     * @param fadeOut 上一个音乐渐出时间
     */
    playMusic(audio: string, params?: { track?: number, fadeIn?: number, fadeOut?: number, onStart?: (audioId: number) => void }) {
        let { track, fadeIn, fadeOut, onStart } = params || {};
        track = track || 0;
        fadeIn = fadeIn || 0;
        fadeOut = fadeOut || 0;
        if (track == this.track[this.track.length - 1] && this.trackAudio[track] == audio) return;//播放同样的音乐
        //播放主BGM,清空所有
        if (track == 0) {
            this.stopAllMusic(fadeOut);
        }
        if (this.track.length > 0) {//正在播放音乐
            let stop = false;//停止同一音轨播放的音乐
            let nowPlayAudioId = this.music[this.track[this.track.length - 1]];
            if (this.track.includes(track)) {
                stop = true;
                Utils.delItemFromArray(this.track, track);
            }
            if (fadeOut > 0) {
                Utils.tweenTo(this.mVolume, 0, fadeOut,
                    (v) => {
                        cc.audioEngine.setVolume(nowPlayAudioId, v);
                    },
                    () => {
                        stop ? cc.audioEngine.stop(nowPlayAudioId) : cc.audioEngine.pause(nowPlayAudioId);
                    });
            } else {
                stop ? cc.audioEngine.stop(nowPlayAudioId) : cc.audioEngine.pause(nowPlayAudioId);
            }
        }
        //播放当前音乐
        this.track.push(track);
        this.trackAudio[track] = audio;
        cc.resources.load(this.pathSuffix + audio, cc.AudioClip, (err, clip: cc.AudioClip) => {
            if (err) {
                cc.log(err);
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
            this.music[track] = audioId;
            onStart && onStart(audioId);
        });
        // console.log("play",this.track);

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
                    cc.log(err);
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
        if (this.track.length > 0) {
            let audioId = this.music[this.track[this.track.length - 1]];
            if (pause) {
                if (cc.audioEngine.getVolume(audioId) == 0) return;
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
                if (cc.audioEngine.getVolume(audioId) == this.mVolume) return;
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
        console.log("pause", pause);
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
        if (this.track.length > 0) {
            for (const track in this.music) {
                const v = this.music[track];
                if (track == "0") {//主BGM
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
            }

            this.track = [this.track[0]];
            this.music = { 0: this.music[0] };
        }
    }

    /**
     *  停止播放当前音乐
     * @param track 停止指定音轨的音乐(默认停止最后一轨)
     * @param autoPlay 是否自动播放上一个音乐 默认为true
     * @param fadeIn 上一个音乐渐入时间
     * @param fadeOut 当前音乐渐出时间
     */
    stopMusic(params?: { track?: number, autoPlay?: boolean, fadeIn?: number, fadeOut?: number }) {
        let { track, autoPlay, fadeOut, fadeIn } = params || {};
        track = track || this.track[this.track.length - 1];
        autoPlay = autoPlay === undefined ? true : autoPlay;
        fadeOut = fadeOut || 0;
        fadeIn = fadeIn || 0;
        //停止当前音乐
        if (this.track.length > 0) {
            let audioId = this.music[track];
            if (isNaN(audioId)) return;
            Utils.delItemFromArray(this.track, track);
            delete this.trackAudio[track];
            delete this.music[track];
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
        if (autoPlay && this.track.length > 0) {
            let audioId = this.music[this.track[this.track.length - 1]];
            if (fadeIn > 0) {
                cc.audioEngine.setVolume(audioId, 0);
                cc.audioEngine.resume(audioId);
                Utils.tweenTo(0, this.mVolume, fadeIn,
                    (v) => {
                        cc.audioEngine.setVolume(audioId, v);
                    }
                )
            } else {
                cc.audioEngine.resume(audioId);
            }
        }
        console.log("stop", this.track);
    }

    /**
     *  停止播放所有音乐
     *  fadeOut 音乐渐出时间
     */
    stopAllMusic(fadeOut = 0) {
        if (this.track.length > 0) {
            if (fadeOut > 0) {
                for (const track in this.music) {
                    let id = this.music[track];
                    Utils.tweenTo(this.mVolume, 0, fadeOut,
                        (v) => {
                            cc.audioEngine.setVolume(id, v);
                        },
                        () => {
                            cc.audioEngine.stop(id);
                        });
                }
            } else {
                for (const track in this.music) {
                    let id = this.music[track];
                    cc.audioEngine.stop(id);
                }
            }
            this.track.length = 0;
            this.trackAudio = {};
            this.music = {};
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
        if (this.track.length > 0) {
            if (dur > 0) {
                this.track.forEach(trackId => {
                    let id = this.music[trackId];
                    Utils.tweenTo(this.mVolume, volume, dur, (v) => {
                        cc.audioEngine.setVolume(id, v);
                    });
                })
            } else {
                this.track.forEach(trackId => {
                    let id = this.music[trackId];
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
