import { ObjectPoolArgs } from "./ObjectPoolArgs";


/** 对象池 */
export class ObjectPool<T extends object = object> {

    private _args: ObjectPoolArgs<T>;
    private _list: T[] = [];

    constructor(args: ObjectPoolArgs<T>) {
        this._args = args;
        for (let i = 0; i < args.createNum; i++) {
            this._list.push(this._args.newObject());
        }
    }

    /** 从对象池获取一个对象 */
    public get() {
        let obj: T;
        if (this._list.length > 0) {
            obj = this._list.pop();
        } else {
            obj = this._args.newObject();
        }
        if (this._args.onGetObject) {
            this._args.onGetObject(obj);
        }
        return obj;
    }

    /** 向对象池放入一个对象 */
    public put(obj: T) {
        if (this._args.onPutObject) {
            if (this._args.onPutObject(obj) === false) return;
        }
        this._list.push(obj);
    }

    /** 销毁对象池所有对象 */
    public destroy() {
        if (this._args.onDestroyObject) {
            for (const obj of this._list) {
                this._args.onDestroyObject(obj);
            }
        }
        this._list.length = 0;
    }

}