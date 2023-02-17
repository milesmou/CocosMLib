/** 事件枚举 */
export enum EventKey {
    ShowUI,
    HideUI,
    OnUIInitBegin,
    OnUIShowBegin,
    OnUIHideBegin,
    OnUIShow,
    OnUIHide,
    Test3 = 10000,
}

/** 全局事件管理工具 */
export class EventMgr {
    private eventMap: Map<string | number, { callback: Function, thisObj?: object, once?: boolean, tag?: string }[]> = new Map();
    /** 为事件注册一个回调,重复注册只保留第一次的事件 */
    public on(name: number | string, callback: Function, thisObj?: object, tag?: string) {
        let events = this.eventMap.get(name)!;
        if (!events) {
            this.eventMap.set(name, []);
            events = this.eventMap.get(name)!;
        }
        let index = events.findIndex(v => v.callback == callback && v.thisObj == thisObj);
        if (index < 0) {
            events.push({ callback: callback, thisObj: thisObj, once: false, tag: tag });
        }
    }
    /** 为事件注册一个回调,回调仅会触发一次,重复注册只保留第一次的事件 */
    public once(name: number | string, callback: Function, thisObj?: object, tag?: string) {
        let events = this.eventMap.get(name)!;
        if (!events) {
            this.eventMap.set(name, []);
            events = this.eventMap.get(name)!;
        }
        let index = events.findIndex(v => v.callback == callback && v.thisObj == thisObj);
        if (index < 0) {
            events.push({ callback: callback, thisObj: thisObj, once: true, tag: tag });
        }
    }
    /** 取消事件的某个回调，callback不传值时取消事件所有回调*/
    public off(name: number | string, callback?: Function, thisObj?: object) {
        let events = this.eventMap.get(name);
        if (events && events.length > 0) {
            if (callback) {
                let delIndex = events.findIndex(v => v.callback == callback && v.thisObj == thisObj);
                delIndex > -1 && events.splice(delIndex, 1);
            } else {
                this.eventMap.delete(name);
            }
        }
    }
    /** 通过tag取消事件 */
    public offByTag(name: number | string, tag: string) {
        if (!tag) return;
        let event = this.eventMap.get(name);
        if (event?.length > 0) {
            this.eventMap.set(name, event.filter(vv => vv.tag != tag));
        }
    }
    /** 触发事件，参数个数不固定 */
    public emit(name: number | string, ...args: any[]) {
        let events = this.eventMap.get(name);
        if (events && events.length > 0) {
            let toDelArr: number[] = [];
            events.forEach((v, i) => {
                let { callback, thisObj, once } = v;
                if (typeof callback == "function") {
                    callback.call(thisObj, ...args);
                }
                if (once) {
                    toDelArr.push(i);
                }
            })
            if (toDelArr.length > 0) {
                this.eventMap.set(name, events.filter((v, i) => toDelArr.indexOf(i) < 0));
            }
        }
    }
}