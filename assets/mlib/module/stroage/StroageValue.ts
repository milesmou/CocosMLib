import { LocalStorage } from "./LocalStorage";

/** 可以自动读写本地存储 */
export class StroageValue<T> {

    private _key: string;

    private _value: T;

    public onValueChange: () => void;

    public constructor(stroageKey: string, defaultV: T, onValueChange?: () => void) {
        this._key = stroageKey;
        this._value = LocalStorage.getValue(stroageKey, defaultV);
        this.onValueChange = onValueChange;
    }

    public get value() { return this._value; }
    public set value(v: T) {
        if (this._value == v) return;
        this._value = v;
        LocalStorage.setValue(this._key, this._value);
        this.onValueChange && this.onValueChange();
    }

}