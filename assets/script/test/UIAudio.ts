import { app } from "../../mm/App";
import UIBase from "../../mm/ui/UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIAudio extends UIBase {

    @property(cc.Label)
    musicState: cc.Label = null;


    onDisable() {
        app.audio.stopAllMusic();
    }

    onClickPauseOrResume(evt, data) {
        if (data == "1") {
            app.audio.pauseMusic(true);
        } else {
            app.audio.pauseMusic(false);
        }
    }

    stopAllMusic() {
        app.audio.stopAllMusic();
    }

    /* 测试音乐播放 */
    onClickPlayMusic1(evt, data: string) {
        app.audio.playMusic(data, { track: 1 });
    }

    onClickPlayMusic2(evt, data: string) {
        app.audio.playMusic(data, { track: 2 });
    }

    onClickPlayMusic3(evt, data: string) {
        app.audio.playMusic(data, { track: 10003 });
    }

    onClickPlayMusic4(evt, data: string) {
        app.audio.playMusic(data, { track: 10004 });
    }

    stopMusic(evt, data: string) {
        let trackId = parseInt(data);
        if (trackId > 2) {
            trackId += 10000;
        }
        app.audio.stopMusic({ track: trackId });
    }

    update(dt: number) {
        let str0 = "优先级0 [";
        let str1 = "优先级1 [";
        app.audio['stack'].forEach(v => {
            let priority = Math.floor(v / 10000);
            let id = v % 10000;
            let state = app.audio['music'].get(v);
            if (state?.audio) {
                let s = ` {音乐${id} Clip=${state.clip} IsPlaying=${state.audio.isPlaying}} `
                if (priority == 0) {
                    str0 += s;
                } else {
                    str1 += s;
                }
            }
        })
        str0 += "]\n";
        str1 += "]";
        this.musicState.string = str0 + str1;
    }



    /* 测试音效播放 */
    playEff1() {
        app.audio.playEffect("effect1");
    }
    playEff2() {
        app.audio.playEffect("effect2");
    }
    loopAudioSource: cc.AudioSource[];
    playLoopEff() {
        app.audio.playEffect("effect3", { loop: true, onStart: (audio) => { this.loopAudioSource.push(audio) } });
    }
    stopLoopEff() {
        this.loopAudioSource.forEach(v => app.audio.stopEffect(v));
        this.loopAudioSource.length = 0;
    }
    stopAllEff() {
        app.audio.stopAllEffect();
    }

}
