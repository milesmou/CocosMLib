import { MEvent } from "./MEvent";

/** 在数据发生变化时会自动派发事件 */
export class EventValue<T> {
    private _value: T;

    public get value() {
        return this._value;
    }

    public set value(val: T) {
        if (this._value == val) return;
        this._value = val;
        this.onValueChange.dispatch();
    }

    public readonly onValueChange: MEvent<T> = new MEvent();

    public constructor(value: T) {
        this._value = value;
    }

}