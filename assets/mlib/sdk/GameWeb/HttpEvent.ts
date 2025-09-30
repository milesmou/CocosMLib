import { HttpTrackEvent } from "./TrackEvent/HttpTrackEvent";

export class HttpEvent {

    /** 是否启用事件上报 */
    public static enable = false;

    /** 事件上报 */
    public static reportEvent(reqData: HttpTrackEventModel.TrackEvent) {
        if (!this.enable) return;
        HttpTrackEvent.reportEvent(reqData);
    }
}