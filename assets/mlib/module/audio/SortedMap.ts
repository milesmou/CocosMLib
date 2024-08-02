/** 可以对key自动排序的Map(key为number类型) */
export class SortedMap<T> {

    /** 存储并维护Key的顺序 */
    private _array: number[] = [];
    /** 存储Key和值 */
    private _map: Map<number, T> = new Map();

    private sortKey() {
        this._array.sort((a, b) => a - b);
    }

    public get topKey(): number | undefined {
        if (this._array.length > 0) {
            return this._array.last;
        }
        return undefined;
    }

    public get topValue(): T | undefined {
        if (this._array.length > 0) {
            return this._map.get(this.topKey as number);
        }
        return undefined;
    }

    public isTopKey(key: number) {
        let topKey = this.topKey;
        if (topKey === undefined) return false;
        return key == topKey;
    }

    public isTop(key: number, item: T) {
        let topKey = this.topKey;
        if (topKey === undefined) return false;
        let topValue = this.topValue;
        if (topValue === undefined) return false;
        return key == topKey && item == topValue;
    }

    public get size() {
        return this._array.length;
    }

    public clear() {
        this._array.length = 0;
        this._map.clear();
    }

    public get(key: number) {
        return this._map.get(key);
    }

    public set(key: number, item: T) {
        if (!this._array.includes(key)) {
            this._array.push(key);
        }
        this._map.set(key, item);
        this.sortKey();
    }

    public deleteKey(key: number) {
        this._array.delete(key);
        this._map.delete(key);
        this.sortKey();
    }

    public delete(key: number, item: T) {
        let v = this._map.get(key);
        if (item == v) {
            this.deleteKey(key);
        }
    }

    public hasKey(key: number) {
        return this._map.has(key);
    }

    public has(key: number, item: T) {
        let v = this._map.get(key);
        return item == v;
    }

    public forEach(predicate: (item: T, key: number) => void) {
        this._array.forEach(key => {
            let v = this._map.get(key);
            predicate && predicate(v as T, key);
        });
    }


}