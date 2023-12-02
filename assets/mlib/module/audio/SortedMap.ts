/** 使用object模拟一个可以对key自动排序的Map */
export class SortedMap<T>
{
    private _map: { [key: string]: T } = {};

    public get topKey() {
        let keys = Object.keys(this._map);
        if (keys.length > 0) return parseFloat(keys[keys.length - 1]);
        return -1;
    }

    public get topValue() {
        let topKey = this.topKey;
        return this._map[topKey];
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
        let keys = Object.keys(this._map);
        return keys.length;
    }

    public clear() {
        this._map = {};
    }

    public get(key: number) {

        return this._map[key];
    }

    public set(key: number, item: T) {

        this._map[key] = item;
    }

    public delete(key: number, item: T) {
        let v = this._map[key];
        if (item == v) delete this._map[key];
    }

    public hasKey(key: number) {
        let v = this._map[key];
        return Boolean(v);
    }

    public has(key: number, item: T) {
        let v = this._map[key];
        return item == v;
    }

    public forEach(predicate: (item: T, key: number) => void) {
        for (const key in this._map) {
            let v = this._map[key];
            predicate && predicate(v, parseFloat(key));
        }
    }
}