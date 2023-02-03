import { game } from "cc";

/** 单例工厂,通过单例工厂实例化的单例对象被存起来,可以手动在引擎重启的时候销毁 */
export class SingletonFactory {

    private static clazz: Set<any> = new Set();

    /** 创建一个单例,并保存到列表中,在重启游戏时销毁 */
    public static getInstance<T>(clazz: { new(): T }, onInst?: (t: T) => void): T {
        if (!clazz["_instance"]) {
            clazz["_instance"] = new clazz();
            if (!SingletonFactory.clazz.has(clazz)) {
                SingletonFactory.clazz.add(clazz);
            }
            onInst && onInst(clazz["_instance"]);
        }
        return clazz["_instance"];
    }

    /** 清空所有单例 */
    public static clear() {
        SingletonFactory.clazz.forEach(v => {
            v["_instance"] = undefined;
        });
        SingletonFactory.clazz.clear();
    }
}

game.onStart = SingletonFactory.clear;
