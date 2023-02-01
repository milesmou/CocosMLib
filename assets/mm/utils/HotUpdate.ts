//注意：修改热更新工具使导出的Manifest文件中的packageUrl地址追加版本号(manifest-gen.js中packageUrl:t替换为packageUrl:t+"/"+e)
//注意：整包更新清除本地热更缓存 否则覆盖安装的包不会生效，执行以下两步
//1.修改热更新工具main_code.js中的搜索路径：var hotUpdateSearchPaths = localStorage.getItem('HotUpdateSearchPaths');中的HotUpdateSearchPaths
//2.修改当前脚本中的搜索路径：cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));中的HotUpdateSearchPaths，与步骤1的key保持一致

import { _decorator, Asset, sys, assetManager } from 'cc';
export enum HotUpdateCode {
    UpToDate,//已经是最新版本
    ManifestError,//manifest文件异常
    Success,//更新成功
    Fail//更新失败
}

export class HotUpdate {
    private readonly TAG = "[HotUpdate]";
    private constructor() { }
    private static inst: HotUpdate;
    public static get Inst() { return this.inst || (this.inst = new HotUpdate()) }
    manifest: Asset | null = null;//本地project.manifest文件
    assetsMgr!: jsb.AssetsManager;//jsb资源管理器
    updating = false; //更新中
    failCount = 3;//更新失败重试次数
    setTips!: (content: string) => void;
    progress!: (loaded: number, total: number) => void;
    complete!: (code: HotUpdateCode) => void;
    start(manifest: Asset, setTips: (content: string) => void, progress: (loaded: number, total: number) => void, complete: (code: HotUpdateCode) => void) {
        if (!sys.isNative) {
            console.warn(this.TAG, "非原生环境");
            return;
        }
        this.manifest = manifest;
        this.setTips = setTips;
        this.progress = progress;
        this.complete = complete;

        let storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'miles_remote_asset');
        console.log(this.TAG, '热更新资源存放路径：' + storagePath);

        this.setTips("Checking For Update");
        this.assetsMgr = new jsb.AssetsManager("", storagePath, this.versionCompareHandle.bind(this));
        this.assetsMgr.setVerifyCallback(this.VerifyHandle.bind(this));
        this.checkHotUpdate();
    }
    versionCompareHandle(versionA: string, versionB: string) {
        console.log(this.TAG, "客户端版本: " + versionA + ', 当前最新版本: ' + versionB);
        let vA = versionA.split('.');
        let vB = versionB.split('.');
        for (let i = 0; i < vA.length; ++i) {
            let a = parseInt(vA[i]);
            let b = parseInt(vB[i]);
            if (a === b) {
                continue;
            } else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        } else {
            return 0;
        }
    }

    VerifyHandle(path: string, asset: jsb.ManifestAsset) {
        let { compressed } = asset;
        if (compressed) {
            return true;
        } else {
            return true;
        }
    }

    checkHotUpdate() {
        if (this.updating) {
            return;
        }
        if (this.assetsMgr.getState() === jsb.AssetsManager.State.UNINITED) {
            let url = this.manifest!.nativeUrl;
            // if (assetManager.md5Pipe) {
            //     url = loader.md5Pipe.transformURL(url);
            // }
            this.assetsMgr.loadLocalManifest(url);
        }
        if (!this.assetsMgr.getLocalManifest() || !this.assetsMgr.getLocalManifest().isLoaded()) {
            console.log(this.TAG, "加载本地project.manifest文件失败");
            this.onUpdateComplete(HotUpdateCode.ManifestError);
            return;
        }
        this.assetsMgr.setEventCallback(this.hotUpdateCb.bind(this, 0));
        this.assetsMgr.checkUpdate();
    }

    hotUpdate() {
        if (!this.updating) {
            this.assetsMgr.setEventCallback(this.hotUpdateCb.bind(this, 1));
            this.assetsMgr.update();
            this.updating = true;
        }
    }

    /** 0:检测更新 1:下载更新 */
    hotUpdateCb(state: 0 | 1, event: jsb.EventAssetsManager) {
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                state == 1 && this.setTips("Downloading Updates");
                console.log(this.TAG, `下载进度 ：${event.getDownloadedFiles()} / ${event.getTotalFiles()} `);
                this.progress(event.getDownloadedFiles(), event.getTotalFiles());
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                console.log(this.TAG, "New Version Found");
                state == 0 && this.setTips("发现新版本，准备下载");
                this.hotUpdate();
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                state == 0 && this.setTips("Already Up To Date");
                console.log(this.TAG, '已经是最新版本');
                this.onUpdateComplete(HotUpdateCode.UpToDate);
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                state == 1 && this.setTips("Finished，Ready To Restart Game");
                console.log(this.TAG, '更新完成', event.getMessage());
                this.onUpdateComplete(HotUpdateCode.Success);
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                state == 1 && console.log(this.TAG, '更新失败', event.getMessage());
                this.updating = false;
                this.failCount--;
                if (this.failCount >= 0) {
                    this.hotUpdate();
                } else {
                    this.onUpdateFail();
                }
                break;
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                console.log(this.TAG, 'manifest文件异常', event.getMessage());
                this.onUpdateComplete(HotUpdateCode.ManifestError);
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                console.warn(this.TAG, '更新出错', event.getEventCode(), event.getMessage());
                this.onUpdateFail();
                break;
        }
    }

    onUpdateComplete(code: HotUpdateCode.UpToDate | HotUpdateCode.Success | HotUpdateCode.ManifestError) {
        if (code == HotUpdateCode.Success) {
            let searchPaths = jsb.fileUtils.getSearchPaths();
            let newPaths = this.assetsMgr.getLocalManifest().getSearchPaths();
            console.log(this.TAG, "搜索路径: " + JSON.stringify(newPaths));
            Array.prototype.unshift.apply(searchPaths, newPaths);//追加脚本搜索路径
            // !!!在main.js中添加脚本搜索路径，否则热更的脚本不会生效
            sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);
        }
        this.assetsMgr.setEventCallback(null!);
        this.complete(code);
    }

    onUpdateFail() {
        this.assetsMgr.setEventCallback(null!);
        this.complete(HotUpdateCode.Fail);
    }
}
