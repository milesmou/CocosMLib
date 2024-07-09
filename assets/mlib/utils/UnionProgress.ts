/**
 *  联合进度条
 *  可以对多个加载项的进度进行汇总
 */
export class UnionProgress {

    /** 当前进度条有多少个加载项(每个加载项有自己的加载进度,所以要自己计算综合进度) */
    private _loadItemNum: number = 1;
    /** 每个加载项的加载进度 */
    private _loadProgress: Map<string, number> = new Map();
    /** 总进度回调方法 */
    private _onProgress: (loaded: number, total: number) => void;

    /**
     * @param onProgress 总进度回调方法
     * @param loadItemNum 加载项数量
     */
    public constructor(onProgress: (loaded: number, total: number) => void, loadItemNum = 1) {
        this._onProgress = onProgress;
        this._loadItemNum = loadItemNum;
    }

    /** 获取一个加载项的进度回调方法 */
    public getOnProgress(key: string) {
        return (loaded: number, total: number) => {
            this._loadProgress.set(key, loaded / total);
            let totalProgress = 0;
            for (const v of this._loadProgress.values()) {
                totalProgress += (v || 0);
            }
            this._onProgress(totalProgress, this._loadItemNum);
        }
    }
}