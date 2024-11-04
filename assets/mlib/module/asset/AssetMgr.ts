import { Asset, AssetManager, assetManager, ImageAsset, js, Sprite, SpriteFrame, sys } from "cc";
import { BundleConstant } from "../../../scripts/gen/BundleConstant";
import { AssetCache } from "./AssetCache";
import { BundleMgr } from "./BundleMgr";

/**
 * 资源加载管理类 
 * 每调用一次资源加载接口,资源引用次数+1
 * 若需要自动释放资源,请使用AssetComponent来加载资源,组件所在节点销毁时,通过组件加载的资源引用计数-1
 */
export class AssetMgr {

    /** 正在加载的资源(非预加载) */
    private static loadingAsset: Set<string> = new Set();

    private static get cache() {
        return AssetCache.Inst.cache;
    }

    /** 当前正在加载的资源数量(非预加载) */
    public static get loadingCount() {
        return this.loadingAsset ? this.loadingAsset.size : 0;
    }

    public static async loadBundles(bundleNames?: string[], opts?: { bundleVers?: { [bundleName: string]: string }, onProgress?: Progress }) {
        if (!bundleNames) {
            bundleNames = BundleConstant;
        }
        this.loadingAsset.clear();
        await BundleMgr.Inst.loadBundles(bundleNames, opts);
    }

    public static isAssetExists<T extends Asset>(location: string, type: new (...args: any[]) => T) {
        return BundleMgr.Inst.isAssetExists(location, type);
    }

    public static parseLocation<T extends Asset>(location: string, type: (new (...args: any[]) => T) | T) {
        let className = js.getClassName(type);
        if (className == "cc.SpriteFrame" && !location.endsWith("/spriteFrame")) {
            location += "/spriteFrame";
        } else if (className == "cc.Texture2D" && !location.endsWith("/texture")) {
            location += "/texture";
        }
        return location;
    }

    /** 加载资源 */
    public static loadAsset<T extends Asset>(location: string, type: new (...args: any[]) => T, onProgress?: Progress) {
        location = this.parseLocation(location, type);
        let p = new Promise<T>((resolve, reject) => {
            let casset = this.cache.get(location) as T;
            if (casset?.isValid) {
                casset.addRef();
                onProgress && onProgress(1, 1);
                resolve(casset);
                return;
            }
            let bundle = BundleMgr.Inst.getAssetLocatedBundle(location, type);
            this.loadingAsset.add(location);
            bundle.load(location, type, onProgress, (err, asset) => {
                this.loadingAsset.delete(location);
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

    /** 加载目录中的所有资源 */
    public static async loadDir<T extends Asset>(location: string, type: new (...args: any[]) => T, onProgress?: Progress) {

        let list = BundleMgr.Inst.getDirAssets(location, type);
        if (!list || list.length == 0) {
            console.error(`目录中无资源 ${location}`);
            return;
        }

        let progress: number[] = [];
        let onProgress2 = function (index: number) {
            return function (finished: number, total: number) {
                progress[index] = finished / total;
                let totalProgress = 0;
                for (const v of progress) {
                    totalProgress += (v || 0);
                }
                onProgress && onProgress(totalProgress, list.length);
            }
        }

        let result: T[] = [];
        for (let i = 0; i < list.length; i++) {
            const assetInfo = list[i];
            let asset = await this.loadAsset(assetInfo.path, type, onProgress2(i));
            result.push(asset);
        }
        return result;
    }

    /** 加载远程资源 */
    public static loadRemoteAsset<T extends Asset>(url: string, ext?: string) {
        let p = new Promise<T>((resolve, reject) => {
            let casset = this.cache.get(url) as T;
            if (casset?.isValid) {
                casset.addRef();
                resolve(casset);
                return;
            }
            this.loadingAsset.add(url);
            assetManager.loadRemote<T>(url, { ext: ext }, (err, asset) => {
                this.loadingAsset.delete(url);
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

    /** 加载远程的图片精灵 */
    public static async loadRemoteSpriteFrame(url: string) {
        let casset = this.cache.get(url);
        if (casset?.isValid) {
            return casset as SpriteFrame;
        }
        let img = await this.loadRemoteAsset<ImageAsset>(url);
        if (img) {
            let spFrame = SpriteFrame.createWithImage(img);
            spFrame.addRef();
            this.cache.set(url, spFrame);
            return spFrame;
        }
        return null;
    }

    /**
    * 加载图片到Sprite
    * @param sprite 目标Sprite组件
    * @param location 路径（本地路径不带扩展名 远程路径带扩展名）
    */
    public static async loadSprite(sprite: Sprite, location: string) {
        if (!sprite?.isValid) {
            console.error("Sprite无效 " + location);
            return;
        }
        if (location.startsWith("http") || location.startsWith("/")) {
            let spFrame = await this.loadRemoteSpriteFrame(location);
            sprite.spriteFrame = spFrame;
        } else {
            let spFrame = await this.loadAsset(location, SpriteFrame);
            sprite.spriteFrame = spFrame;
        }
    }


    /** 
     * 加载场景 
     * @param location 由bundle名字和场景名字组成 bundleName/SceneName
     */
    public static loadScene(location: string, onProgress?: (finished: number, total: number, item: AssetManager.RequestItem) => void) {
        let p = new Promise<void>((resolve, reject) => {
            let [bundleName, sceneName] = location.split("/");
            let bundle = assetManager.getBundle(bundleName);
            this.loadingAsset.add(location);
            bundle.loadScene(sceneName, onProgress, err => {
                this.loadingAsset.delete(location);
                if (err) {
                    console.error(err);
                    resolve();
                } else {
                    resolve();
                }
            });
        })
        return p;
    }


    /** 
     * 预加载资源 (只会下载资源到本地 不会加载到内存中)
     */
    public static preloadAsset<T extends Asset>(location: string, type: new (...args: any[]) => T, onProgress?: ((finished: number, total: number, item: AssetManager.RequestItem) => void)) {
        location = this.parseLocation(location, type);
        let p = new Promise<AssetManager.RequestItem[]>((resolve, reject) => {
            let bundle = BundleMgr.Inst.getAssetLocatedBundle(location, type);
            bundle.preload(location, type, onProgress, (err, items) => {
                if (err) {
                    console.error(err);
                    resolve(null);
                }
                else {
                    resolve(items);
                }
            });
        })
        return p;
    }

    /** 预加载场景 (只会下载场景资源到本地 不会加载到内存中) */
    public preloadScene(location: string, onProgress?: (finished: number, total: number, item: AssetManager.RequestItem) => void) {
        let p = new Promise<void>((resolve, reject) => {
            let [bundleName, sceneName] = location.split("/");
            let bundle = assetManager.getBundle(bundleName);
            bundle.preloadScene(sceneName, onProgress, err => {
                if (err) {
                    console.error(err);
                    resolve();
                } else {
                    resolve();
                }
            });
        })
        return p;
    }

    /**
     * 原生平台下载文件到本地
     * @param url 文件下载链接
     * @param onFileProgress 文件下载进度回调(同一url仅第一次传入的回调有效)
     */
    public static download(url: string, onFileProgress?: Progress) {
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
                        console.error(url, "download fail", err?.message);
                        reject(null);
                    } else {
                        resolve(res);
                    }
                }
            )
        })
        return p;
    }

    /** 让资源引用计数增加 */
    public static addRef(location: string, decCount = 1) {
        let asset = this.cache.get(location);
        if (asset?.isValid) {
            for (let i = 0; i < decCount; i++) {
                asset.addRef();
            }
        } else {
            console.warn(`[addRef] 资源已销毁 ${location}`);
        }
    }

    /** 
     * 让资源引用计数减少 (注意精灵和纹理需要使用完整路径)
     */
    public static decRef(location: string, decCount = 1) {
        let asset = this.cache.get(location);
        if (asset?.isValid) {
            if (decCount < 0) {
                asset.destroy();
            } else {
                for (let i = 0; i < decCount; i++) {
                    asset.decRef();
                }
            }
        } else {
            console.warn(`[decRef] 资源已销毁 ${location}`);
        }
    }

    /** 
     * 让目录下所有资源引用计数减少
     */
    public static decDirRef<T extends Asset>(location: string, decCount = 1, type?: new (...args: any[]) => T) {
        let list = BundleMgr.Inst.getDirAssets(location, type);
        if (!list || list.length == 0) {
            console.warn(`[decDirRef] 目录中无指定类型资源 ${location} ${js.getClassName(type)}`);
            return;
        }
        for (const v of list) {
            this.decRef(v.path, decCount);
        }
    }

}
