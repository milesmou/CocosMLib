import { app } from "../../mm/App";
import UIBase from "../../mm/ui/UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIAudio extends UIBase {


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

    onClickPlay() {
        app.audio.playMusic("battleBgm", { track: 0 });
        app.audio.playMusic("bgm_youxian", { track: 10000 });
        app.audio.playMusic("battleBgm", { track: 10000 });
        this.scheduleOnce(()=>{
            app.audio.playMusic("bgm_youxian", { track: 0 });

        },0.6)
        this.scheduleOnce(()=>{
            app.audio.stopMusic({track:10000})
        },3)
    }

    checkPlayingMusic() {
        console.log("当前正在播放的音乐----开始");

        let audios = cc.audioEngine["_id2audio"];
        for (const id in audios) {
            let audio = audios[id];
            if (!audio["paused"]) {
                console.log(id, audio["_src"]["name"]);
            }
        }
        console.log("当前正在播放的音乐----结束");
        console.log("");
    }
}
