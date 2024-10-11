import { ObjectPool } from './ObjectPool';
import { ObjectPoolArgs } from './ObjectPoolArgs';

/** 对象池工具类 */
export class PoolMgr {
    private static pools: Map<string, ObjectPool> = new Map();

    /** 清理所有对象池 */
    static clear() {
        this.pools.forEach(v => v.destroy());
        this.pools.clear();
    }

    /**
     * 初始化一个对象池
     * @param poolName 对象池名字
     * @param prefab 对象池创建参数
     */
    static initPool(poolName: string, args: ObjectPoolArgs) {
        if (!this.pools.has(poolName)) {
            let pool = new ObjectPool(args);
            this.pools.set(poolName, pool);
        } else {
            mLogger.warn("请勿重复创建对象池!");
        }
    }
    /**
     * 从对象池中获取对象
     * @param poolName 对象池名字
     */
    static get<T extends object = object>(poolName: string) {
        if (this.pools.has(poolName)) {
            let pool = this.pools.get(poolName);
            return pool.get() as T;
        } else {
            mLogger.error("对象池不存在!");
        }
    }
    /**
     * 回收节点
     * @param poolName 对象池名字
     * @param obj 对象或对象数组
     */
    static put<T extends object = object>(poolName: string, obj: T | T[]) {
        if (this.pools.has(poolName)) {
            let pool = this.pools.get(poolName)!;
            if (obj instanceof Array) {
                obj.forEach(node => {
                    pool.put(node);
                })
            } else {
                pool.put(obj);
            }
        } else {
            mLogger.error("对象池不存在!");
        }
    }
}


