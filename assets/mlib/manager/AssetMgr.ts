import { Asset, AssetManager, assetManager, ImageAsset, resources, Sprite, SpriteFrame, sys } from "cc";
import { SingletonFactory } from "../utils/SingletonFactory";

class AssetCache {
    public static get Inst() { return SingletonFactory.getInstance<AssetCache>(AssetCache); }
    public cache: Map<string, Asset> = new Map();
}

class BundleMgr {

    public static get Inst() {
        return SingletonFactory.getInstance<BundleMgr>(BundleMgr, t => {
            t.resolveResources();
        });
    }

    //bundle名字:Bundle
    private bundles: Map<string, AssetManager.Bundle> = new Map();

    //资源地址:Bundle名字
    private address: Map<string, string> = new Map();



    private resolveResources() {
        this.resolveBundle(resources);
    }

    private resolveBundle(bundle: AssetManager.Bundle) {
        this.bundles.set(bundle.name, bundle);
        bundle["_config"].paths.forEach(v => {
            v.forEach(v1 => {
                if (!this.address.has(v1.path))
                    this.address.set(v1.path, bundle.name);
                else
                    console.error(`资源地址不能重复  ${bundle.name}  ${v1.path}`);
            });
        });
    }

    public projectBundles() {
        let builtin: string[] = ["resources", "main", "internal"];
        let arr: string[] = assetManager['_projectBundles'];
        let result: string[] = [];
        for (const v of arr) {
            if (builtin.indexOf(v) == -1) {
                result.push(v);
            }
        }
        return result;
    }

    public loadBundle(bundleName: string, onFileProgress?: (loaded: number, total: number) => void) {
        let p = new Promise<AssetManager.Bundle>((resolve, reject) => {
            assetManager.loadBundle(bundleName,
                { onFileProgress: onFileProgress },
                (err, bundle) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        this.resolveBundle(bundle);
                        resolve(bundle);
                    }
                }
            )
        })
        return p;
    }

    public loadAllBundle(bundleNames?: string[], onFileProgress?: (loaded: number, total: number) => void) {
        if (!bundleNames) {
            bundleNames = this.projectBundles();
        }
        let p = new Promise<AssetManager.Bundle[]>((resolve, reject) => {
            let progress: number[] = [];
            let bundleArr: AssetManager.Bundle[] = [];
            for (let i = 0; i < bundleNames.length; i++) {
                let bundleName = bundleNames[i];
                console.log("bundleName=" + bundleName);

                assetManager.loadBundle(bundleName,
                    {
                        onFileProgress: (loaded: number, total: number) => {
                            if (onFileProgress) {
                                progress[i] = loaded / total;
                                let totalProgress = 0;
                                for (let i = 0; i < bundleNames.length; i++) {
                                    totalProgress += (progress[i] || 0);
                                }
                                onFileProgress(totalProgress / bundleNames.length, 1);
                            }
                        }
                    },
                    (err, bundle) => {
                        if (err) {
                            console.log(err);
                            reject(err)
                        } else {
                            bundleArr.push(bundle);
                            this.resolveBundle(bundle);
                            if (bundleArr.length == bundleNames.length) {
                                resolve(bundleArr);
                            }
                        }
                    }
                )
            }
        })
        return p;
    }

    public getBundleByLocation(location: string): AssetManager.Bundle {
        let ab: AssetManager.Bundle = null;
        if (this.address.has(location)) {
            ab = this.bundles.get(this.address.get(location));
            if (!ab) console.error(`location: ${location}  资源所在Bundle未加载`);

        } else {
            console.error(`location: ${location}  资源不存在或所在Bundle未加载`);
        }
        return ab;
    }
}

/**
 * 资源加载管理类
 * 每调用一次资源加载接口,资源引用次数+1
 * 若需要自动释放资源,请使用UI来加载资源
 */
export class AssetMgr {

    static get cache() {
        return AssetCache.Inst.cache;
    }

    static get projectBundles() {
        return BundleMgr.Inst.projectBundles();
    }

    static loadAllBundle(bundleNames?: string[], onFileProgress?: (loaded: number, total: number) => void) {
        return BundleMgr.Inst.loadAllBundle(bundleNames, onFileProgress);
    }

    static loadAsset<T extends Asset>(location: string, type?: new (...args: any[]) => T) {
        let p = new Promise<T>((resolve, reject) => {
            let casset = this.cache.get(location) as T;
            if (casset?.isValid) {
                casset.addRef();
                resolve(casset);
                return;
            }
            let bundle = BundleMgr.Inst.getBundleByLocation(location);
            bundle.load(location, type, (err, asset) => {
                if (err) {
                    console.error(err);
                    resolve(null);
                }
                else {
                    asset.addRef();
                    this.cache.set(location, asset);
                    resolve(asset);
                }
            });
        })
        return p;
    }

    static loadRemoteAsset<T extends Asset>(url: string) {
        let p = new Promise<T>((resolve, reject) => {
            let casset = this.cache.get(url) as T;
            if (casset?.isValid) {
                casset.addRef();
                casset.decRef
                resolve(casset);
                return;
            }
            assetManager.loadRemote<T>(url, { ext: url.substring(url.lastIndexOf(".")) }, (err, asset) => {
                if (err) {
                    console.error(err);
                    resolve(null);
                }
                else {
                    this.cache.set(url, asset);
                    asset.addRef();
                    resolve(asset);
                }
            });
        })
        return p;
    }

    static loadSpriteFrame(location: string) {
        return this.loadAsset<SpriteFrame>(location, SpriteFrame);
    }

    static async loadRemoteSpriteFrame(url: string) {
        let img = await this.loadRemoteAsset<ImageAsset>(url);
        if (img) {
            return SpriteFrame.createWithImage(img);
        }
        return null;
    }

    /**
    * 加载图片到Sprite
    * @param sprite 目标Sprite组件
    * @param location 路径（本地路径不带扩展名 远程路径带扩展名）
    */
    static async loadSprite(sprite: Sprite, location: string) {
        if (!sprite?.isValid) {
            console.error("Sprite无效 " + location);
            return;
        }
        if (location.startsWith("http") || location.startsWith("/")) {
            let spFrame = await this.loadRemoteSpriteFrame(location);
            sprite.spriteFrame = spFrame;
        } else {
            let spFrame = await this.loadSpriteFrame(location);
            sprite.spriteFrame = spFrame;
        }
    }

    /**
     * 原生平台下载文件到本地
     * @param url 文件下载链接
     * @param onFileProgress 文件下载进度回调(同一url仅第一次传入的回调有效)
     */
    static download(url: string, onFileProgress?: (loaded: number, total: number) => void) {
        let ext = url.substring(url.lastIndexOf("."));
        let p = new Promise<any>((resolve, reject) => {
            if (sys.isBrowser) {
                resolve(url);
                return;
            }
            assetManager.downloader.download(
                url, url, ext,
                {
                    onFileProgress: onFileProgress
                },
                (err, res) => {
                    if (err) {
                        console.log(url, "download fail", err?.message);
                        reject(null);
                    } else {
                        resolve(res);
                    }
                }
            )
        })
        return p;
    }

    //让资源引用计数增加 避免自动管理释放
    static AddRef(location: string, decCount = 1) {
        let asset = this.cache.get(location);
        if (asset?.isValid) {
            for (let i = 0; i < decCount; i++) {
                asset.addRef();
            }
        } else {
            console.warn(`[AddRef] 资源已销毁 ${location}`);
        }
    }

    static DecRef(location: string, decCount = 1) {
        let asset = this.cache.get(location);
        if (asset?.isValid) {
            for (let i = 0; i < decCount; i++) {
                asset.decRef();
            }
        } else {
            console.warn(`[DecRef] 资源已销毁 ${location}`);
        }
    }

}
