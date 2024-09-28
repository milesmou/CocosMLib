import fs from "fs-extra";
import { Constant } from "./Constant";
/** 保存和读取本地配置 */
export class Config {

    public static get data() {
        let obj: any;
        try {
            obj = fs.readJSONSync(Constant.ConfigFilePath);
        } catch (e) {
            obj = {};
        }
        return obj;
    }
    public static get<T>(key: string, defaultV: T) {
        let d = this.data;
        let arr = key.split(".");
        let v = d;
        for (let i = 0; i < arr.length; i++) {
            const k = arr[i];
            v = v[k] as T;
            if (i < arr.length - 1) {
                if (v === undefined) {
                    v = defaultV;
                    this.set(key, defaultV);
                    break;
                }
                if (typeof v !== "object") {
                    v = defaultV;
                    console.error(`${k}的值不是一个对象`);
                    break;
                }
            }
        }
        return v;
    }

    public static set(key: string, value: any) {
        let d = this.data;
        if (d) {
            let arr = key.split(".");
            let v = d;
            for (let i = 0; i < arr.length; i++) {
                const k = arr[i];
                if (i == arr.length - 1) {
                    v[k] = value;
                } else {
                    if (v[k] == undefined) v[k] = {};
                    v = v[k];
                    if (typeof v != "object") {
                        console.error(`${k}的值不是一个对象`);
                        return;
                    }
                }
            }
            fs.writeJSONSync(Constant.ConfigFilePath, d, { spaces: 4 });
        }
    }
}