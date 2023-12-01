
import { AudioClip, EventTouch, _decorator } from 'cc';
import { App } from '../../../../mlib/App';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';

const { ccclass, property } = _decorator;

@ccclass('UIAudioMgr')
export class UIAudioMgr extends UIBase {

    effect1Clip: AudioClip | null = null;

    protected onClickButton(btnName: string): void {
        switch (btnName) {
            case "playMusic1":
                App.audio.playMusic("audio/test/bgm1");
                break;
            case "playMusic2":
                App.audio.playMusic("audio/test/bgm2", 1, 1);
                break;
            case "stopMusic1":
                App.audio.stopMusic("audio/test/bgm1");
                break;
            case "stopMusic2":
                App.audio.stopMusic("audio/test/bgm2", 1);
                break;
            case "stopMusic3":
                App.audio.stopMusic();
                break;
            case "play_pause_music":
                this.playOrPauseMusic();
                break;
            case "playEffect1":
                App.audio.playEffect("audio/test/click", 1, {
                    loop: false,
                    deRef: false,
                    onStart: (clip: AudioClip) => {
                        console.log("onStart playEffect1", clip);
                    },
                    onFinished: () => {
                        console.log("onFinished playEffect1");
                    }
                });
                break;
            case "playEffect2":
                App.audio.playEffect("audio/test/bomb", 1);
                break;
            case "stopEffect":
                App.audio.stopAllEffect();
                break;
            case "playEffect1Loop":
                App.audio.playEffect("audio/test/click", 1, {
                    loop: true,
                    onStart: (clip: AudioClip) => {
                        console.log("onStart playEffect1Loop", clip);
                        this.effect1Clip = clip;
                    },
                    onFinished: () => {
                        console.log("onFinished playEffect1Loop");
                    }
                });
                break;
            case "stopPlayEffect1":
                if (this.effect1Clip) {
                    App.audio.stopEffect(this.effect1Clip);
                }
                break;
            default:
                break;
        }
    }


    playOrPauseMusic() {
        if (App.audio.isPlayingMusic) {
            App.audio.pauseMusic(true);
        } else {
            App.audio.pauseMusic(false);
        }
    }

    
    


}
