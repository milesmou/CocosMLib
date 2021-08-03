import { Utils } from "../utils/Utils";

export abstract class SerializableObject {
    abstract name: string;
    serialize: () => void;
}

/**
 * 本地存储工具类
 */
export class StroageMgr {

    private prefix = "GameName_";
    private lastResetDateKey = "lastResetDate";
    private dayresetSuffix = "_dayreset";//代理对象中变量名以此结尾的一级字段会被每日重置

    /** 
     * 为对象创建一个代理对象 修改属性值时自动缓存数据到本地
     * 
     * 使用name字段作为对象缓存的key 请确保和其它对象不重复
     * 
     * 注意:使用字典({})或数组([])存储数据,非直接操作集合而是修改内部对象数据时,请手动调用serialize方法
     */
    public getProxy<T extends SerializableObject>(inst: T): T {
        inst = this.createProxy(inst, inst);
        inst = this.deserialize(inst);
        inst.serialize = () => { this.serialize(inst) };
        inst.serialize();
        return inst;
    }

    private serialize<T extends SerializableObject>(inst: T) {
        let name = inst.name;
        let jsonStr = JSON.stringify(inst);
        this.setValue(name, jsonStr);
        return jsonStr;
    }

    private deserialize<T extends SerializableObject>(inst: T): T {
        let today = Utils.getToday();
        let name = inst.name;
        let jsonStr = this.getValue(name, "");
        if (jsonStr) {
            try {
                let obj = JSON.parse(jsonStr);
                for (const key in obj) {
                    if (Reflect.has(inst, key)) {
                        if (key.endsWith(this.dayresetSuffix) && today > obj[this.lastResetDateKey]) {
                            continue;//使用默认值
                        } else {
                            if (Object.prototype.toString.call(inst[key]) === "[object Object]" && Object.prototype.toString.call(obj[key]) === "[object Object]") {//对象拷贝
                                if (JSON.stringify(inst[key]) === "{}") {//使用字典存储,直接完整赋值
                                    inst[key] = obj[key];
                                } else {
                                    inst[key] = this.mergeValue(inst[key], obj[key]);
                                }
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
        return inst;
    }

    /** 递归合并target和source中的值,使用source中的值覆盖target中的值,忽略target中没有的属性 */
    private mergeValue(target: object, source: object) {
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
        return target;
    }

    /** 递归为对象及其内部的对象创建代理 */
    private createProxy<T extends SerializableObject>(obj: T, root: T): T {
        if (Object.prototype.toString.call(obj) === "[object Object]") {
            for (const key in obj) {
                if (Reflect.has(obj, key)) {
                    if (obj[key] && typeof obj[key] === "object") {
                        obj[key] = this.createProxy(obj[key] as any, root);
                    }
                }
            }
        }
        obj = new Proxy(obj, {
            set: (target, prop, value, receiver) => {
                let result = Reflect.set(target, prop, value, receiver);
                if (result && root.serialize) root.serialize();
                return result;
            }
        })
        return obj;
    }

    /* 手动存储数据 */

    /**
     * 从本地存储中获取缓存的值
     * @param stroageKey StroageKey键枚举
     * @param defaultV 默认值
     */
    public getValue<T>(stroageKey: string, defaultV: T): T {
        let key = this.prefix + stroageKey;
        let value = cc.sys.localStorage.getItem(key);
        if (!value) return defaultV;
        if (typeof defaultV === "number") {
            let v = parseFloat(value);
            if (isNaN(v)) {
                console.error(key, ": 转化为数字类型错误 ", value);
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
                console.error(key, ": 转化对象类型错误 ", value);
                value = defaultV;
            }
        }
        return value;
    }

    /**
     * 设置本地存储值
     */
    public setValue(stroageKey: string, value: any) {
        let key = this.prefix + stroageKey;
        if (typeof value === "object") {
            value = JSON.stringify(value);
        }
        cc.sys.localStorage.setItem(key, String(value));
    }
}
