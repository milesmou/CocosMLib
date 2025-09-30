import { SimpleAStarItem } from "./SimpleAStarItem";

/** 标准 A* 寻路模板 */
export abstract class SimpleAStar<T extends SimpleAStarItem<T>> {

    /** 获取相邻且可通行的节点 */
    public abstract getNeighbors(item: T): T[];

    /** 获取两个节点之间的实际代价（曼哈顿距离、欧几里得距离,用于累加给item的g值） */
    public abstract getG(item1: T, item2: T): number;

    /** 获取两个节点之间的预估代价（曼哈顿距离、欧几里得距离） */
    public abstract getH(item: T, end: T): number;

    /** 寻路 */
    public findPath(start: T, end: T): T[] | null {

        const openSet: Map<string, T> = new Map();
        const closedSet: Set<string> = new Set();

        start.g = 0;
        start.h = this.getH(start, end);
        start.f = start.g + start.h;
        start.parent = null;

        openSet.set(start.getKey(), start);

        while (openSet.size > 0) {
            // 取出 f 最小的节点
            let current = this.getLowestFNode(openSet);
            if (current === end) {
                return this.reconstructPath(current);
            }

            openSet.delete(current.getKey());
            closedSet.add(current.getKey());

            for (const neighbor of this.getNeighbors(current)) {
                if (closedSet.has(neighbor.getKey())) continue;

                const tentativeG = current.g + this.getG(current, neighbor);

                // 新节点 或者 找到更优路径
                if (!openSet.has(neighbor.getKey()) || tentativeG < neighbor.g) {
                    neighbor.parent = current;
                    neighbor.g = tentativeG;
                    neighbor.h = this.getH(neighbor, end);
                    neighbor.f = neighbor.g + neighbor.h;

                    openSet.set(neighbor.getKey(), neighbor);
                }
            }
        }

        return null; // 没找到路径
    }

    /** 回溯路径 */
    private reconstructPath(node: T): T[] {
        const path: T[] = [];
        let current: T | null = node;
        while (current) {
            path.push(current);
            current = current.parent;
        }
        return path.reverse();
    }

    /** 在 openSet 中取 f 最小的节点 */
    private getLowestFNode(openSet: Map<string, T>): T {
        let best: T | null = null;
        for (const node of openSet.values()) {
            if (best === null || node.f < best.f) {
                best = node;
            }
        }
        return best!;
    }
}
