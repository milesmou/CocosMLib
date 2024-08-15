import { SimpleAStarItem } from "./SimpleAStarItem";


/** 一个极简的A*寻路 */
export abstract class SimpleAStar<T extends SimpleAStarItem<T>>{

    /** 所有元素 */
    protected dataList: T[];

    /** 所有元素 */
    protected dataMap: Map<string, T>;

    /** 当前可用于寻路的元素 */
    private _openList: T[];

    /** 本次寻路已排除的元素 */
    private _closeList: T[];

    /** 初始化 */
    public abstract init(): void;

    /** 获取相邻且可通行的元素 */
    public abstract getNeighbors(item: T): T[];

    /** 计算2个元素之间的权重 */
    public abstract getWight(item1: T, item2: T): number;


    /** 根据传入的起点和终点 返回一条最近的路线 */
    public findPath(start: T, end: T): T[] {

        this._openList = [];
        this._closeList = [];
        this._openList.push(start);
        start.parent = null;

        while (this._openList.length > 0) {
            let item = this.getMinWeightItem();
            this._closeList.push(item);
            let neighbors = this.getNeighbors(item);

            for (const neighbor of neighbors) {
                if (this._closeList.indexOf(neighbor) > -1) continue;//忽略已在closelist的

                let weight = this.getWight(item, neighbor) + this.getWight(neighbor, end);
                if (neighbor == end) {//寻路结束
                    neighbor.parent = item;
                    return this.getPath(neighbor);
                }
                else if (this._openList.indexOf(neighbor) > -1) {//已在openlist，如果权重更小则替换
                    if (neighbor.weight > weight) {
                        neighbor.parent = item;
                        neighbor.weight = weight;
                    }
                } else {//加入openlist
                    neighbor.parent = item;
                    neighbor.weight = weight;
                    this._openList.push(neighbor);
                }
            }
        }

        return null;
    }

    /** 寻路结束 返回路径 */
    private getPath(item: T): T[] {
        let result: T[] = [];
        let v = item;
        while (v) {
            result.push(v);
            v = v.parent;
        }
        return result.reverse();
    }

    /** 获取openlist中权重最小的一个并从openlist中移除 */
    private getMinWeightItem(): T {
        let minWeightItem: T = null;
        let index = -1;
        for (let i = 0; i < this._openList.length; i++) {
            const neighbor = this._openList[i];
            if (minWeightItem == null) {
                minWeightItem = neighbor;
                index = i;
                continue;
            } else {
                if (neighbor.weight < minWeightItem.weight) {
                    minWeightItem = neighbor;
                    index = i;
                }
            }
        }
        this._openList.splice(index, 1);
        return minWeightItem;

    }
}
