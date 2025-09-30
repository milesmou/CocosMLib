import { Asset, AssetManager, assetManager, js } from "cc";
import { SlowProgress } from "../../utils/UnionProgress";

/** 加载bundle时文件下载进度 */
interface LoadFileProgress {
    /** 已加载资源 */
    totalBytesWritten: number;
    /** 总计资源 */
    totalBytesExpectedToWrite: number;
}

export class BundleMgr {

    public static get Inst() { return createSingleton(BundleMgr); }

    //资源地址|资源类型名字:Bundle名字
    private _address: Map<string, string> = new Map();

    /** 加载Bundle(zip、分包会下载整个bundle,其它是加载Bundle的清单文件)  */
    public loadBundle(bundleName: string, opts?: { version?: string, onProgress?: Progress }) {
        let p = new Promise<AssetManager.Bundle>((resolve, reject) => {
            assetManager.loadBundle(bundleName,
                {
                    ...opts,
                    onFileProgress: (obj: LoadFileProgress) => {
                        let loaded = obj.totalBytesWritten || 0;
                        let total = obj.totalBytesExpectedToWrite || 0;
                        if (total == 0) return;
                        opts?.onProgress && opts.onProgress(loaded, total);
                    }
                },
                (err, bundle) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        opts?.onProgress && opts.onProgress(1, 1);
                        resolve(bundle);
                    }
                }
            )
        })
        return p;
    }

    /** 加载多个Bundle */
    public async loadBundles(bundleNames: string[], opts?: { bundleVers?: { [bundleName: string]: string }, onProgress?: Progress }) {
        let bundleVers = opts && opts.bundleVers;
        let onProgress = opts && opts.onProgress;
        let slowProgress = new SlowProgress(onProgress, bundleNames.length);

        let promises: Promise<AssetManager.Bundle>[] = [];
        for (let i = 0; i < bundleNames.length; i++) {
            let bundleName = bundleNames[i];
            promises.push(this.loadBundle(bundleName, { version: bundleVers && bundleVers[bundleName], onProgress: slowProgress.getOnProgress(bundleName) }));
        }
        return Promise.all(promises);
    }

    /** 卸载Bundle releaseAll:是否释放所有资源 */
    public unloadBundle(bundleName: string, releaseAll: boolean) {
        let bundle = assetManager.bundles.get(bundleName);
        if (bundle) {
            assetManager.removeBundle(bundle);
            for (const kv of this._address) {
                let [key, value] = kv;
                if (value == bundleName) this._address.delete(key);
            }
            if (releaseAll) bundle.releaseAll();
        } else {
            console.warn(`bundle不存在 ${bundleName}`);
        }
    }

    private getAssetKey<T extends Asset>(location: string, type: new (...args: any[]) => T) {
        return location + "|" + js.getClassName(type);
    }

    /** 资源是否存在 */
    public isAssetExists<T extends Asset>(location: string, type: new (...args: any[]) => T) {
        let ab = this.getAssetLocatedBundle(location, type, false);
        return Boolean(ab);
    }


    /** 通过资源地址和类型获取所在的Bundle */
    public getAssetLocatedBundle<T extends Asset>(location: string, type: new (...args: any[]) => T, logError = true): AssetManager.Bundle {
        let ab: AssetManager.Bundle = null;
        let key = this.getAssetKey(location, type);
        if (this._address.has(key)) {
            ab = assetManager.getBundle(this._address.get(key));
        } else {
            ab = assetManager.bundles.find(bundle => Boolean(bundle.getInfoWithPath(location, type)));
            if (ab) {
                this._address.set(key, ab.name);
            } else {
                if (logError) console.error(`location: ${location}  资源不存在或所在Bundle未加载`);
            }
        }
        return ab;
    }

    /** 通过目录地址和类型获取所在的Bundle */
    public getDirLocatedBundle<T extends Asset>(location: string, type: new (...args: any[]) => T, logError = true): AssetManager.Bundle {
        let ab: AssetManager.Bundle = null;
        let key = this.getAssetKey(location, type);
        if (this._address.has(key)) {
            ab = assetManager.getBundle(this._address.get(key));
        } else {
            ab = assetManager.bundles.find(bundle => bundle.getDirWithPath(location, type)?.length > 0);
            if (ab) {
                this._address.set(key, ab.name);
            } else {
                if (logError) console.error(`location: ${location}  目录不存在或所在Bundle未加载`);
            }
        }
        return ab;
    }
}
