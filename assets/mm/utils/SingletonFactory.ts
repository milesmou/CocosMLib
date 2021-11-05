
/** 单例工厂,通过单例工厂实例化的单例对象被存起来,可以手动在引擎重启的时候销毁 */
export class SingletonFactory {

    private static clazz: any[] = [];

    /** 创建一个单例,并保存到列表中 */
    public static getInstance<T>(clazz: any): T {
        if (!clazz["_instance"]) {
            clazz["_instance"] = new clazz();
        }
        if (!SingletonFactory.clazz.includes(clazz)) {
            SingletonFactory.clazz.push(clazz);
        }
        return clazz["_instance"];
    }

    /** 清空所有单例 */
    public static clear() {
        SingletonFactory.clazz.forEach(v => {
            v["_instance"] = undefined;
        });
        SingletonFactory.clazz.length = 0;
    }
}

