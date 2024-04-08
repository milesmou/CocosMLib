import { AudioConfig } from "./AudioConfig";

export interface IAudioComponent {
    audioConfig: AudioConfig;
    refreshMusicVolume(dur?: number);
    refreshEffectVolume();
}