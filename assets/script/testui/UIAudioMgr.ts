
import { _decorator, Component, Node, EventTouch, AudioClip } from 'cc';
import { app } from '../../mlib/App';
import { UIBase } from '../../mlib/ui/UIBase';
const { ccclass, property } = _decorator;

@ccclass('UIAudioMgr')
export class UIAudioMgr extends UIBase {



    playMusic(evt: EventTouch, data: string) {
        if (data == "1") {
            app.audio.playMusic("audio/bgm1");
        } else {
            app.audio.playMusic("audio/bgm2", 1, 1);
        }
    }

    stopMusic(evt: EventTouch, data: string) {
        if (data == "1") {
            app.audio.stopMusic("audio/bgm1");
        } else {
            app.audio.stopMusic("audio/bgm2", 1);
        }
    }

    playEffect(evt: EventTouch, data: string) {
        if (data == "1") {
            app.audio.playEffect("audio/click", 1, {
                loop: false,
                release: false,
                onStart: (clip: AudioClip) => {
                    console.log("onStart playEffect1", clip);
                },
                onFinished: () => {
                    console.log("onFinished playEffect1");
                }
            });
        } else {
            app.audio.playEffect("audio/bomb", 1);
        }
    }

    playEffect1Loop(evt: EventTouch, data: string) {
        app.audio.playEffect("audio/click", 1, {
            loop: true,
            onStart: (clip: AudioClip) => {
                console.log("onStart playEffect1Loop", clip);
                this.effect1Clip = clip;
            },
            onFinished: () => {
                console.log("onFinished playEffect1Loop");
            }
        });
    }

    playOrPauseMusic() {
        if (app.audio.isPlayingMusic) {
            app.audio.pauseMusic(true);
        } else {
            app.audio.pauseMusic(false);
        }
    }

    effect1Clip: AudioClip | null = null;
    stopEffect1() {
        if (this.effect1Clip) {
            app.audio.stopEffect(this.effect1Clip);
        }
    }

    stopEffect() {
        app.audio.stopAllEffect();
    }


}
