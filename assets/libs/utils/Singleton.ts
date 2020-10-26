/**
 * 单例模式基类
 * 使用方式：继承Singleton，在子类中添加代码 public static get Inst(): T { return this.getInstance() }
 */
export default class Singleton {
    protected constructor() { }
    private static inst = null;
    protected static getInstance() {
        this.inst = this.inst || new this();
        return this.inst;
    }
}