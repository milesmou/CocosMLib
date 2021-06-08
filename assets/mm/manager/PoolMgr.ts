/** 对象池枚举 */
export enum PoolKey {
    Miles,
    Mou,
}

/** 对象池工具类 */
export class PoolMgr {

    private prefabs: Map<number, cc.Prefab> = new Map();
    private pools: Map<number, cc.NodePool> = new Map();

    /**
     * 初始化一个对象池
     * @param poolName 对象池名字
     * @param prefab 预制体
     * @param num 初始化节点数量
     */
    initPool(poolName: number, prefab: cc.Prefab, itemNum: number) {
        if (!this.pools.has(poolName)) {
            let pool = new cc.NodePool();
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
                            new cc.Component().scheduleOnce(execute);
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
            let pool = this.pools.get(poolName);
            if (pool.size() > 0) {
                return pool.get();
            } else {
                return cc.instantiate(this.prefabs.get(poolName));
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
            console.error("对象池不存在!");
        }
    }

    *itemGen(pool: cc.NodePool, prefab: cc.Prefab, itemNum: number) {
        for (let i = 0; i < itemNum; i++) {
            let func = () => {
                pool.put(cc.instantiate(prefab))
            }
            yield func;
        }
    };
}
