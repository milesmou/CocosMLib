import { Utils } from "../utils/Utils";

/**
 * 本地存储工具类
 */
export class StroageMgr {
    private static _inst: StroageMgr = null;
    public static get Inst() { return this._inst || (this._inst = new StroageMgr()) }

    private prefix = "GameName_";
    private lastResetDateKey = "lastResetDate";
    private lastResetDate = 0;
    private dayresetSuffix = "_dayreset";

    private constructor() {
        this.lastResetDate = this.getNumber(this.lastResetDateKey, 0);
    }

    /* 使用代理自动序列化存储数据 */

    getProxy<T extends object>(inst: T): T {
        inst = this.deserialize(inst);
        return new Proxy(inst, {
            set: (target, prop, value, receiver) => {
                let result = Reflect.set(target, prop, value, receiver)
                if (result) this.serialize(target);
                return result;
            }
        })
    }

    serialize<T extends object>(inst: T) {
        let name = inst.constructor.name;
        let jsonStr = JSON.stringify(inst);
        cc.sys.localStorage.setItem(this.prefix + name, jsonStr)
        return jsonStr;
    }

    deserialize<T extends object>(inst: T): T {
        let name = inst.constructor.name;
        let jsonStr = cc.sys.localStorage.getItem(this.prefix + name);
        if (jsonStr) {
            try {
                let obj = JSON.parse(jsonStr);
                for (const key in obj) {
                    if (Reflect.has(inst, key)) {
                        if (key.endsWith(this.dayresetSuffix) && Utils.getToday() > this.lastResetDate) {
                            continue;//使用默认值
                        } else {
                            if (Object.prototype.toString.call(inst[key]) === "[object Object]") {
                                inst[key] = Object.assign(inst[key], obj[key]);//赋值二级字段
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
        return inst;
    }

    /**
     * 完成今日的每日变量重置
     * 
     * 请在所有需要序列化和反序列化的类初始化完成后调用
     */
    finishDayReset() {
        this.setValue(this.lastResetDateKey, Utils.getToday());
    }

    /* 手动存储数据 */

    /**
    * 从本地存储中获取数字类型的值
    * @param stroageKey 键
    * @param defaultV 默认值
    */
    getNumber(stroageKey: string, defaultV: number): number {
        return this.getValue<number>("number", stroageKey, defaultV);
    }

    /**
    * 从本地存储中获取字符串类型的值
    * @param stroageKey 键
    * @param defaultV 默认值
    */
    getString(stroageKey: string, defaultV: string): string {
        return this.getValue<string>("string", stroageKey, defaultV);
    }

    /**
    * 从本地存储中获取布尔类型的值
    * @param stroageKey 键
    * @param defaultV 默认值
    */
    getBoolean(stroageKey: string, defaultV: boolean): boolean {
        return this.getValue<boolean>("boolean", stroageKey, defaultV);
    }

    /**
     * 从本地存储中获取对象类型的值
     * @param stroageKey 键
     * @param defaultV 默认值
     */
    getObject(stroageKey: string, defaultV: object): object {
        return this.getValue<object>("object", stroageKey, defaultV);
    }

    /**
     * 从本地存储中获取缓存的值
     * @param type 数据类型 number|string|boolean|object
     * @param stroageKey StroageKey键枚举
     * @param defaultV 默认值
     */
    getValue<T>(type: "number" | "string" | "boolean" | "object", stroageKey: string, defaultV: T): T {
        let key = this.prefix + stroageKey;
        let value = cc.sys.localStorage.getItem(key);
        if (!value) {
            return defaultV;
        } else {
            if (type === "number") {
                let v = parseFloat(value);
                if (isNaN(v)) {
                    console.error(key, ": 转化为数字类型错误 ", value);
                    value = defaultV;
                } else {
                    value = v;
                }
            } else if (type === "string") {
                return value;
            } else if (type === "boolean") {
                return (value !== "true") as any;
            } else {
                try {
                    value = JSON.parse(value);
                } catch (err) {
                    console.error(key, ": 转化对象类型错误 ", value);
                    value = defaultV;
                }

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
