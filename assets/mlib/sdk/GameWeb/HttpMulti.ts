import { HttpMisc } from "./Misc/HttpMisc";
import { HttpPurchase } from "./Purchase/HttpPurchase";
import { HttpTrackEvent } from "./TrackEvent/HttpTrackEvent";

/** 对某些模块的一些方法进行封装 */
export class HttpMulti {

    /** 是否启用事件上报 */
    public static enableEventReport = false;

    /** 事件上报 */
    public static reportEvent(reqData: HttpTrackEventModel.TrackEvent) {
        if (!this.enableEventReport) return;
        HttpTrackEvent.reportEvent(reqData);
    }

    /** 
     * 轮询订单是否存在
     * @param userId 用户ID
     * @param orderId 自定义订单ID
     * @param duration 轮询时间，单位秒
     * @returns 是否存在
     */
    public static async pollingOrder(userId: string, orderId: string, duration: number) {

        let now = Date.now();
        let endTimeMS = now + duration * 1000;
        while (true) {
            let result = await HttpPurchase.queryOrder(userId, orderId);
            if (result?.code == 0 && result.data) {
                return true
            } else {
                if (Date.now() < endTimeMS) {
                    await app.timer.dealy(0.5);//延迟0.5秒
                } else {
                    break
                }
            }

        }
        return false;
    }

}

// @ts-ignore
globalThis.mExecption = HttpMisc.execption;

declare global {
    /** 上报异常 */
    const mExecption: (data: HttpMiscModel.ReqCustExecption) => void;
}