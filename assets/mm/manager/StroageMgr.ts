import { Utils } from "../utils/Utils";

export abstract class SerializableObject {
    public abstract name: string;
    private readySave = false;
    /** 立即存档 */
    save() {
        StroageMgr.serialize(this);
    }
    /** 延迟存档 */
    delaySave() {
        if (!this.readySave) {
            this.readySave = true;
            cc.tween({}).delay(0.01).call(() => {
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

    private static lastResetDateKey = "lastResetDate";
    private static dayresetSuffix = "_dayreset";//代理对象中变量名以此结尾的一级字段会被每日重置

    /** 从本地缓存读取存档 */
    public static deserialize<T extends SerializableObject>(inst: T): T {
        let today = Utils.getToday();
        let name = inst.name;
        let jsonStr = this.getValue(name, "");
        if (jsonStr) {
            try {
                let obj = JSON.parse(jsonStr) || {};
                for (const key in obj) {
                    if (Reflect.has(inst, key)) {
                        if (key.endsWith(this.dayresetSuffix) && today > obj[this.lastResetDateKey]) {
                            continue;//使用默认值
                        } else {
                            if (Object.prototype.toString.call(inst[key]) === "[object Object]" && Object.prototype.toString.call(obj[key]) === "[object Object]") {//对象拷贝
                                if (JSON.stringify(inst[key]) === "{}") {//使用空字典存储,完整赋值
                                    Object.assign(inst[key], obj[key]);
                                } else {
                                    this.mergeValue(inst[key], obj[key]);//递归赋值
                                }
                            } else if (inst[key] instanceof Array) {//使用数组存储,置空后完整赋值
                                inst[key].length = 0;
                                inst[key].push(...obj[key]);
                            } else {
                                inst[key] = obj[key];//赋值一级字段
                            }
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }
        inst[this.lastResetDateKey] = today;
        Reflect.defineProperty(inst, "name", { enumerable: false });
        Reflect.defineProperty(inst, "readySave", { enumerable: false });
        return inst;
    }

    /** 将数据写入到本地存档中 */
    public static serialize<T extends SerializableObject>(inst: T) {
        let name = inst.name;
        let jsonStr = JSON.stringify(inst);
        this.setValue(name, jsonStr);
        return jsonStr;
    }

    /** 递归合并target和source中的值,使用source中的值覆盖target中的值,忽略target中没有的属性 */
    private static mergeValue(target: object, source: object) {
        for (const key in target) {
            if (Reflect.has(target, key) && Reflect.has(source, key)) {
                if (typeof target[key] !== typeof source[key]) continue;
                if (typeof target[key] === "object" && Object.prototype.toString.call(target[key]) !== Object.prototype.toString.call(source[key])) continue;
                if (Object.prototype.toString.call(target[key]) === "[object Object]") {
                    this.mergeValue(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
    }

    /* 手动存储数据 */

    /**
     * 从本地存储中获取缓存的值
     * @param stroageKey StroageKey键枚举
     * @param defaultV 默认值
     */
    public static getValue<T>(stroageKey: string, defaultV: T): T {
        let value = cc.sys.localStorage.getItem(stroageKey);
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
            return (value !== "true") as any;
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
        cc.sys.localStorage.setItem(stroageKey, String(value));
    }
}


