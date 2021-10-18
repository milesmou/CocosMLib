
/** 单例工厂,通过单例工厂实例化的单例对象在引擎重启时会被销毁 */
export class SingletonFactory {

    public static clazz: any[] = [];

    public static getInstance<T>(clazz: any): T {
        if (!clazz["_instance"]) {
            clazz["_instance"] = new clazz();
        }
        if (!SingletonFactory.clazz.includes(clazz)) {
            SingletonFactory.clazz.push(clazz);
        }
        return clazz["_instance"];
    }
}

const clearSingletonClass = function () {
    SingletonFactory.clazz.forEach(v => {
        v["_instance"] = undefined;
    });
}

cc.game.on(cc.game.EVENT_RESTART, clearSingletonClass);

