export interface IReportEvent {
    /** 默认事件名字 */
    defaultName: string;
    /** 不同打点系统的事件名字 */
    eventName?: { [key: string]: string };
    /** 事件上报是否启用 默认为true */
    enable?: boolean;
}