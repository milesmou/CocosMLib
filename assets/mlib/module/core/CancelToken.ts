/** 用于取消一些异步任务 */
export class CancelToken {
    private _isCancelled = false;
    /** 任务是否已经取消 */
    public get isCancelled() { return this._isCancelled; }
    /** 取消任务 */
    public cancel() {
        this._isCancelled = true;
    }
}