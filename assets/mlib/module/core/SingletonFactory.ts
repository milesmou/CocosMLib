import { game, Game } from "cc";

/** 保存所有单例类 */
const singletonSet = new Set();
/** 类保存单例字段的名字 */
const instFieldName = "_instance";
/** 创建单例时执行的方法名 */
const onInstFuncName = "onInst";

/** 创建单例并缓存,在引擎重启时会自动销毁(创建单例时会执行onInst方法) */
function createSingleton<T>(clazz: { new(): T }): T {
    if (!clazz[instFieldName]) {
        let instance = new clazz();
        clazz[instFieldName] = instance;
        if (!singletonSet.has(clazz)) {
            singletonSet.add(clazz);
        }
        let onInst: Function = instance[onInstFuncName];
        if (onInst && typeof onInst === "function") {
            onInst.call(instance);
        }
    }
    return clazz[instFieldName];
}

//游戏重启时清除单例
game.on(Game.EVENT_RESTART, () => {
    singletonSet.forEach(clazz => {
        clazz[instFieldName] = undefined;
    });
    singletonSet.clear();
});

//@ts-ignore
globalThis.createSingleton = createSingleton;

declare global {
    /** 创建单例并缓存,在引擎重启时会自动销毁(创建单例时会执行onInst方法) */
    const createSingleton: <T>(clazz: { new(): T }) => T;
}