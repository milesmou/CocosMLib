/** 对象池枚举 */
export enum PoolKey {
    ToastItem,
}

/** 对象池工具类 */
export class PoolMgr {

    private prefabs: Map<number, cc.Prefab | cc.Node> = new Map();
    private pools: Map<number, cc.NodePool> = new Map();

    /**
     * 初始化一个对象池
     * @param poolName 对象池名字
     * @param item 预制体或模板Node
     * @param num 初始化节点数量
     * @param dt 每帧消耗时间(毫秒)
     */
    initPool(poolName: number, item: cc.Prefab | cc.Node, itemNum: number, dt = 5) {
        if (!this.pools.has(poolName)) {
            let pool = new cc.NodePool();
            this.prefabs.set(poolName, item);
            this.pools.set(poolName, pool);
            if (itemNum <= 0) return;
            let gen = this.itemGen(pool, item, itemNum);
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
                        if (d2 - d1 >= dt) {
                            new cc.Component().scheduleOnce(execute);
                            break;
                        }
                    }
                }
                execute();
            });
            return p;
        }
    }

    /**
     * 从对象池中获取节点
     * @param poolName?对象池名字
     */
    get(poolName: number) {
        if (this.pools.has(poolName)) {
            let pool = this.pools.get(poolName);
            if (pool.size() > 0) {
                return pool.get();
            } else {
                return cc.instantiate(this.prefabs.get(poolName)) as cc.Node;
            }
        } else {
            cc.error("对象池不存在!");
        }
    }

    /**
     * 回收节点
     * @param poolName 对象池名字
     * @param nodeRes 节点或节点数组
     */
    put(poolName: number, nodeRes: cc.Node | cc.Node[]) {
        if (this.pools.has(poolName)) {
            let pool = this.pools.get(poolName);
            if (nodeRes instanceof Array) {
                while (nodeRes.length > 0) {
                    pool.put(nodeRes[0]);
                }
            } else {
                pool.put(nodeRes);
            }
        } else {
            cc.error("对象池不存在!");
        }
    }

    /** 清空对象池 */
    clearPool(poolName: number) {
        if (this.pools.has(poolName)) {
            let pool = this.pools.get(poolName);
            pool.clear();
            this.pools.delete(poolName);
        } else {
            cc.error("对象池不存在!");
        }
    }

    *itemGen(pool: cc.NodePool, item: cc.Prefab | cc.Node, itemNum: number) {
        for (let i = 0; i < itemNum; i++) {
            let func = () => {
                pool.put(cc.instantiate(item as cc.Node));
            }
            yield func;
        }
    };
}
