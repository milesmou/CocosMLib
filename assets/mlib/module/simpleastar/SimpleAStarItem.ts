export abstract class SimpleAStarItem<T extends SimpleAStarItem<T>> {

    /** 父元素 用于寻路的回退 */
    public parent: T = null;
    /** 寻路时 计算出的临时权重值 */
    public weight: number = 0;

}