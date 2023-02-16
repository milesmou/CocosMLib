import { sys, tween } from "cc";
import { Utils } from "../utils/Utils";


export abstract class SerializableObject {
    public abstract name: string;
    /** 存档描述(多存档时使用) */
    public desc = "";
    /** 存档时间最后一次保存时间(时间戳) */
    public date = 0;

    /** 字段会被每日重置,即使用默认值 */
    public dayreset: { [key: string]: any };
    /** 上一次重置dayreset字段日期 */
    public lastResetDate: number;
    /** 准备延迟存档,忽略其它存档请求 */
    private readySave = false;

    /** 立即存档 */
    save() {
        this.date = Date.now();
        StroageMgr.serialize(this);
    }
    /** 延迟存档 */
    delaySave() {
        if (!this.readySave) {
            this.readySave = true;
            tween({}).delay(0.01).call(() => {
                this.readySave = false;
                this.save();
            }).start();
        }
    };
}

/**
 * 本地存储工具类
 */
export class StroageMgr {

    /** 从本地缓存读取存档 */
    public static deserialize<T extends SerializableObject>(inst: T): T {
        Reflect.defineProperty(inst, "name", { enumerable: false });
        Reflect.defineProperty(inst, "readySave", { enumerable: false });
        let name = inst.name;
        let jsonStr = this.getValue(name, "");
        if (jsonStr) {
            try {
                let obj = JSON.parse(jsonStr);
                this.mergeValue(inst, obj, true);
            } catch (err) {
                console.error(err);
            }
        }
        inst.lastResetDate = Utils.getToday();
        return inst;
    }

    /** 将数据写入到本地存档中 */
    public static serialize<T extends SerializableObject>(inst: T) {
        let name = inst.name;
        let jsonStr = JSON.stringify(inst);
        this.setValue(name, jsonStr);
    }

    /** 合并存档默认数据和本地数据 */
    private static mergeValue(target: object, source: object, isRootObj = false) {
        for (const key in target) {
            if (Reflect.has(source, key)) {
                if (isRootObj && key == "dayreset") {//根对象的dayreset会被每日重置
                    if (Utils.getToday() > source["lastResetDate"]) continue;//使用默认值
                }
                if (Object.prototype.toString.call(target[key]) === "[object Object]" && Object.prototype.toString.call(source[key]) === "[object Object]") {//对象拷贝
                    if (JSON.stringify(target[key]) === "{}") {//使用空字典存储,完整赋值
                        target[key] = source[key];
                        if (target[key + "_item"]) this.checkMissProperty(target[key], target[key + "_item"]);
                    } else {//递归赋值
                        this.mergeValue(target[key], source[key]);
                    }
                } else if (Object.prototype.toString.call(target[key]) === "[object Array]" && Object.prototype.toString.call(source[key]) === "[object Array]") {//数组{
                    target[key] = source[key];
                    if (target[key + "_item"]) this.checkMissProperty(target[key], target[key + "_item"]);
                }
                else {//直接完整赋值
                    target[key] = source[key];
                }
            }
        }
    }

    //检查数组或字典的元素是否丢失字段
    private static checkMissProperty<T extends object>(collect: T[] | { [key: string]: T }, itemObj: T) {
        if (collect instanceof Array) {
            for (const key in itemObj) {
                collect.forEach(v => {
                    if (v[key] === undefined) {
                        v[key] = itemObj[key];
                    }
                })
            }
        } else {
            for (const key in itemObj) {
                for (const key1 in collect) {
                    let element = collect[key1];
                    if (element[key] === undefined) {
                        element[key] = itemObj[key];
                    }
                }
            }
        }
    }

    /**
     * 从本地存储中获取缓存的值
     * @param stroageKey StroageKey键枚举
     * @param defaultV 默认值
     */
    public static getValue<T>(stroageKey: string, defaultV: T): T {
        let value: any = sys.localStorage.getItem(stroageKey);
        if (!value) return defaultV;
        if (typeof defaultV === "number") {
            let v = parseFloat(value);
            if (isNaN(v)) {
                console.error(stroageKey, ": 转化为数字类型错误 ", value);
                value = defaultV;
            } else {
                value = v;
            }
        } else if (typeof defaultV === "string") {
            return value;
        } else if (typeof defaultV === "boolean") {
            return (value === "true") as any;
        } else {
            try {
                value = JSON.parse(value);
            } catch (err) {
                console.error(stroageKey, ": 转化对象类型错误 ", value);
                value = defaultV;
            }
        }
        return value;
    }

    /**
     * 设置本地存储值
     */
    public static setValue(stroageKey: string, value: any) {
        if (typeof value === "object") {
            value = JSON.stringify(value);
        }
        sys.localStorage.setItem(stroageKey, String(value));
    }
}
