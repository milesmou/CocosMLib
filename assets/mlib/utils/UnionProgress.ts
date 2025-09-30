/**
 *  联合进度条 (串行加载时使用)
 *  可以对多个加载项的进度进行汇总，累计每一项进度得到一个综合进度
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
    public constructor(onProgress: (loaded: number, total: number) => void, loadItemNum: number) {
        this._onProgress = onProgress;
        this._loadItemNum = loadItemNum;
        this._loadProgress.clear();
    }

    /**
     * @param onProgress 总进度回调方法
     * @param loadItemNum 加载项数量
     */
    public init(onProgress: (loaded: number, total: number) => void, loadItemNum = 1) {
        this._onProgress = onProgress;
        this._loadItemNum = loadItemNum;
        this._loadProgress.clear();
        return this;
    }

    /** 获取一个加载项的进度回调方法 */
    public getOnProgress(key: string, debug = false) {
        return (loaded: number, total: number) => {
            this._loadProgress.set(key, loaded / total);
            if (!this._onProgress) return;
            let totalProgress = 0;
            for (const v of this._loadProgress.values()) {
                totalProgress += (v || 0);
            }
            if (debug) mLogger.debug(`${key}:${loaded}/${total}`)
            this._onProgress(totalProgress, this._loadItemNum);
        }
    }
}

/**
 *  联合进度条 (并行加载时使用)
 *  可以对多个加载项的进度进行处理，以最慢的进度为当前进度
 */
export class SlowProgress {

    /** 当前进度条有多少个加载项(每个加载项有自己的加载进度) */
    private _loadItemNum: number = 1;
    /** 每个加载项的加载进度 */
    private _loadProgress: Map<string, number> = new Map();
    /** 总进度回调方法 */
    private _onProgress: (loaded: number, total: number) => void;

    /**
     * @param onProgress 总进度回调方法
     * @param loadItemNum 加载项数量
     */
    public constructor(onProgress: (loaded: number, total: number) => void, loadItemNum: number) {
        this._onProgress = onProgress;
        this._loadItemNum = loadItemNum;
        this._loadProgress.clear();
    }

    /** 获取一个加载项的进度回调方法 */
    public getOnProgress(key: string, debug = false) {
        return (loaded: number, total: number) => {
            this._loadProgress.set(key, loaded / total);
            if (!this._onProgress) return;
            if (this._loadProgress.size < this._loadItemNum) {
                this._onProgress(0, 1);
            } else {
                let min = 1;
                for (const v of this._loadProgress.values()) {
                    let vv = (v || 0);
                    if (vv < min) min = v;
                }
                if (debug) mLogger.debug(`${key}:${loaded}/${total}`)
                this._onProgress(min, 1);
            }
        }
    }
}