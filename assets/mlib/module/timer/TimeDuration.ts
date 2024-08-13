/** 时长统计工具类 */
export class TimeDuration {

    private static inst: TimeDuration;
    public static get Inst() { return this.inst || (this.inst = new TimeDuration()) }

    private _startTimeMS: Map<string, number> = new Map();

    /** 给予一个Key，并开始计时 */
    public time(key: string) {
        if (this._startTimeMS.has(key)) {
            console.warn("Key已存在", key);
        }
        this._startTimeMS.set(key, Date.now());
    }

    /** 结束指定Key的计时，并返回时长 */
    public timeEnd(key: string) {
        if (!this._startTimeMS.has(key)) {
            console.error("Key不存在", key);
            return 0;
        }
        let start = this._startTimeMS.get(key);
        return Date.now() - start;
    }
}