import { StroageValue } from "../stroage/StroageValue";

export class AudioConfig {

    /** 音乐音量 [0,1] */
    public mVolume: StroageValue<number>;
    /** 音效音量 [0,1] */
    public eVolume: StroageValue<number>;

    public constructor(key?: string, onMusicVolumeChange?: () => void, onEffectVolumeChange?: () => void) {
        this.mVolume = new StroageValue("MusicVolume_" + (key || "Global"), 1, onMusicVolumeChange);
        this.eVolume = new StroageValue("EffectVolume_" + (key || "Global"), 1, onEffectVolumeChange);
    }
}