/** 对象池创建参数 */
export interface ObjectPoolArgs<T extends object = object> {

    /** 初始化时创建对象数量 */
    createNum: number;

    /** 对象池数量不足时创建新对象 */
    newObject: () => T;

    /** 获取对象时的处理 */
    onGetObject?: (obj: T) => void;

    /** 放回对象时的处理 返回false表示不放入对象池 */
    onPutObject?: (obj: T) => boolean | void;

    /** 销毁对象时的处理 */
    onDestroyObject?: (obj: T) => void;
}