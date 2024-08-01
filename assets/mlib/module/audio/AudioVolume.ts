import { StroageValue } from "../stroage/StroageValue";

export class AudioVolume {

    /** 音乐音量 [0,1] */
    public mVolume: StroageValue<number>;
    /** 音效音量 [0,1] */
    public eVolume: StroageValue<number>;

    public constructor(key: string, onMusicVolumeChange?: () => void, onEffectVolumeChange?: () => void) {
        this.mVolume = new StroageValue("MusicVolume_" + key, 1, onMusicVolumeChange);
        this.eVolume = new StroageValue("EffectVolume_" + key, 1, onEffectVolumeChange);
    }

    /** 设置音乐音量变化监听器 */
    public setMusicVolumeListener(listener: () => void) {
        this.mVolume.onValueChange = listener;
    }

    /** 设置音效音量变化监听器 */
    public setEffectVolumeListener(listener: () => void) {
        this.eVolume.onValueChange = listener;
    }

    /** 派发音乐音量变化事件 */
    public dispatchMusicVolumeChange() {
        this.mVolume.onValueChange && this.mVolume.onValueChange();
    }

    /** 派发音效音量变化事件 */
    public dispatchEffectVolumeChange() {
        this.eVolume.onValueChange && this.eVolume.onValueChange();
    }
}