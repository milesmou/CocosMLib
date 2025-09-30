/** 一个读取Uint8Array数据的工具类 */
export class MByteBuffer {

    private _u8Array: Uint8Array;

    public get u8Array() { return this._u8Array; }

    public constructor(u8Array: Uint8Array) {
        this._u8Array = u8Array.copyWithin(0, 0);
    }

    public readUInt8(): number {
        let num = 0;
        let readLength = 1;
        if (this._u8Array.length >= readLength) {
            num = this._u8Array[0];
            this._u8Array = this._u8Array.slice(1);
        } else {
            console.warn("数组长度小于" + readLength);
        }
        return num;
    }

    public readUInt16(): number {
        let readLength = 2;
        let arr: number[] = [];
        for (let i = 0; i < readLength; i++) {
            if (i < this._u8Array.length) arr.push(this._u8Array[i]);
            else arr.push(0);
        }
        let buffer = new Uint8Array(arr).buffer;
        let num = new Uint16Array(buffer)[0]
        this._u8Array = this._u8Array.slice(readLength);
        return num;
    }

    public readUInt32(): number {
        let readLength = 4;
        let arr: number[] = [];
        for (let i = 0; i < readLength; i++) {
            if (i < this._u8Array.length) arr.push(this._u8Array[i]);
            else arr.push(0);
        }
        let buffer = new Uint8Array(arr).buffer
        let num = new Uint32Array(buffer)[0]
        this._u8Array = this._u8Array.slice(readLength);
        return num;
    }

    public readChar() {
        let str = "";
        let readLength = 1;
        if (this._u8Array.length >= readLength) {
            str = String.fromCharCode(this._u8Array[0]);
            this._u8Array = this._u8Array.slice(1);
        } else {
            console.warn("数组长度小于" + readLength);
        }
        return str;
    }

    public readString(readLength: number) {
        let str = "";
        if (this._u8Array.length >= readLength) {
            let arr: number[] = [];
            for (let i = 0; i < readLength; i++) {
                arr.push(this._u8Array[i]);
            }
            str = String.fromCharCode(...arr);
            this._u8Array = this._u8Array.slice(readLength);
        } else {
            console.warn("数组长度小于" + readLength);
        }
        return str;
    }
}