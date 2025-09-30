export { }; // 确保文件被视为模块

/** 单例缓存Map */
const singletonMap = new Map<Function, object>();

/** 创建单例 (创建单例时会执行onCreate方法) */
function createSingleton<T extends object>(clazz: { new(): T }): T {
    if (!singletonMap.has(clazz)) {
        let instance = new clazz();
        let onCreate: Function = instance["onCreate"];
        if (onCreate && typeof onCreate === "function") {
            onCreate.call(instance);
        }
        singletonMap.set(clazz, instance);
    }
    return singletonMap.get(clazz) as T;
}

/** 销毁单例 (销毁单例时会执行onDestroy方法) */
function destroySingleton<T extends object>(clazz: { new(): T }): void {
    let instance = singletonMap.get(clazz);
    if (instance) {
        let onDestroy: Function = instance["onDestroy"];
        if (onDestroy && typeof onDestroy === "function") {
            onDestroy.call(instance);
        }
        singletonMap.delete(clazz);
    }
}

/** 单例是否存在 */
function isSingletonValid<T extends object>(clazz: { new(): T }): boolean {
    return singletonMap.has(clazz);
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
