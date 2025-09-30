/** 可以对key自动排序的Map (key为number类型,value不能是undefined) */
export class SortedMap<T> {

    /** 存储并维护Key的顺序 */
    private _keys: number[] = [];
    /** 存储Key和Value */
    private _map: Map<number, T> = new Map();

    private sortKey() {
        this._keys.sort((a, b) => a - b);
    }

    public get topKey(): number | undefined {
        if (this._keys.length > 0) {
            return this._keys.last;
        }
        return undefined;
    }

    public get topValue(): T | undefined {
        if (this._keys.length > 0) {
            return this._map.get(this.topKey);
        }
        return undefined;
    }

    public get size() {
        return this._keys.length;
    }

    public get(key: number) {
        return this._map.get(key);
    }

    public set(key: number, item: T) {
        if (!this._keys.includes(key)) {
            this._keys.push(key);
        }
        this._map.set(key, item);
        this.sortKey();
    }

    public clear() {
        this._keys.length = 0;
        this._map.clear();
    }

    public isTop(key: number);
    public isTop(key: number, value: T);
    public isTop(key: number, value?: T) {
        if (value === undefined) {
            let topKey = this.topKey;
            if (topKey === undefined) return false;
            return key == topKey;
        } else {
            let topKey = this.topKey;
            if (topKey === undefined) return false;
            let topValue = this.topValue;
            if (topValue === undefined) return false;
            return key == topKey && value == topValue;
        }
    }

    public has(key: number);
    public has(key: number, value: T);
    public has(key: number, value?: T) {
        if (value === undefined) {
            return this._map.has(key);
        } else {
            let v = this._map.get(key);
            return value == v;
        }
    }

    public delete(key: number);
    public delete(key: number, value: T);
    public delete(key: number, value?: T) {
        if (value === undefined) {
            this._keys.delete(key);
            this._map.delete(key);
        } else {
            let v = this._map.get(key);
            if (value == v) {
                this._keys.delete(key);
                this._map.delete(key);
            }
        }
        this.sortKey();
    }

    public forEach(predicate: (item: T, key: number) => void) {
        this._keys.forEach(key => {
            let v = this._map.get(key);
            predicate && predicate(v as T, key);
        });
    }

}