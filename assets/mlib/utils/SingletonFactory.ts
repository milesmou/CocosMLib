
/** 单例工厂,通过单例工厂实例化的单例对象被存起来,可以在引擎重启的时候销毁所有实例 */
export class SingletonFactory {

    private static clazz: Set<any> = new Set();

    /** 创建一个单例,并保存到列表中,在重启游戏时销毁 */
    public static getInstance<T>(clazz: { new(): T }): T {
        if (!clazz["_instance"]) {
            let instance = new clazz();
            clazz["_instance"] = instance;
            if (!SingletonFactory.clazz.has(clazz)) {
                SingletonFactory.clazz.add(clazz);
            }
            let onInst: Function = instance['onInst'];
            if (onInst && typeof onInst === "function") {
                onInst.call(instance);
            }
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