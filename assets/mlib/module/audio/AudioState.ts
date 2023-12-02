import { AudioSource } from "cc";

export class AudioState {
    public constructor(location: string, audio: AudioSource, volumeScale: number) {
        this.location = location;
        this.audio = audio;
        this.volumeScale = volumeScale;
        this.audio.playOnAwake = false;
    }
    //音频地址
    public location: string;

    //音源组件
    public audio: AudioSource;

    //在默认音量基础上的音量缩放
    public volumeScale: number;
}