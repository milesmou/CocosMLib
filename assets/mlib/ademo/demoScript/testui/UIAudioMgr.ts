
import { AudioClip, EventTouch, _decorator } from 'cc';
import { App } from '../../../App';
import { UIBase } from '../../../ui/UIBase';

const { ccclass, property } = _decorator;

@ccclass('UIAudioMgr')
export class UIAudioMgr extends UIBase {



    playMusic(evt: EventTouch, data: string) {
        if (data == "1") {
            App.audio.playMusic("testaudio/bgm1");
        } else {
            App.audio.playMusic("testaudio/bgm2", 1, 1);
        }
    }

    stopMusic(evt: EventTouch, data: string) {
        if (data == "1") {
            App.audio.stopMusic("testaudio/bgm1");
        } else if (data == "2") {
            App.audio.stopMusic("testaudio/bgm2", 1);
        } else if (data == "3") {
            App.audio.stopMusic();
        }
    }

    playEffect(evt: EventTouch, data: string) {
        if (data == "1") {
            App.audio.playEffect("testaudio/click", 1, {
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
            App.audio.playEffect("testaudio/bomb", 1);
        }
    }

    playEffect1Loop(evt: EventTouch, data: string) {
        App.audio.playEffect("testaudio/click", 1, {
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
        if (App.audio.isPlayingMusic) {
            App.audio.pauseMusic(true);
        } else {
            App.audio.pauseMusic(false);
        }
    }

    effect1Clip: AudioClip | null = null;
    stopEffect1() {
        if (this.effect1Clip) {
            App.audio.stopEffect(this.effect1Clip);
        }
    }

    stopEffect() {
        App.audio.stopAllEffect();
    }


}
