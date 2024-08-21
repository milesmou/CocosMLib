import { eventObject } from "../../../mlib/sdk/IReportEvent";

/** 所有的打点事件,值为eventObject创建的对象 */
const ReportEvent = {
    /** 初始化SDK */
    InitSDK: eventObject("InitSDK"),
    /** 引导步骤 */
    GuideStep: eventObject("GuideStep"),
    /** 开始请求内购 */
    IapStart: eventObject("IapStart"),
    /** 内购失败 */
    IapFail: eventObject("IapFail"),
    ///其它打点事件
} as const;

///@ts-ignore
globalThis.mReportEvent = ReportEvent;
declare global {
    /** 所有的打点事件 */
    const mReportEvent: typeof ReportEvent;
}