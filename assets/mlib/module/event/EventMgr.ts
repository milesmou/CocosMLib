import { MEvent } from "./MEvent";

type VoidFunc = (...args: any[]) => void;
type ParamFunc<T extends (...args: any[]) => void> = (...args: Parameters<T>) => void;

/** 全局事件管理工具 */
export class EventMgr {
    private static eventMap: Map<Function, MEvent> = new Map();
    private static strEventMap: Map<string, MEvent> = new Map();
    private static numEventMap: Map<number, MEvent> = new Map();

    /** 清理所有事件 */
    public static clear() {
        EventMgr.eventMap.clear();
        EventMgr.strEventMap.clear();
        EventMgr.numEventMap.clear();
    }

    /** 为事件注册一个回调,重复注册只保留第一次的事件 */
    public static on<T extends VoidFunc>(event: T, callback: ParamFunc<T>, thisObj?: object): void;
    public static on(name: string, callback: (...args: any[]) => void, thisObj?: object): void;
    public static on(name: number, callback: (...args: any[]) => void, thisObj?: object): void;
    public static on(arg: Function | string | number, callback: (...args: any[]) => void, thisObj?: object): void {
        let event = this.getEvent(arg);
        event.addListener(callback, thisObj, false);
    }

    /** 为事件注册一个回调,回调仅会触发一次,重复注册只保留第一次的事件 */
    public static once<T extends VoidFunc>(event: T, callback: ParamFunc<T>, thisObj?: object): void;
    public static once(name: string, callback: (...args: any[]) => void, thisObj?: object): void;
    public static once(name: number, callback: (...args: any[]) => void, thisObj?: object): void;
    public static once(arg: Function | string | number, callback: (...args: any[]) => void, thisObj?: object): void {
        let event = this.getEvent(arg);
        event.addListener(callback, thisObj, true);
    }

    /** 取消事件的某个回调，callback不传值时取消事件所有回调*/
    public static off<T extends VoidFunc>(event: T, callback?: ParamFunc<T>, thisObj?: object): void;
    public static off(name: string, callback?: (...args: any[]) => void, thisObj?: object): void;
    public static off(name: number, callback?: (...args: any[]) => void, thisObj?: object): void;
    public static off(arg: Function | string | number, callback?: (...args: any[]) => void, thisObj?: object): void {
        let event = this.getEvent(arg, false);
        if (event) {
            if (callback) {
                event.removeListener(callback, thisObj);
            } else {
                event.removeAllListeners();
            }
        }
    }

    /** 触发事件，参数个数不固定 */
    public static emit<T extends VoidFunc, P extends Parameters<T>>(event: T, ...args: P): void;
    public static emit(name: string, ...args: any[]): void;
    public static emit(name: number, ...args: any[]): void;
    public static emit(arg: Function | string | number, ...args: any[]): void {
        let event = this.getEvent(arg, false);
        if (event) {
            event.dispatch(...args);
        }
    }

    private static getEvent(arg: Function | string | number, ensureExist = true) {
        let event: MEvent;
        if (typeof arg === "string") {
            event = this.strEventMap.get(arg);
            if (!event && ensureExist) {
                event = new MEvent();
                this.strEventMap.set(arg, event);
            }
        } else if (typeof arg === "number") {
            event = this.numEventMap.get(arg);
            if (!event && ensureExist) {
                event = new MEvent();
                this.numEventMap.set(arg, event);
            }
        } else {
            event = this.eventMap.get(arg);
            if (!event && ensureExist) {
                event = new MEvent();
                this.eventMap.set(arg, event);
            }
        }
        return event;
    }
}