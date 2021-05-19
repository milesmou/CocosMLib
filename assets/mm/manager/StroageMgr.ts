import { Utils } from "../utils/Utils";

/**
 * 本地存储工具类
 */
export class StroageMgr {
    private static _inst: StroageMgr = null;
    public static get Inst() { return this._inst || (this._inst = new StroageMgr()) }

    private prefix = "GameName_";
    private lastResetDateKey = "lastResetDate";
    private dayresetSuffix = "_dayreset";//代理对象中变量名以此结尾到会被每日重置

    /** 
     * 为对象创建一个代理对象 修改对象属性值时保存数据到本地
     * 
     * 对象中的值
     * 
     * 使用对象类名为键保存数据，所以类名不能重复和使用大括号创建对象
     */
    getProxy<T extends object>(inst: T): T {
        inst = this.deserialize(inst);
        this.serialize(inst);
        return new Proxy(inst, {
            set: (target, prop, value, receiver) => {
                let result = Reflect.set(target, prop, value, receiver);
                if (result) this.serialize(target);
                return result;
            }
        })
    }

    serialize<T extends object>(inst: T) {
        let name = inst.constructor.name;
        let jsonStr = JSON.stringify(inst);
        this.setValue(name, jsonStr);
        return jsonStr;
    }

    deserialize<T extends object>(inst: T): T {
        let today = Utils.getToday();
        let name = inst.constructor.name;
        let jsonStr = this.getValue(name, "");
        if (jsonStr) {
            try {
                let obj = JSON.parse(jsonStr);
                for (const key in obj) {
                    if (Reflect.has(inst, key)) {
                        if (key.endsWith(this.dayresetSuffix) && today > obj[this.lastResetDateKey]) {
                            continue;//使用默认值
                        } else {
                            if (Object.prototype.toString.call(inst[key]) === "[object Object]" && Object.prototype.toString.call(obj[key]) === "[object Object]") {
                                for (const k in obj[key]) {//赋值二级字段
                                    if (Reflect.has(inst[key], k)) {
                                        inst[key][k] = obj[key][k];
                                    }
                                }
                            } else {
                                inst[key] = obj[key];//赋值一级字段
                            }
                            if (typeof inst[key] === "object") {
                                inst[key] = new Proxy(inst[key], {
                                    set: (target, prop, value, receiver) => {
                                        let result = Reflect.set(target, prop, value, receiver);
                                        if (result) this.serialize(inst);
                                        return result;
                                    }
                                });
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

    /* 手动存储数据 */

    /**
     * 从本地存储中获取缓存的值
     * @param stroageKey StroageKey键枚举
     * @param defaultV 默认值
     */
    getValue<T>(stroageKey: string, defaultV: T): T {
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
    setValue(stroageKey: string, value: any) {
        let key = this.prefix + stroageKey;
        if (typeof value === "object") {
            value = JSON.stringify(value);
        }
        cc.sys.localStorage.setItem(key, String(value));
    }
}
