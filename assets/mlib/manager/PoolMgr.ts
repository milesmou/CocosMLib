import { _decorator, Prefab, NodePool, Node, instantiate, Component } from 'cc';

/** 对象池枚举 */
export enum PoolKey {
    Miles,
    Mou,
}

/** 对象池工具类 */
export class PoolMgr {
    private prefabs: Map<number, Prefab> = new Map();
    private pools: Map<number, NodePool> = new Map();
    /**
     * 初始化一个对象池
     * @param poolName 对象池名字
     * @param prefab 预制体
     * @param num 初始化节点数量
     */
    initPool(poolName: number, prefab: Prefab, itemNum: number) {
        if (!this.pools.has(poolName)) {
            let pool = new NodePool();
            this.prefabs.set(poolName, prefab);
            this.pools.set(poolName, pool);
            let gen = this.itemGen(pool, prefab, itemNum);
            let p = new Promise<void>((resolve, reject) => {
                let execute = () => {
                    let d1 = Date.now();
                    for (let e = gen.next(); ; e = gen.next()) {
                        if (!e || e.done) {
                            resolve();
                            break;
                        }
                        if (typeof e.value == "function") {
                            e.value();
                        }
                        let d2 = Date.now();
                        if (d2 - d1 >= 3) {
                            new Component().scheduleOnce(execute);
                            break;
                        }
                    }
                }
                execute();
            });
            return p;
        } else {
            console.warn("请勿重复创建对象池!");
        }
    }
    /**
     * 从对象池中获取节点
     * @param poolName?对象池名字
     */
    get(poolName: number) {
        if (this.pools.has(poolName)) {
            let pool = this.pools.get(poolName)!;
            if (pool.size() > 0) {
                return pool.get();
            } else {
                return instantiate(this.prefabs.get(poolName));
            }
        } else {
            console.error("对象池不存在!");
        }
    }
    /**
     * 回收节点
     * @param poolName 对象池名字
     * @param nodeRes 节点或节点数组
     */
    put(poolName: number, nodeRes: Node | Node[]) {
        if (this.pools.has(poolName)) {
            let pool = this.pools.get(poolName)!;
            if (nodeRes instanceof Array) {
                nodeRes.forEach(node => {
                    pool.put(node);
                })
            } else {
                pool.put(nodeRes);
            }
        } else {
            console.error("对象池不存在!");
        }
    }
    *itemGen(pool: NodePool, prefab: Prefab, itemNum: number) {
        for (let i = 0; i < itemNum; i++) {
            let func = () => {
                pool.put(instantiate(prefab))
            }
            yield func;
        }
    }
}


