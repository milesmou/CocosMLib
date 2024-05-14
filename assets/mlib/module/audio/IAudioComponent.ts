import { AudioVolume } from "./AudioVolume";

export interface IAudioComponent {
    audioVolume: AudioVolume;
    refreshMusicVolume(dur?: number);
    refreshEffectVolume();
}