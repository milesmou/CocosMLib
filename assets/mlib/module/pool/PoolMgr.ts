import { game, Game } from 'cc';
import { ObjectPool } from './ObjectPool';
import { ObjectPoolArgs } from './ObjectPoolArgs';

/** 对象池工具类 */
export class PoolMgr {
    
    private static poolMap: Map<string, ObjectPool> = new Map();

    /** 清理所有对象池 */
    static clear() {
        this.poolMap.forEach(v => v.destroy());
        this.poolMap.clear();
    }

    /**
     * 初始化一个对象池
     * @param poolName 对象池名字
     * @param prefab 对象池创建参数
     */
    static initPool(poolName: string, args: ObjectPoolArgs) {
        if (!this.poolMap.has(poolName)) {
            let pool = new ObjectPool(args);
            this.poolMap.set(poolName, pool);
        } else {
            logger.warn("请勿重复创建对象池!");
        }
    }
    /**
     * 从对象池中获取对象
     * @param poolName 对象池名字
     */
    static get<T extends object = object>(poolName: string) {
        if (this.poolMap.has(poolName)) {
            let pool = this.poolMap.get(poolName);
            return pool.get() as T;
        } else {
            logger.error("对象池不存在!");
        }
    }
    /**
     * 回收节点
     * @param poolName 对象池名字
     * @param obj 对象或对象数组
     */
    static put<T extends object = object>(poolName: string, obj: T | T[]) {
        if (this.poolMap.has(poolName)) {
            let pool = this.poolMap.get(poolName)!;
            if (obj instanceof Array) {
                obj.forEach(node => {
                    pool.put(node);
                })
            } else {
                pool.put(obj);
            }
        } else {
            logger.error("对象池不存在!");
        }
    }
}


//游戏重启时清除所有事件
game.on(Game.EVENT_RESTART, () => {
    PoolMgr.clear();
});