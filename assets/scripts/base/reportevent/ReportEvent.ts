import { IReportEvent } from "../../../mlib/sdk/IReportEvent";

/**
 * @param defaultName 默认事件名字
 * @param eventName 不同打点系统的事件名字
 * @param enable 事件上报是否启用 默认为true
 * @returns 打点事件对象
 */
function EventObject(defaultName: string, eventName?: { [key: string]: string; }, enable?: boolean): IReportEvent {
    return { defaultName: defaultName, eventName: eventName, enable: enable };
}

/** 所有的打点事件 */
const ReportEvent = {
    /** 初始化SDK */
    InitSDK: EventObject("InitSDK"),
    /** 引导步骤 */
    GuideStep: EventObject("GuideStep"),
    /** 开始请求内购 */
    IapStart: EventObject("IapStart"),
    /** 内购失败 */
    IapFail: EventObject("IapFail"),
    ///其它打点事件
};

///@ts-ignore
globalThis.mReportEvent = ReportEvent;
declare global {
    /** 所有的打点事件 */
    const mReportEvent: typeof ReportEvent;
}