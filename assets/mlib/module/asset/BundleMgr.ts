import { Asset, AssetManager, assetManager, js } from "cc";

export class BundleMgr {

    public static get Inst() { return createSingleton(BundleMgr); }

    //资源地址|资源类型名字:Bundle名字
    private _address: Map<string, string> = new Map();

    /** 加载Bundle(实际是加载Bundle的清单文件)  */
    public loadBundle(bundleName: string, version?: string) {
        let p = new Promise<AssetManager.Bundle>((resolve, reject) => {
            assetManager.loadBundle(bundleName,
                {
                    version: version,
                },
                (err, bundle) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(bundle);
                    }
                }
            )
        })
        return p;
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

    /** 加载多个Bundle */
    public async loadBundles(bundleNames: string[], opts?: { bundleVers?: { [bundleName: string]: string }, onProgress?: (loaded: number, total: number) => void }) {
        let bundleVers = opts && opts.bundleVers;
        let onProgress = opts && opts.onProgress;

        let promises: Promise<AssetManager.Bundle>[] = [];
        for (let i = 0; i < bundleNames.length; i++) {
            let bundleName = bundleNames[i];
            promises.push(this.loadBundle(bundleName, bundleVers && bundleVers[bundleName]));
        }
        return PromiseAll(promises, onProgress);
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
            ab = assetManager.bundles.find(bundle => {
                return Boolean(bundle.getInfoWithPath(location, type));
            });
            if (ab) {
                this._address.set(key, ab.name);
            } else {
                if (logError) console.error(`location: ${location}  资源不存在或所在Bundle未加载`);
            }
        }
        return ab;
    }

    /** 获取目录内所有该资源类型资源信息 */
    public getDirAssets<T extends Asset>(location: string, type?: new (...args: any[]) => T) {
        let ab: AssetManager.Bundle = null;
        let key = location + "|dir|" + js.getClassName(type);
        if (this._address.has(key)) {
            ab = assetManager.getBundle(this._address.get(key));
        } else {
            ab = assetManager.bundles.find(bundle => {
                return bundle.getDirWithPath(location, type).length > 0;
            });
            if (ab) {
                this._address.set(key, ab.name);
            } else {
                console.error(`location: ${location}  目录不存在或所在Bundle未加载`);
            }
        }
        let assetInfos = ab.getDirWithPath(location, type);
        for (const assetInfo of assetInfos) {
            let key = this.getAssetKey(location, assetInfo.ctor);
            this._address.set(key, ab.name);
        }
        return assetInfos;
    }


}
