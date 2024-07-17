import { game, Game } from "cc";
import { MEvent } from "./MEvent";

/** 全局事件管理工具 */
export class EventMgr {
    private static eventMap: Map<string | number, MEvent> = new Map();

    /** 清理所有事件 */
    public static clear() {
        EventMgr.eventMap.clear();
    }

    /** 为事件注册一个回调,重复注册只保留第一次的事件 */
    public static on(name: number | string, callback: (...args: any[]) => void, thisObj?: object) {
        let event = this.eventMap.get(name);
        if (!event) {
            event = new MEvent();
            this.eventMap.set(name, event);
        }
        event.addListener(callback, thisObj, false);
    }
    /** 为事件注册一个回调,回调仅会触发一次,重复注册只保留第一次的事件 */
    public static once(name: number | string, callback: (...args: any[]) => void, thisObj?: object) {
        let event = this.eventMap.get(name);
        if (!event) {
            event = new MEvent();
            this.eventMap.set(name, event);
        }
        event.addListener(callback, thisObj, true);
    }
    /** 取消事件的某个回调，callback不传值时取消事件所有回调*/
    public static off(name: number | string, callback?: (...args: any[]) => void, thisObj?: object) {
        let event = this.eventMap.get(name);
        if (event) {
            if (callback) {
                event.removeListener(callback, thisObj);
            } else {
                event.removeAllListeners();
            }
        }
    }

    /** 触发事件，参数个数不固定 */
    public static emit(name: number | string, ...args: any[]) {
        let event = this.eventMap.get(name);
        if (event) {
            event.dispatch(...args);
        }
    }
}

//游戏重启时清除所有事件
game.on(Game.EVENT_RESTART, () => {
    EventMgr.clear();
});