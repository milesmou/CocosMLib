interface EventListener<T1 = undefined, T2 = undefined, T3 = undefined, T4 = undefined, T5 = undefined> {
    func: (arg1?: T1, arg2?: T2, arg3?: T3, arg4?: T4, arg5?: T5) => void;
    thisObj: object;
    disposable: boolean;
}

export class MEvent<T1 = undefined, T2 = undefined, T3 = undefined, T4 = undefined, T5 = undefined> {

    private _listeners: Set<EventListener<T1, T2, T3, T4, T5>> = new Set();

    public addListener(func: (arg1?: T1, arg2?: T2, arg3?: T3, arg4?: T4, arg5?: T5) => void, thisObj?: object, disposable = false) {
        if (!this._listeners.hasP(v => v.func == func && v.thisObj == thisObj)) {
            this._listeners.add({ func: func, thisObj: thisObj, disposable: disposable });
        }
    }

    public removeListener(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => void, thisObj?: object) {
        this._listeners.deleteP(v => v.func == func && v.thisObj == thisObj);
    }

    public removeAllListeners() {
        this._listeners.clear();
    }

    public dispatch(arg1?: T1, arg2?: T2, arg3?: T3, arg4?: T4, arg5?: T5) {
        for (const v of this._listeners) {
            if (v.disposable) this.removeListener(v.func, v.thisObj);
            v.func && v.func.call(v.thisObj, arg1, arg2, arg3, arg4, arg5);
        }
    }

}