export interface IReportEvent {
    /** 默认事件名字 */
    readonly name: string;
    /** 不同打点系统的事件名字 */
    readonly eventName: Record<string, string> | undefined;
    /** 事件上报是否启用 默认为true */
    readonly enable: boolean;
    /** 事件的标记 可以根据tag来特殊处理 */
    readonly tag: string | undefined;
}

/**
 * 创建一个用于打点的事件对象
 * @param name 默认事件名字
 * @param eventName 不同打点系统的事件名字
 * @param enable 事件上报是否启用 默认为true
 * @param tag 事件的标记 可以根据tag来特殊处理
 */
export function eventObject(name: string): IReportEvent;
export function eventObject(name: string, enable: boolean): IReportEvent;
export function eventObject(name: string, tag: string): IReportEvent;
export function eventObject(name: string, eventName: Record<string, string>): IReportEvent;
export function eventObject(name: string, eventName: Record<string, string>, enable: boolean): IReportEvent;
export function eventObject(name: string, eventName: Record<string, string>, tag: string): IReportEvent;
export function eventObject(name: string, eventName: Record<string, string>, enable: boolean, tag: string): IReportEvent;

export function eventObject(name: string, arg1?: boolean | string | Record<string, string>, arg2?: boolean | string, arg3?: string): IReportEvent {
    let eventName: Record<string, string>;
    let enable: boolean;
    let tag: string;

    //arg1的判断
    if (typeof arg1 === "boolean") enable = arg1;
    else if (typeof arg1 === "string") tag = arg1;
    else if (typeof arg1 === "object") eventName = arg1;
    //arg2的判断
    if (typeof arg2 === "boolean") enable = arg2;
    else if (typeof arg2 === "string") tag = arg2;
    //arg3的判断
    if (typeof arg3 === "string") tag = arg3;

    if (enable === undefined) enable = true;

    return { name: name, eventName: eventName, enable: enable, tag: tag };
}