import { AudioVolume } from "./AudioVolume";
/** 管理音频播放组建 */
export class AudioMgr {
    
    public static get Inst() { return createSingleton(AudioMgr); }

    /** 全局音量 */
    public readonly gVolume = new AudioVolume("Global", this.onMusicVolumeChange.bind(this), this.onEffectVolumeChange.bind(this));

    /** 保存所有音频播放组件的音量Map */
    private audioVolumeMap: Map<string, AudioVolume> = new Map();

    /** 全局音乐音量变化 刷新所有音频播放组件的音乐音量 */
    private onMusicVolumeChange() {
        this.audioVolumeMap.forEach(v => {
            v.dispatchMusicVolumeChange();
        });
    }

    /** 全局音效音量变化 刷新所有音频播放组件的音效音量 */
    private onEffectVolumeChange() {
        this.audioVolumeMap.forEach(v => {
            v.dispatchEffectVolumeChange();
        });
    }

    /** 获取音频播放组件音量配置 */
    public getAudioVolume(key: string) {
        let volume = this.audioVolumeMap.get(key);
        if (!volume) {
            volume = new AudioVolume(key);
            this.audioVolumeMap.set(key, volume);
        }
        return volume;
    }

    /** 移除音频播放组件音量配置 */
    public removeAudioVolume(key: string) {
        this.audioVolumeMap.delete(key);
    }
}