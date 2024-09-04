import { MEvent } from "./MEvent";

/** 全局事件管理工具 */
export class EventMgr2 {
    private static eventMap: Map<Function, MEvent> = new Map();
    private static strEventMap: Map<string, MEvent> = new Map();

    /** 清理所有事件 */
    public static clear() {
        EventMgr2.eventMap.clear();
        EventMgr2.strEventMap.clear();
    }

    /** 为事件注册一个回调,重复注册只保留第一次的事件 */
    public static on<T extends (...args: any[]) => void, C extends (...args: Parameters<T>) => void>(event: T, callback: C, thisObj?: object): void;
    public static on(name: string, callback: (...args: any[]) => void, thisObj?: object): void;
    public static on(arg1: string | Function, callback: (...args: any[]) => void, thisObj?: object): void {
        let event: MEvent;
        if (typeof arg1 === "string") {
            event = this.strEventMap.get(arg1);
            if (!event) {
                event = new MEvent();
                this.strEventMap.set(arg1, event);
            }
        } else {
            event = this.eventMap.get(arg1);
            if (!event) {
                event = new MEvent();
                this.eventMap.set(arg1, event);
            }
        }
        event.addListener(callback, thisObj, false);
    }

    /** 为事件注册一个回调,回调仅会触发一次,重复注册只保留第一次的事件 */
    public static once<T extends (...args: any[]) => void, C extends (...args: Parameters<T>) => void>(event: T, callback: C, thisObj?: object): void;
    public static once(name: string, callback: (...args: any[]) => void, thisObj?: object): void;
    public static once(arg1: string | Function, callback: (...args: any[]) => void, thisObj?: object): void {
        let event: MEvent;
        if (typeof arg1 === "string") {
            event = this.strEventMap.get(arg1);
            if (!event) {
                event = new MEvent();
                this.strEventMap.set(arg1, event);
            }
        } else {
            event = this.eventMap.get(arg1);
            if (!event) {
                event = new MEvent();
                this.eventMap.set(arg1, event);
            }
        }
        event.addListener(callback, thisObj, true);
    }

    /** 取消事件的某个回调，callback不传值时取消事件所有回调*/
    public static off<T extends (...args: any[]) => void, C extends (...args: Parameters<T>) => void>(event: T, callback?: C, thisObj?: object): void;
    public static off(name: string, callback?: (...args: any[]) => void, thisObj?: object): void;
    public static off(arg1: string | Function, callback?: (...args: any[]) => void, thisObj?: object): void {
        let event: MEvent;
        if (typeof arg1 === "string") {
            event = this.strEventMap.get(arg1);
        } else {
            event = this.eventMap.get(arg1);
        }
        if (event) {
            if (callback) {
                event.removeListener(callback, thisObj);
            } else {
                event.removeAllListeners();
            }
        }
    }

    /** 触发事件，参数个数不固定 */
    public static emit<T extends (...args: any[]) => void, P extends Parameters<T>>(event: T, ...args: P): void;
    public static emit(name: string, ...args: any[]): void;
    public static emit(arg1: string | Function, ...args: any[]): void {
        let event: MEvent;
        if (typeof arg1 === "string") {
            event = this.strEventMap.get(arg1);
        } else {
            event = this.eventMap.get(arg1);
        }
        if (event) {
            event.dispatch(...args);
        }
    }
}