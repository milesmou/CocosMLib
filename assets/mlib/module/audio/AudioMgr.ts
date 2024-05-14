import { AudioVolume } from "./AudioVolume";
import { IAudioComponent } from "./IAudioComponent";
/** 管理音频播放组建 */
export class AudioMgr {

    /** 全局音量 */
    public static globalVolume = new AudioVolume(null, this.onGlobalMusicVolumeChange.bind(this), this.onGlobalEffectVolumeChange.bind(this));
    /** 保存所有音频播放组件的Map */
    private static audioCompMap: Map<string, IAudioComponent> = new Map();

    /** 全局音乐音量变化 刷新所有音频播放组件的音乐音量 */
    private static onGlobalMusicVolumeChange() {
        this.audioCompMap.forEach(v => {
            v.refreshMusicVolume();
        });
    }

    /** 全局音效音量变化 刷新所有音频播放组件的音效音量 */
    private static onGlobalEffectVolumeChange() {
        this.audioCompMap.forEach(v => {
            v.refreshEffectVolume();
        });
    }

    /** 添加音频播放组件进行管理 */
    public static add(key: string, audioComp: IAudioComponent) {
        this.audioCompMap.set(key, audioComp);
    }

    /** 从管理列表移除音频播放组件 */
    public static remove(key: string) {
        this.audioCompMap.delete(key);
    }

    /** 获取音频播放组件 */
    public static get(key: string) {
        return this.audioCompMap.get(key);
    }

}