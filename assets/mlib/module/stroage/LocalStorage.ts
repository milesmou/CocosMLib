import { sys } from "cc";

/**
 * 本地存储类
 */
export class LocalStorage {
    /**
     * 从本地存储中获取缓存的值
     * @param key 键
     * @param defaultV 默认值
     */
    public static getValue<T = number>(key: string, defaultV: T): T {
        let value: any = sys.localStorage.getItem(key);
        if (!value) return defaultV;
        if (typeof defaultV === "number") {
            let v = parseFloat(value);
            if (isNaN(v)) {
                mLogger.error(key, ": 转化为数字类型错误 ", value);
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
                mLogger.error(key, ": 转化对象类型错误 ", value);
                value = defaultV;
            }
        }
        return value;
    }

    /**
     * 设置本地存储值
     */
    public static setValue(key: string, value: any) {
        if (typeof value === "object") {
            value = JSON.stringify(value);
        }
        sys.localStorage.setItem(key, String(value));
    }

    /**
     * 移除本地存储值
     */
    public static removeValue(stroageKey: string) {
        sys.localStorage.removeItem(stroageKey);
    }

    /**
    * 清除本地所有存档
    */
    public static clear() {
        sys.localStorage.clear();
    }

}