interface EventListener<T1 = undefined, T2 = undefined, T3 = undefined, T4 = undefined, T5 = undefined> {
    func: (arg1?: T1, arg2?: T2, arg3?: T3, arg4?: T4, arg5?: T5) => void;
    thisObj: object;
    disposable: boolean;
}

export class MEvent<T1 = undefined, T2 = undefined, T3 = undefined, T4 = undefined, T5 = undefined> {

    /** 尽量不要直接修改这个属性 */
    private _listeners: EventListener<T1, T2, T3, T4, T5>[] = [];

    public addListener(func: (arg1?: T1, arg2?: T2, arg3?: T3, arg4?: T4, arg5?: T5) => void, thisObj?: object, disposable = false) {
        let handler = this._listeners.find(v => v.func == func && v.thisObj == thisObj);
        if (!handler) {
            this._listeners.push({ func: func, thisObj: thisObj, disposable: disposable });
        }
    }

    public removeListener(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => void, thisObj?: object) {
        let index = this._listeners.findIndex(v => v.func == func && v.thisObj == thisObj);
        if (index > -1) {
            this._listeners.splice(index, 1);
        }
    }

    public removeAllListeners() {
        this._listeners.length = 0;
    }

    public dispatch(arg1?: T1, arg2?: T2, arg3?: T3, arg4?: T4, arg5?: T5) {
        let arr = this._listeners.concat();//拷贝数组 避免遍历时数组长度改变
        arr.forEach(v => {
            if (v.disposable) this.removeListener(v.func, v.thisObj);
            v.func && v.func.call(v.thisObj, arg1, arg2, arg3, arg4, arg5);
        });
    }

}