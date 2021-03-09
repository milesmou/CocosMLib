import { Utils } from "../utils/Utils";

/** 本地存储枚举 */
export enum StroageKey {
    SysLanguage,
    LastResetDate,
    Test1

}
/**
 * 本地存储工具类
 */
export class StroageMgr {

    public prefix = "GameName_";

    constructor() {
        if (Utils.getToday() > this.getNumber(StroageKey.LastResetDate)) {
            this.setValue(StroageKey.LastResetDate, Utils.getToday());
            //在这里重置一些需要每日重置的值
        }
    }

    /**
    * 从本地存储中获取数字类型的值
    * @param stroageKey 键
    * @param defaultV 默认值
    */
    getNumber(stroageKey: StroageKey, defaultV?: number): number {
        return this.getValue<number>("number", stroageKey, defaultV);
    }

    /**
    * 从本地存储中获取字符串类型的值
    * @param stroageKey 键
    * @param defaultV 默认值
    */
    getString(stroageKey: StroageKey, defaultV?: string): string {
        return this.getValue<string>("string", stroageKey, defaultV);
    }

    /**
    * 从本地存储中获取布尔类型的值
    * @param stroageKey 键
    * @param defaultV 默认值
    */
    getBoolean(stroageKey: StroageKey, defaultV?: boolean): boolean {
        return this.getValue<boolean>("boolean", stroageKey, defaultV);
    }

    /**
     * 从本地存储中获取对象类型的值
     * @param stroageKey 键
     * @param defaultV 默认值
     */
    getObject(stroageKey: StroageKey, defaultV?: object): object {
        return this.getValue<object>("object", stroageKey, defaultV);
    }

    /**
     * 从本地存储中获取缓存的值
     * @param type 数据类型 number|string|boolean|object
     * @param stroageKey StroageKey键枚举
     * @param defaultV 默认值
     */
    private getValue<T>(type: "number" | "string" | "boolean" | "object", stroageKey: StroageKey, defaultV: T): T {
        let key = this.prefix + StroageKey[stroageKey];
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
    setValue(stroageKey: StroageKey, value: any) {
        let key = this.prefix + StroageKey[stroageKey];
        if (typeof value === "object") {
            value = JSON.stringify(value);
        }
        cc.sys.localStorage.setItem(key, String(value));
    }
}
