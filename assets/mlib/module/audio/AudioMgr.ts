import { AudioVolume } from "./AudioVolume";
/** 管理音频播放组建 */
export class AudioMgr {

    /** 全局音量 */
    public static readonly gVolume = new AudioVolume("Global", this.onMusicVolumeChange.bind(this), this.onEffectVolumeChange.bind(this));

    /** 保存所有音频播放组件的音量Map */
    private static audioVolumeMap: Map<string, AudioVolume> = new Map();

    /** 全局音乐音量变化 刷新所有音频播放组件的音乐音量 */
    private static onMusicVolumeChange() {
        this.audioVolumeMap.forEach(v => {
            v.dispatchMusicVolumeChange();
        });
    }

    /** 全局音效音量变化 刷新所有音频播放组件的音效音量 */
    private static onEffectVolumeChange() {
        this.audioVolumeMap.forEach(v => {
            v.dispatchEffectVolumeChange();
        });
    }

    /** 获取音频播放组件音量配置 */
    public static getAudioVolume(key: string) {
        let volume = this.audioVolumeMap.get(key);
        if (!volume) {
            volume = new AudioVolume(key);
            this.audioVolumeMap.set(key, volume);
        }
        return volume;
    }

    /** 移除音频播放组件音量配置 */
    public static removeAudioVolume(key: string) {
        this.audioVolumeMap.delete(key);
    }
}