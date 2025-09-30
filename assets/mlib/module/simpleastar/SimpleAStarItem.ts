export abstract class SimpleAStarItem<T extends SimpleAStarItem<T>> {

    /** 父节点（路径回溯用） */
    public parent: T | null = null;

    /** g：起点到当前节点的实际代价 */
    public g: number = 0;

    /** h：从当前节点到目标节点的启发式估算代价 */
    public h: number = 0;

    /** f：总代价 = g + h */
    public f: number = 0;

    /** 每个节点必须有唯一 key，用来存 Map */
    public abstract getKey(): string;
}
