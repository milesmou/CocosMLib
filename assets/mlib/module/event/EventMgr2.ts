import { MEvent } from "./MEvent";

export interface EventMap {
    [eventName: string]: (...args: any) => void
}

export class EventMgr2<Events extends EventMap> {

    private _events: Map<string, MEvent> = new Map();

    public on<K extends keyof Events, C extends (...args: Parameters<Events[K]>) => void>(name: K, callback: C, thisObj?: object) {
        let event = this._events.get(name as string);
        if (!event) {
            event = new MEvent();
            this._events.set(name as string, event);
        }
        event.addListener(callback as any, thisObj, false);
    }

    public once<K extends keyof Events, C extends (...args: Parameters<Events[K]>) => void>(name: K, callback: C, thisObj?: object) {
        let event = this._events.get(name as string);
        if (!event) {
            event = new MEvent();
            this._events.set(name as string, event);
        }
        event.addListener(callback as any, thisObj, true);
    }

    public off<K extends keyof Events, C extends (...args: Parameters<Events[K]>) => void>(name: K, callback?: C, thisObj?: object) {
        let event = this._events.get(name as string);
        if (event) {
            if (callback) {
                event.removeListener(callback as any, thisObj);
            } else {
                event.removeAllListeners();
            }
        }
    }

    public emit<K extends keyof Events, D extends Parameters<Events[K]>>(name: K, ...args: D) {
        let event = this._events.get(name as any);
        if (event) {
            event.dispatch(...args);
        }
    }
}
