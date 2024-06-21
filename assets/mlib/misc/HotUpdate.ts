
//1.在 main.js 的开头添加链接中代码(https://docs.cocos.com/creator/2.4/manual/zh/advanced-topics/hot-update.html)
//2.修改main.js和当前脚本的搜索路径key，使其保持一致
//3.通常使用3位版本号(x.x.x)作为存储搜索路径的key

import { Asset, native, sys } from "cc";

export enum EHotUpdateState {
    CheckUpdate,//检查更新
    DownloadFiles,//下载更新
    Finished,//结束更新
}

export enum EHotUpdateResult {
    UpToDate,//已经是最新版本
    ManifestError,//manifest文件异常
    Success,//更新成功
    Fail//更新失败
}

export class HotUpdate {

    private constructor() { }
    private static inst: HotUpdate;
    public static get Inst() { return this.inst || (this.inst = new HotUpdate()) }
    private _logger = logger.new("HotUpdate")
    private _manifest: Asset = null;//本地project.manifest文件
    private _version: string;//游戏主版本号 只有三位
    private _assetsMgr: native.AssetsManager;//native资源管理器
    private _updating = false; //更新中
    private _failCount = 3;//更新失败重试次数
    private _onStateChange: (code: EHotUpdateState) => void;
    private _onDownloadProgress: (loaded: number, total: number) => void;
    private _onComplete: (code: EHotUpdateResult) => void;

    private get storagePath() { return native.fileUtils.getWritablePath() + 'miles_remote_asset'; }

    public start(manifest: Asset, version: string, onStateChange: (code: EHotUpdateState) => void, onDownloadProgress: (loaded: number, total: number) => void, onComplete: (code: EHotUpdateResult) => void) {
        if (!sys.isNative) {
            this._logger.warn("非原生环境");
            return;
        }

        this._manifest = manifest;
        this._version = version;
        this._onStateChange = onStateChange;
        this._onDownloadProgress = onDownloadProgress;
        this._onComplete = onComplete;

        this._logger.debug('热更新资源存放路径：' + this.storagePath);

        this._onStateChange(EHotUpdateState.CheckUpdate);

        this._assetsMgr = new native.AssetsManager("", this.storagePath, this.versionCompareHandle.bind(this));
        this._assetsMgr.setVerifyCallback(this.verifyHandle.bind(this));
        this.checkUpdate();
    }

    private versionCompareHandle(versionA: string, versionB: string) {
        this._logger.print("客户端版本: " + versionA + ', 当前最新版本: ' + versionB);
        if (versionA != versionB) return -1;
        return 0;
    }

    // Setup the verification callback, but we don't have md5 check function yet, so only print some message
    // Return true if the verification passed, otherwise return false
    private verifyHandle(path: string, asset: native.ManifestAsset) {
        // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
        let compressed = asset.compressed;
        // Retrieve the correct md5 value.
        let expectedMD5 = asset.md5;
        // asset.path is relative path and path is absolute.
        let relativePath = asset.path;
        // The size of asset file, but this value could be absent.
        let size = asset.size;
        if (compressed) {
            return true;
        } else {
            return true;
        }
    }

    /** 检查更新 */
    private checkUpdate() {
        this._logger.debug("检查更新");
        if (this._updating) {
            return;
        }
        if (this._assetsMgr.getState() === native.AssetsManager.State.UNINITED) {
            let url = this._manifest.nativeUrl;
            this._assetsMgr.loadLocalManifest(url);
        }
        if (!this._assetsMgr.getLocalManifest() || !this._assetsMgr.getLocalManifest().isLoaded()) {
            this._logger.error("加载本地project.manifest文件失败");
            this.onUpdateComplete(EHotUpdateResult.ManifestError);
            return;
        }
        this._assetsMgr.setEventCallback(this.checkUpdateCb.bind(this));
        this._assetsMgr.checkUpdate();
    }

    /** 下载更新文件 */
    private downloadFiles() {
        this._onStateChange(EHotUpdateState.DownloadFiles);
        this._logger.debug("下载更新");
        if (!this._updating) {
            this._assetsMgr.setEventCallback(this.downloadFilesCb.bind(this));
            this._assetsMgr.update();
            this._updating = true;
        }
    }


    /** 检查更新回调 */
    private checkUpdateCb(event: native.EventAssetsManager) {
        switch (event.getEventCode()) {
            case native.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this._logger.error('manifest文件异常 ERROR_NO_LOCAL_MANIFEST', event.getMessage());
                this.onUpdateComplete(EHotUpdateResult.ManifestError);
                break;
            case native.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                this._logger.error('manifest文件异常 ERROR_DOWNLOAD_MANIFEST', event.getMessage());
                this.onUpdateComplete(EHotUpdateResult.ManifestError);
                break;
            case native.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this._logger.error('manifest文件异常 ERROR_PARSE_MANIFEST', event.getMessage());
                this.onUpdateComplete(EHotUpdateResult.ManifestError);
                break;
            case native.EventAssetsManager.NEW_VERSION_FOUND:
                this._logger.debug("发现新版本，准备下载");
                this.downloadFiles();
                break;
            case native.EventAssetsManager.ALREADY_UP_TO_DATE:
                this._logger.debug('已经是最新版本');
                this.onUpdateComplete(EHotUpdateResult.UpToDate);
                break;
            case native.EventAssetsManager.UPDATE_PROGRESSION:
                this._logger.debug('下载清单文件进度', event.getDownloadedFiles(), event.getTotalFiles());
                break;
            default:
                this._logger.debug("checkUpdateCb 未处理的情况", event.getEventCode(), event.getMessage());
        }
    }

    /** 下载更新文件回调 */
    private downloadFilesCb(event: native.EventAssetsManager) {
        switch (event.getEventCode()) {
            case native.EventAssetsManager.UPDATE_PROGRESSION:
                this._logger.debug(`下载总进度 ：${event.getDownloadedFiles()} / ${event.getTotalFiles()} `);
                this._onDownloadProgress(event.getDownloadedFiles(), event.getTotalFiles());
                break;
            case native.EventAssetsManager.ASSET_UPDATED:
                this._logger.debug('下载资源', event.getAssetId());
                break;
            case native.EventAssetsManager.UPDATE_FINISHED:
                this._logger.debug('更新完成', event.getMessage());
                this.onUpdateComplete(EHotUpdateResult.Success);
                break;
            case native.EventAssetsManager.UPDATE_FAILED:
                this._logger.debug('更新失败', event.getMessage());
                this._updating = false;
                this._failCount--;
                if (this._failCount >= 0) {
                    this.downloadFiles();
                } else {
                    this.onUpdateFail();
                }
                break;

            case native.EventAssetsManager.ERROR_UPDATING:
                this._logger.error('更新出错 ERROR_UPDATING', event.getMessage());
                this.onUpdateFail();
                break;
            case native.EventAssetsManager.ERROR_DECOMPRESS:
                this._logger.error('更新出错 ERROR_DECOMPRESS', event.getMessage());
                this.onUpdateFail();
                break;



            default:
                this._logger.debug("downloadFilesCb 未处理的情况", event.getEventCode(), event.getMessage());
        }
    }

    private onUpdateComplete(code: EHotUpdateResult.UpToDate | EHotUpdateResult.Success | EHotUpdateResult.ManifestError) {
        this._onStateChange(EHotUpdateState.Finished);
        if (code == EHotUpdateResult.Success) {
            //重命名main.js依赖的相关文件,去掉文件名中的MD5后缀,不然main.js中无法加载相关资源
            this.renameSrcFiles();
            //追加脚本搜索路径
            let searchPaths = native.fileUtils.getSearchPaths();
            let newPaths = this._assetsMgr.getLocalManifest().getSearchPaths();
            Array.prototype.unshift.apply(searchPaths, newPaths);
            this._logger.debug(`新增搜索路径 ${JSON.stringify(newPaths)}`);
            this._logger.debug(`搜索路径 Key=${this._version}`);
            this._logger.debug(`搜索路径 Value=${JSON.stringify(searchPaths)}`);
            // !!!在main.js中添加脚本搜索路径，否则热更的脚本不会生效
            sys.localStorage.setItem(this._version, JSON.stringify(searchPaths));
            native.fileUtils.setSearchPaths(searchPaths);
        }
        this._assetsMgr.setEventCallback(null);
        this._onComplete(code);
    }

    private onUpdateFail() {
        this._assetsMgr.setEventCallback(null);
        this._onComplete(EHotUpdateResult.Fail);
    }

    private renameSrcFiles() {
        let files = native.fileUtils.listFiles(this.storagePath + "/src");
        files.forEach(v => {
            if (!native.fileUtils.isDirectoryExist(v)) {//文件
                let fileName = v.replace(native.fileUtils.getFileDir(v) + "/", "");
                let ext = native.fileUtils.getFileExtension(v);
                let newFileName = fileName.replace(ext, "");
                if (fileName == "system.bundle") return;
                let lastIndex = newFileName.lastIndexOf(".");
                if (lastIndex > -1) {
                    newFileName = newFileName.substring(0, lastIndex);
                }
                newFileName += ext;
                let newFile = v.replace(fileName, newFileName);
                native.fileUtils.renameFile(v, newFile);
                this._logger.debug("rename", v, "-->", newFile)
            }
        });
    }
}
