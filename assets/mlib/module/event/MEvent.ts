export class MEvent<T1 = undefined, T2 = undefined, T3 = undefined, T4 = undefined, T5 = undefined> {

    private eventHandlers: { func: (arg1?: T1, arg2?: T2, arg3?: T3, arg4?: T4, arg5?: T5) => void, thisObj: object, disposable: boolean }[] = [];

    public addListener(func: (arg1?: T1, arg2?: T2, arg3?: T3, arg4?: T4, arg5?: T5) => void, thisObj?: object, disposable = false) {
        let handler = this.eventHandlers.find(v => v.func == func && v.thisObj == thisObj);
        if (!handler) {
            this.eventHandlers.push({ func: func, thisObj: thisObj, disposable: disposable });
        }
    }

    public removeListener(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => void, thisObj?: object) {
        let index = this.eventHandlers.findIndex(v => v.func == func && v.thisObj == thisObj);
        if (index > -1) {
            this.eventHandlers.splice(index, 1);
        }
    }

    public removeAllListeners() {
        this.eventHandlers.length = 0;
    }

    public dispatch(arg1?: T1, arg2?: T2, arg3?: T3, arg4?: T4, arg5?: T5) {
        let arr = this.eventHandlers.concat();//拷贝数组 避免遍历时数组长度改变
        arr.forEach(v => {
            if (v.disposable) this.removeListener(v.func, v.thisObj);
            v.func && v.func.call(v.thisObj, arg1, arg2, arg3, arg4, arg5);
        });
    }

}