const { ccclass, property } = cc._decorator;

@ccclass
export default class HotUpdate extends cc.Component {

    //本地project.manifest文件路径
    @property({ type: cc.Asset })
    manifestUrl: cc.Asset = null;

    _assetsMgr = null;//jsb资源管理器

    _storagePath = "";//热更新文件缓存路径

    _updating = false; //更新中

    _failCount = 0;//更新失败次数

    _canRetry = false;//能否重新更新

    onLoad() {

        if (!cc.sys.isNative) {
            return;
        }

        this._storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'mouhong-remote-asset');
        console.log('Storage path for remote asset : ' + this._storagePath);

        this._assetsMgr = new jsb.AssetsManager("", this._storagePath, this.versionCompareHandle.bind(this));

        this._assetsMgr.setVerifyCallback(this.VerifyHandle.bind(this));

        this.scheduleOnce(() => {
            this.checkUpdate();
        }, 2);

    }

    versionCompareHandle(versionA, versionB) {
        console.log("Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
        var vA = versionA.split('.');
        var vB = versionB.split('.');
        for (var i = 0; i < vA.length; ++i) {
            var a = parseInt(vA[i]);
            var b = parseInt(vB[i] || 0);
            if (a === b) {
                continue;
            }
            else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        }
        else {
            return 0;
        }
    }

    VerifyHandle(path, asset) {
        // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
        var compressed = asset.compressed;
        // Retrieve the correct md5 value.
        var expectedMD5 = asset.md5;
        // asset.path is relative path and path is absolute.
        var relativePath = asset.path;
        // The size of asset file, but this value could be absent.
        var size = asset.size;
        if (compressed) {
            // console.log("Verification passed : " + relativePath);
            return true;
        }
        else {
            // console.log("Verification passed : " + relativePath + ' (' + expectedMD5 + ')');
            return true;
        }
    }


    checkUpdate() {
        if (this._updating) {
            return;
        }
        if (this._assetsMgr.getState() === jsb.AssetsManager.State.UNINITED) {
            // Resolve md5 url
            var url = this.manifestUrl.nativeUrl;
            if (cc.loader.md5Pipe) {
                url = cc.loader.md5Pipe.transformURL(url);
            }
            this._assetsMgr.loadLocalManifest(url);
        }
        if (!this._assetsMgr.getLocalManifest() || !this._assetsMgr.getLocalManifest().isLoaded()) {
            // this.panel.info.string = 'Failed to load local manifest ...';
            return;
        }
        this._assetsMgr.setEventCallback(this.checkCb.bind(this));
        this._assetsMgr.checkUpdate();
        this._updating = true;
    }

    hotUpdate() {
        if (this._assetsMgr && !this._updating) {
            this._assetsMgr.setEventCallback(this.updateCb.bind(this));
            if (this._assetsMgr.getState() === jsb.AssetsManager.State.UNINITED) {
                // Resolve md5 url
                var url = this.manifestUrl.nativeUrl;
                if (cc.loader.md5Pipe) {
                    url = cc.loader.md5Pipe.transformURL(url);
                }
                this._assetsMgr.loadLocalManifest(url);
            }
            this._failCount = 0;
            this._assetsMgr.update();
            this._updating = true;
        }
    }

    checkCb(event) {
        console.log('Code : ' + event.getEventCode());
        let msg = "";
        let readyToUpdate = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                msg = "No local manifest file found, hot update skipped.";
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                msg = "Fail to download manifest file, hot update skipped.";
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                msg = "Already up to date with the latest remote version.";
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                msg = 'New version found, please try to update.';
                readyToUpdate = true;
                break;
            default:
                return;
        }
        console.log("Msg: " + msg);

        this._assetsMgr.setEventCallback(null);
        this._updating = false;

        if (readyToUpdate) {
            this.hotUpdate();
        }
    }

    updateCb(event) {
        var needRestart = false;
        var failed = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                console.log('No local manifest file found, hot update skipped.');
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                let progress = event.getDownloadedFiles() + ' / ' + event.getTotalFiles();
                console.log("progress ： " + progress);
                let msg = event.getMessage();
                if (msg) {
                    console.log(msg);
                }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                console.log('Fail to download manifest file, hot update skipped.');
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                console.log('Already up to date with the latest remote version.');
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                console.log('Update finished. ' + event.getMessage());
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                console.log('Update failed. ' + event.getMessage());
                this._updating = false;
                this._canRetry = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                console.log('Asset update error: ' + event.getAssetId() + ', ' + event.getMessage());
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                console.log(event.getMessage());
                break;
            default:
                break;
        }

        if (failed) {
            this._assetsMgr.setEventCallback(null);
            this._updating = false;
        }

        if (needRestart) {
            this._assetsMgr.setEventCallback(null);
            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._assetsMgr.getLocalManifest().getSearchPaths();
            console.log("newPaths : " + JSON.stringify(newPaths));
            Array.prototype.unshift.apply(searchPaths, newPaths);//追加脚本搜索路径

            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
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




