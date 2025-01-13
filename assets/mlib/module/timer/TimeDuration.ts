import { Game, game } from "cc";

/** 时长统计工具类 */
export class TimeDuration {

    private static startTimeMS: Map<string, number> = new Map();

    /** 脚本加载时自动执行 */
    protected static init = (() => {
        game.on(Game.EVENT_RESTART, () => {
            this.startTimeMS.clear();
        });
    })();

    /** 给予一个Key，并开始计时 */
    public static time(key: string) {
        if (this.startTimeMS.has(key)) {
            console.warn("Key已存在", key);
        }
        this.startTimeMS.set(key, Date.now());
    }

    /** 结束指定Key的计时，并返回时长 */
    public static timeEnd(key: string) {
        if (!this.startTimeMS.has(key)) {
            console.error("Key不存在", key);
            return 0;
        }
        let start = this.startTimeMS.get(key);
        return Date.now() - start;
    }

    /** 结束指定Key的计时，并打印时长 */
    public static timeEndLog(key: string) {
        if (!this.startTimeMS.has(key)) {
            console.error("Key不存在", key);
            return 0;
        }
        let start = this.startTimeMS.get(key);
        let dur = Date.now() - start;
        mLogger.debug(`${key}: ${dur}毫秒`)
    }

}