/** 对象池创建参数 */
export interface ObjectPoolArgs<T extends object = object> {

    /** 初始化时创建对象数量 */
    createNum: number;

    /** 对象池数量不足时创建新对象 */
    newObject: () => T;

    /** 对象能否放回对象池 默认可以放回 */
    canPutObject?: (obj: T) => boolean

    /** 获取对象时的处理 */
    onGetObject?: (obj: T) => void;

    /** 放回对象时的处理 */
    onPutObject?: (obj: T) => void;

    /** 销毁对象时的处理 */
    onDestroyObject?: (obj: T) => void;
}