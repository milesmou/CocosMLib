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