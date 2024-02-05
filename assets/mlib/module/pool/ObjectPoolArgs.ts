/** 对象池创建参数 */
export class ObjectPoolArgs<T extends object = object> {

    /** 初始化时创建对象数量 */
    defaultCreateNum: number;

    /** 对象迟数量不足时创建新对象 */
    newObject: () => T;

    /** 获取对象时的处理 */
    onGetObject?: (obj: T) => void;

    /** 放回对象时的处理 */
    onPutObject?: (obj: T) => void;

    /** 销毁对象时的处理 */
    onDestroyObject?: (obj: T) => void;
}