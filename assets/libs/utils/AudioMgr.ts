/** 音频加载路径枚举 */
export enum EAudio {
    //音乐
    M_BGM = "sound/bgm",
    //音效
    E_CLICK = "sound/click"
}


/** 音频管理工具类 */
export class AudioMgr {
    private static inst: AudioMgr = null;
    public static get Inst() { return this.inst || (this.inst = new this()) }

    public bMusic: boolean = true;
    public bEffect: boolean = true;
    private sMusicKey: string = "MusicSwitch";
    private sEffectKey: string = "EffectSwitch";
    private nowMusicPath: string = null;
    private effect: number[] = [];
    private music: number = -1;

    private constructor() {
        cc.game.on(cc.game.EVENT_SHOW, this.onShow, this);
        cc.game.on(cc.game.EVENT_HIDE, this.onHide, this);
        this.bMusic = cc.sys.localStorage.getItem(this.sMusicKey) + "" != "false";
        this.bEffect = cc.sys.localStorage.getItem(this.sEffectKey) + "" != "false";
    }

    onShow() {
        if (cc.audioEngine.getState(this.music) == cc.audioEngine.AudioState.PAUSED) {
            cc.audioEngine.resume(this.music);
        }
        this.effect.forEach(v => {
            if (cc.audioEngine.getState(v) == cc.audioEngine.AudioState.PAUSED) {
                cc.audioEngine.resume(v);
            }
        });
    }

    onHide() {
        if (cc.audioEngine.getState(this.music) == cc.audioEngine.AudioState.PLAYING) {
            cc.audioEngine.pause(this.music);
        }
        this.effect.forEach(v => {
            if (cc.audioEngine.getState(v) == cc.audioEngine.AudioState.PLAYING) {
                cc.audioEngine.pause(v);
            }
        });
    }

    /** 播放背景音乐 */
    playMusic(path: string) {
        this.nowMusicPath = path;
        if (this.bMusic) {
            this.stopMusic();
            cc.loader.loadRes(path, cc.AudioClip, (err, clip: cc.AudioClip) => {
                if (err) {
                    console.log(err);
                    return;
                }
                this.music = cc.audioEngine.play(clip, true, 1);
            });
        }
    }

    /** 播放音效 */
    playEffect(path: string, onFinished?: Function) {
        if (this.bEffect) {
            cc.loader.loadRes(path, cc.AudioClip, (err, clip: cc.AudioClip) => {
                if (err) {
                    console.log(err);
                    return;
                }
                let audioId = cc.audioEngine.play(clip, false, 1);
                this.effect.push(audioId);
                cc.audioEngine.setFinishCallback(audioId, () => {
                    let index = this.effect.indexOf(audioId);
                    index > -1 && this.effect.splice(index, 1);
                    onFinished && onFinished();
                });
            });
        }
    }

    /** 停止播放音乐 */
    stopMusic() {
        cc.audioEngine.stop(this.music);
        this.music = -1;
    }

    /** 停止播放所有音效 */
    stopEffect() {
        this.effect.forEach(v => {
            cc.audioEngine.stop(v);
        });
        this.effect = [];
    }


    /** 设置音乐开关 */
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

    /** 设置音效开关 */
    openEffect(open: boolean) {
        if (this.bEffect == open) return;
        this.bEffect = open;
        if (!open) {
            this.stopEffect();
        }
        cc.sys.localStorage.setItem(this.sEffectKey, this.bEffect);
    }
}
