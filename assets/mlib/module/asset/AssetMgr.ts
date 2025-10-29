import { Asset, AssetManager, assetManager, ImageAsset, js, Prefab, Sprite, SpriteFrame, sys, Texture2D } from "cc";
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
    /** 资源缓存 */
    private static get cache() { return AssetCache.Inst; }

    /** 当前正在加载的资源数量(非预加载) */
    public static get loadingCount() {
        return this.loadingAsset ? this.loadingAsset.size : 0;
    }

    /** 加载Bundle(zip、分包会下载整个bundle,其它是加载Bundle的清单文件) */
    public static loadBundle(bundleName: string, opts?: { version?: string, onProgress?: Progress }) {
        return BundleMgr.Inst.loadBundle(bundleName, opts);
    }

    /** 加载多个Bundle  */
    public static loadBundles(bundleNames: string[], opts?: { bundleVers?: { [bundleName: string]: string }, onProgress?: Progress }) {
        return BundleMgr.Inst.loadBundles(bundleNames, opts);
    }

    /** 卸载Bundle releaseAll:是否释放所有资源,默认false */
    public static async unloadBundle(bundleName: string, releaseAll = false) {
        BundleMgr.Inst.unloadBundle(bundleName, releaseAll);
    }

    /** 根据资源路径和资源类型获取资源加载路径 */
    public static getLoadPath<T extends Asset>(location: string, type: AssetProto<T> | T) {
        if (!type) return location;
        let anyType: any = type;
        if ((anyType == SpriteFrame || anyType instanceof SpriteFrame) && !location.endsWith("/spriteFrame")) {
            location += "/spriteFrame";
        } else if ((anyType == Texture2D || anyType instanceof Texture2D) && !location.endsWith("/texture")) {
            location += "/texture";
        }
        return location;
    }

    /** 根据资源路径和资源类型获取资源缓存键 */
    public static getCacheKey<T extends Asset>(location: string, type: AssetProto<T> | T) {
        if (!type) return location;
        let anyType: any = type;
        if ((anyType == SpriteFrame || anyType instanceof SpriteFrame) && !location.endsWith("/spriteFrame")) {
            location += "/spriteFrame";
        } else if ((anyType == Texture2D || anyType instanceof Texture2D) && !location.endsWith("/texture")) {
            location += "/texture";
        } else {
            location += `/${js.getClassName(type)}`;
        }
        return location;
    }

    /** 已加载的Bundle中是否存在指定资源 */
    public static isAssetExists<T extends Asset>(location: string, type: AssetProto<T>) {
        return BundleMgr.Inst.isAssetExists(this.getLoadPath(location, type), type);
    }

    /** 资源是否已经加载成功 */
    public static isAssetLoaded<T extends Asset>(location: string, type: AssetProto<T>) {
        return this.cache.loadedAsset.get(this.getCacheKey(location, type))?.isValid;
    }

    /** 资源是否已经预加载成功 (使用loadAsset加载成功资源也算预加载成功) */
    public static isAssetPreloaded<T extends Asset>(location: string, type: AssetProto<T>) {
        let cacheKey = this.getCacheKey(location, type);
        return this.cache.loadedAsset.get(cacheKey)?.isValid || this.cache.preloadedAsset.has(cacheKey);
    }

    /** 加载bundle后再加载资源 */
    public static async loadBundleAsset<T extends Asset>(bundleName: string, location: string, type: AssetProto<T>, onProgress?: Progress) {
        let bunlde = await this.loadBundle(bundleName);
        if (bunlde) {
            return await this.loadAsset(location, type, onProgress);
        } else {
            mLogger.error("bunlde加载失败", bundleName);
            return null;
        }
    }

    /** 加载资源 */
    public static loadAsset<T extends Asset>(location: string, type: AssetProto<T>, onProgress?: Progress) {
        let cacheKey = this.getCacheKey(location, type);
        let loadPath = this.getLoadPath(location, type);
        let p = new Promise<T>((resolve, reject) => {
            let casset = this.cache.loadedAsset.get(cacheKey) as T;
            if (casset?.isValid) {
                if (type as any !== Prefab) {//预制体由节点自动管理
                    casset.addRef();
                }
                onProgress && onProgress(1, 1);
                resolve(casset);
                return;
            }
            let bundle = BundleMgr.Inst.getAssetLocatedBundle(loadPath, type);
            this.loadingAsset.add(cacheKey);
            bundle.load(loadPath, type, onProgress, (err, asset) => {
                this.loadingAsset.delete(cacheKey);
                if (err) {
                    console.error(err);
                    resolve(null);
                }
                else {
                    if (type as any !== Prefab) {//预制体由节点自动管理
                        asset.addRef();
                    }
                    this.cache.loadedAsset.set(cacheKey, asset);
                    resolve(asset);
                }
            });
        })
        return p;
    }

    /** 加载bundle后再加载目录资源 */
    public static async loadBundleDir<T extends Asset>(bundleName: string, location: string, type: AssetProto<T>, onProgress?: Progress) {
        let bunlde = await this.loadBundle(bundleName);
        if (bunlde) {
            return await this.loadDir(location, type, onProgress);
        } else {
            mLogger.error("bunlde加载失败", bundleName);
            return null;
        }
    }

    /** 加载目录中的所有资源 */
    public static async loadDir<T extends Asset>(location: string, type?: AssetProto<T>, onProgress?: Progress) {
        let p = new Promise<T[]>((resolve, reject) => {
            let bundle = BundleMgr.Inst.getDirLocatedBundle(location, type);
            this.loadingAsset.add(location);
            bundle.loadDir(location, type, onProgress, (err, assets) => {
                this.loadingAsset.delete(location);
                if (err) {
                    console.error(err);
                    resolve(null);
                }
                else {
                    let assetInfos = bundle.getDirWithPath(location, type);
                    assetInfos.forEach(v => {
                        let asset = bundle.get(v.path);
                        asset.addRef();
                        this.cache.loadedAsset.set(v.path, asset);
                    });
                    resolve(assets);
                }
            });
        })
        return p;
    }

    /** 加载远程资源 */
    public static loadRemoteAsset<T extends Asset>(url: string, opts?: { [k: string]: any; ext?: string; }) {
        let p = new Promise<T>((resolve, reject) => {
            let casset = this.cache.loadedAsset.get(url) as T;
            if (casset?.isValid) {
                casset.addRef();
                resolve(casset);
                return;
            }
            this.loadingAsset.add(url);
            assetManager.loadRemote<T>(url, opts, (err, asset) => {
                this.loadingAsset.delete(url);
                if (err) {
                    console.error(err);
                    resolve(null);
                }
                else {
                    this.cache.loadedAsset.set(url, asset);
                    asset.addRef();
                    resolve(asset);
                }
            });
        })
        return p;
    }

    /** 加载远程的图片精灵 */
    public static async loadRemoteSpriteFrame(url: string) {
        let casset = this.cache.loadedAsset.get(url);
        if (casset?.isValid) {
            casset.addRef();
            return casset as SpriteFrame;
        }
        let img = await this.loadRemoteAsset<ImageAsset>(url, { ext: ".png" });
        if (img) {
            let spFrame = SpriteFrame.createWithImage(img);
            spFrame.texture.addRef();
            spFrame.addRef();
            this.cache.remoteAssetDepends.set(spFrame, [img, spFrame.texture]);
            this.cache.loadedAsset.set(url, spFrame);
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
     * 预加载资源 (下载资源到本地,不会加载到内存中,适用于H5和小游戏平台提前下载远程资源,原生平台不需要)
     */
    public static preloadAsset<T extends Asset>(location: string, type: AssetProto<T>, onProgress?: Progress) {
        let cacheKey = this.getCacheKey(location, type);
        let loadPath = this.getLoadPath(location, type);
        let p = new Promise<void>((resolve, reject) => {
            let bundle = BundleMgr.Inst.getAssetLocatedBundle(loadPath, type);
            bundle.preload(loadPath, type, onProgress, (err, asset) => {
                if (err) {
                    console.error(err);
                } else {
                    this.cache.preloadedAsset.add(cacheKey);
                }
                resolve();
            });
        })
        return p;
    }

    /** 
     * 预加载场景 (只会下载场景资源到本地 不会加载到内存中)
     * @param location 由bundle名字和场景名字组成 bundleName/SceneName
     */
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
     * @param onProgress 文件下载进度回调(同一url仅第一次传入的回调有效)
     */
    public static download(url: string, onProgress?: Progress) {
        let ext = url.substring(url.lastIndexOf("."));
        let p = new Promise<any>((resolve, reject) => {
            if (sys.isBrowser) {
                resolve(url);
                return;
            }
            assetManager.downloader.download(
                url, url, ext,
                {
                    onFileProgress: onProgress
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

    /** 让资源引用计数+1 */
    public static addRef<T extends Asset>(location: string, type: AssetProto<T> | T) {
        let asset = this.cache.loadedAsset.get(this.getCacheKey(location, type));
        if (asset?.isValid) {
            asset.addRef();
        } else {
            console.warn(`[addRef] 资源不存在或已销毁 ${location}`);
        }
    }

    /** 
     * 让资源引用计数-1
     * @param type 资源类型
     */
    public static decRef<T extends Asset>(location: string, type: AssetProto<T>) {
        let asset = this.cache.loadedAsset.get(this.getCacheKey(location, type));
        if (asset?.isValid) {
            this.decAssetRef(asset);
        } else {
            console.warn(`[decRef] 资源不存在或已销毁 ${location}`);
        }
    }

    /** 
     * 让目录下指定类型资源引用计数-1
     * @param type 资源类型 不填表示处理目录内所有资源
     */
    public static decDirRef<T extends Asset>(location: string, type?: AssetProto<T>) {
        let bundle = BundleMgr.Inst.getDirLocatedBundle(location, type);
        let assetInfos = bundle.getDirWithPath(location, type);
        for (const v of assetInfos) {
            this.decRef(v.path, type);
        }
    }

    /** 
     * 让资源引用计数-1
     */
    public static decAssetRef<T extends Asset>(asset: T) {
        if (!asset?.isValid) return;
        asset.decRef();
        if (asset.refCount <= 0) {
            this.cache.loadedAsset.deleteV(asset);
            if (this.cache.remoteAssetDepends.has(asset)) {//释放远程资源的依赖资源
                for (const element of this.cache.remoteAssetDepends.get(asset)) {
                    element.decRef();
                }
            }
        }
    }

}
