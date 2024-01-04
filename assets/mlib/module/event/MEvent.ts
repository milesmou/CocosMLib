export class MEvent {

    private eventHandlers: { func: (...args: any[]) => void, thisObj: object, disposable: boolean }[] = [];

    public addListener(func: (...args: any[]) => void, thisObj?: object, disposable = false) {
        let handler = this.eventHandlers.find(v => v.func == func && v.thisObj == thisObj);
        if (!handler) {
            this.eventHandlers.push({ func: func, thisObj: thisObj, disposable: disposable });
        }
    }

    public removeListener(func: (...args: any[]) => void, thisObj?: object) {
        let index = this.eventHandlers.findIndex(v => v.func == func && v.thisObj == thisObj);
        if (index > -1) {
            this.eventHandlers.splice(index, 1);
        }
    }

    public removeAllListeners() {
        this.eventHandlers.length = 0;
    }

    public dispatch(...args: any[]) {
        let arr = this.eventHandlers.concat();//拷贝数组 避免遍历时数组长度改变
        arr.forEach(v => {
            if (v.disposable) this.removeListener(v.func, v.thisObj);
            v.func && v.func.apply(v.thisObj, args);
        });
    }

}

export class MEvent1<T> extends MEvent {

    public addListener(func: (arg: T) => void, thisObj?: object, disposable = false) {
        super.addListener(func, thisObj, disposable);
    }

    public removeListener(func: (arg: T) => void, thisObj?: object) {
        super.removeListener(func, thisObj);
    }

    public dispatch(arg: T) {
        super.dispatch(arg);
    }
}

export class MEvent2<T1, T2> extends MEvent {

    public addListener(func: (arg1: T1, arg2: T2) => void, thisObj?: object, disposable = false) {
        super.addListener(func, thisObj, disposable);
    }

    public removeListener(func: (arg1: T1, arg2: T2) => void, thisObj?: object) {
        super.removeListener(func, thisObj);
    }

    public dispatch(arg1: T1, arg2: T2) {
        super.dispatch(arg1, arg2);
    }
}

export class MEvent3<T1, T2, T3> extends MEvent {

    public addListener(func: (arg1: T1, arg2: T2, arg3: T3) => void, thisObj?: object, disposable = false) {
        super.addListener(func, thisObj, disposable);
    }

    public removeListener(func: (arg1: T1, arg2: T2, arg3: T3) => void, thisObj?: object) {
        super.removeListener(func, thisObj);
    }

    public dispatch(arg1: T1, arg2: T2, arg3: T3) {
        super.dispatch(arg1, arg2, arg3);
    }
}

export class MEvent4<T1, T2, T3, T4> extends MEvent {

    public addListener(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => void, thisObj?: object, disposable = false) {
        super.addListener(func, thisObj, disposable);
    }

    public removeListener(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => void, thisObj?: object) {
        super.removeListener(func, thisObj);
    }

    public dispatch(arg1: T1, arg2: T2, arg3: T3, arg4: T4) {
        super.dispatch(arg1, arg2, arg3, arg4);
    }
}

export class MEvent5<T1, T2, T3, T4, T5> extends MEvent {

    public addListener(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T4) => void, thisObj?: object, disposable = false) {
        super.addListener(func, thisObj, disposable);
    }

    public removeListener(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T4) => void, thisObj?: object) {
        super.removeListener(func, thisObj);
    }

    public dispatch(arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T4) {
        super.dispatch(arg1, arg2, arg3, arg4, arg5);
    }
}