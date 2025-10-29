export { }; // 确保文件被视为模块

/** 单例缓存属性名字 */
const instanceField = '_instance';

/** 创建单例 (创建单例时会执行onCreate方法) */
function createSingleton<T extends object>(clazz: { new(): T }): T {
    if (!clazz[instanceField]) {
        let instance = new clazz();
        let onCreate: Function = instance["onCreate"];
        if (onCreate && typeof onCreate === "function") {
            onCreate.call(instance);
        }
        clazz[instanceField] = instance;
    }
    return clazz[instanceField] as T;
}

/** 销毁单例 (销毁单例时会执行onDestroy方法) */
function destroySingleton<T extends object>(clazz: { new(): T }): void {
    let instance = clazz[instanceField];
    if (instance) {
        let onDestroy: Function = instance["onDestroy"];
        if (onDestroy && typeof onDestroy === "function") {
            onDestroy.call(instance);
        }
        delete clazz[instanceField];
    }
}

/** 单例是否存在 */
function isSingletonValid<T extends object>(clazz: { new(): T }): boolean {
    return Boolean(clazz[instanceField]);
}

//@ts-ignore
globalThis["createSingleton"] = createSingleton;
//@ts-ignore
globalThis["destroySingleton"] = destroySingleton;
//@ts-ignore
globalThis["isSingletonValid"] = isSingletonValid;

declare global {
    /** 创建单例 (创建单例时会执行onCreate方法) */
    const createSingleton: <T extends object>(clazz: { new(): T }) => T;
    /** 销毁单例 (销毁单例时会执行onDestroy方法) */
    const destroySingleton: <T extends object>(clazz: { new(): T }) => T;
    /** 单例是否存在 */
    const isSingletonValid: <T extends object>(clazz: { new(): T }) => boolean;
}
