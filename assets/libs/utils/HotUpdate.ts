export enum HotUpdateCode {
    NotNative,//不是原生环境
    ManifestNotFound,//本地manifest未找到
    ManifestUrlError,//远程manifest地址错误
    DownloadFail,//下载远程manifest失败
    UpToDate,//已经是最新版本
    UpdateSucc,//下载更新成功
    UpdateFail//下载更新失败
}

export class HotUpdate {

    manifest: cc.Asset = null;

    assetsMgr = null;//jsb资源管理器

    storagePath = "";//热更新文件缓存路径

    updating = false; //更新中

    failCount = 0;//更新失败次数

    canRetry = false;//能否重新更新

    resultCode: HotUpdateCode;

    progress: (completedCount: number, totalCount: number) => void;
    complete: (code: HotUpdateCode) => void;

    constructor(manifest: cc.Asset, progress: (completedCount: number, totalCount: number) => void, complete: (code: HotUpdateCode) => void) {

        if (!cc.sys.isNative) {
            complete(0);
            return;
        }
        this.manifest = manifest;
        this.progress = progress;
        this.complete = complete;
        this.storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'mouhong-remote-asset');
        console.log('Storage path for remote asset : ' + this.storagePath);

        this.assetsMgr = new jsb.AssetsManager("", this.storagePath, this.versionCompareHandle.bind(this));

        this.assetsMgr.setVerifyCallback(this.VerifyHandle.bind(this));

        this.checkUpdate();

    }

    versionCompareHandle(versionA, versionB) {
        console.log("Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
        var vA = versionA.split('.');
        var vB = versionB.split('.');
        for (var i = 0; i < vA.length; ++i) {
            var a = parseInt(vA[i]);
            var b = parseInt(vB[i] || 0);
            if (a === b) {
                continue;
            }
            else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        }
        else {
            return 0;
        }
    }

    VerifyHandle(path, asset) {
        // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
        var compressed = asset.compressed;
        // Retrieve the correct md5 value.
        var expectedMD5 = asset.md5;
        // asset.path is relative path and path is absolute.
        var relativePath = asset.path;
        // The size of asset file, but this value could be absent.
        var size = asset.size;
        if (compressed) {
            // console.log("Verification passed : " + relativePath);
            return true;
        }
        else {
            // console.log("Verification passed : " + relativePath + ' (' + expectedMD5 + ')');
            return true;
        }
    }


    checkUpdate() {
        if (this.updating) {
            return;
        }
        if (this.assetsMgr.getState() === jsb.AssetsManager.State.UNINITED) {
            // Resolve md5 url
            var url = this.manifest.nativeUrl;
            if (cc.loader.md5Pipe) {
                url = cc.loader.md5Pipe.transformURL(url);
            }
            this.assetsMgr.loadLocalManifest(url);
        }
        if (!this.assetsMgr.getLocalManifest() || !this.assetsMgr.getLocalManifest().isLoaded()) {
            // this.panel.info.string = 'Failed to load local manifest ...';
            return;
        }
        this.assetsMgr.setEventCallback(this.checkCb.bind(this));
        this.assetsMgr.checkUpdate();
        this.updating = true;
    }

    hotUpdate() {
        if (this.assetsMgr && !this.updating) {
            this.assetsMgr.setEventCallback(this.updateCb.bind(this));
            if (this.assetsMgr.getState() === jsb.AssetsManager.State.UNINITED) {
                // Resolve md5 url
                var url = this.manifest.nativeUrl;
                if (cc.loader.md5Pipe) {
                    url = cc.loader.md5Pipe.transformURL(url);
                }
                this.assetsMgr.loadLocalManifest(url);
            }
            this.failCount = 0;
            this.assetsMgr.update();
            this.updating = true;
        }
    }

    checkCb(event) {
        console.log('Code : ' + event.getEventCode());
        let msg = "";
        let readyToUpdate = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                msg = "No local manifest file found, hot update skipped.";
                this.resultCode = HotUpdateCode.ManifestNotFound;
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                msg = "Fail to download manifest file, hot update skipped.";
                this.resultCode = HotUpdateCode.ManifestUrlError;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                msg = "Already up to date with the latest remote version.";
                this.resultCode = HotUpdateCode.UpToDate;
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                msg = 'New version found, please try to update.';
                readyToUpdate = true;
                break;
            default:
                return;
        }
        console.log("Msg: " + msg);

        this.assetsMgr.setEventCallback(null);
        this.updating = false;

        if (readyToUpdate) {
            this.hotUpdate();
        } else {
            this.complete(this.resultCode);
        }
    }

    updateCb(event) {
        var needRestart = false;
        var failed = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                console.log('No local manifest file found, hot update skipped.');
                this.resultCode = HotUpdateCode.ManifestNotFound;
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                console.log(`progress ：${event.getDownloadedFiles()} / ${event.getTotalFiles()} `);
                this.progress(event.getDownloadedFiles(), event.getTotalFiles());
                let msg = event.getMessage();
                if (msg) {
                    console.log(msg);
                }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                console.log('Fail to download manifest file, hot update skipped.');
                this.resultCode = HotUpdateCode.ManifestUrlError;
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                console.log('Already up to date with the latest remote version.');
                this.resultCode = HotUpdateCode.UpToDate;
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                console.log('Update finished. ' + event.getMessage());
                this.resultCode = HotUpdateCode.UpdateSucc;
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                console.log('Update failed. ' + event.getMessage());
                this.resultCode = HotUpdateCode.UpdateFail;
                this.updating = false;
                this.canRetry = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                console.log('Asset update error: ' + event.getAssetId() + ', ' + event.getMessage());
                this.resultCode = HotUpdateCode.UpdateFail;
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                console.log(event.getMessage());
                break;
            default:
                break;
        }

        if (failed) {
            this.assetsMgr.setEventCallback(null);
            this.updating = false;
            this.complete(this.resultCode);
        }

        if (needRestart) {
            this.complete(this.resultCode);
            this.assetsMgr.setEventCallback(null);
            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this.assetsMgr.getLocalManifest().getSearchPaths();
            console.log("newPaths : " + JSON.stringify(newPaths));
            Array.prototype.unshift.apply(searchPaths, newPaths);//追加脚本搜索路径

            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);

            cc.audioEngine.stopAll();
            cc.game.restart();
        }
    }

}


/* // 为了使热更新脚本生效 在 main.js 的开头添加如下代码
(function () {
    if (typeof window.jsb === 'object') {
        var hotUpdateSearchPaths = localStorage.getItem('HotUpdateSearchPaths');
        if (hotUpdateSearchPaths) {
            jsb.fileUtils.setSearchPaths(JSON.parse(hotUpdateSearchPaths));
        }
    }
})(); */




