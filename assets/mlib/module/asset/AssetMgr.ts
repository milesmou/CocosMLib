import { Asset, AssetManager, assetManager, ImageAsset, js, Sprite, SpriteFrame, sys } from "cc";
import { BundleConstant } from "../../../scripts/gen/BundleConstant";
import { MLogger } from "../logger/MLogger";
import { AssetCache } from "./AssetCache";
import { BundleMgr } from "./BundleMgr";

/**
 * 资源加载管理类 
 * 每调用一次资源加载接口,资源引用次数+1
 * 若需要自动释放资源,请使用继承AssetHandler的组件来加载资源,组件所在节点销毁时,通过组件加载的资源引用计数-1
 */
export class AssetMgr {

    private static get cache() {
        return AssetCache.Inst.cache;
    }

    public static async loadAllBundle(bundleNames?: string[], onFileProgress?: (loaded: number, total: number) => void) {
        if (!bundleNames) {
            bundleNames = BundleConstant;
        }
        await BundleMgr.Inst.loadAllBundle(bundleNames, onFileProgress);
    }

    public static isAssetExists(location: string) {
        return BundleMgr.Inst.isAssetExists(location);
    }

    public static parseLocation<T extends Asset>(location: string, type: (new (...args: any[]) => T) | T) {
        let className = js.getClassName(type);
        if (className === "cc.SpriteFrame") {
            location += "/spriteFrame";
        } else if (className === "cc.Texture2D") {
            location += "/texture";
        } else if (className === "sp.SkeletonData") {
            location += "/sp.SkeletonData";
        }
        return location;
    }

    private static unparseLocation<T extends Asset>(location: string, type: (new (...args: any[]) => T)) {
        let className = js.getClassName(type);
        if (className === "sp.SkeletonData") {
            location = location.replace("/sp.SkeletonData", "");
        }
        return location;
    }

    /** 加载资源 */
    public static loadAsset<T extends Asset>(location: string, type: new (...args: any[]) => T) {
        location = this.parseLocation(location, type);
        let p = new Promise<T>((resolve, reject) => {
            let casset = this.cache.get(location) as T;
            if (casset?.isValid) {
                casset.addRef();
                resolve(casset);
                return;
            }
            let bundle = BundleMgr.Inst.getBundle(location);
            bundle.load(this.unparseLocation(location, type), type, (err, asset) => {
                if (err) {
                    MLogger.error(err);
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
    public static async loadDirAsset<T extends Asset>(location: string, type: new (...args: any[]) => T) {
        let list = BundleMgr.Inst.getDirectoryAddress(location);
        if (!list || list.length == 0) {
            MLogger.error("目录中无资源");
            return;
        }

        let result: T[] = [];
        for (const address of list) {
            let asset = await this.loadAsset(address, type);
            result.push(asset);
        }
        return result;
    }

    /** 加载远程资源 */
    public static loadRemoteAsset<T extends Asset>(url: string) {
        let p = new Promise<T>((resolve, reject) => {
            let casset = this.cache.get(url) as T;
            if (casset?.isValid) {
                casset.addRef();
                resolve(casset);
                return;
            }
            assetManager.loadRemote<T>(url, { ext: url.substring(url.lastIndexOf(".")) }, (err, asset) => {
                if (err) {
                    MLogger.error(err);
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
            MLogger.error("Sprite无效 " + location);
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
            let bundle = BundleMgr.Inst.getSceneBundle(location);
            let sceneName = location.substring(location.indexOf("/") + 1);
            bundle.loadScene(sceneName, onProgress, err => {
                if (err) {
                    MLogger.error(err);
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
    public static download(url: string, onFileProgress?: (loaded: number, total: number) => void) {
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
                        MLogger.error(url, "download fail", err?.message);
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
    public static AddRef(location: string, decCount = 1) {
        let asset = this.cache.get(location);
        if (asset?.isValid) {
            for (let i = 0; i < decCount; i++) {
                asset.addRef();
            }
        } else {
            MLogger.warn(`[AddRef] 资源已销毁 ${location}`);
        }
    }

    /** 让资源引用计数减少 */
    public static DecRef(location: string, decCount = 1) {
        let asset = this.cache.get(location);
        if (asset?.isValid) {
            for (let i = 0; i < decCount; i++) {
                asset.decRef();
            }
        } else {
            MLogger.warn(`[DecRef] 资源已销毁 ${location}`);
        }
    }

    /** 让目录下所有资源引用计数减少 */
    public static DecDirRef(location: string, decCount = 1) {
        let list = BundleMgr.Inst.getDirectoryAddress(location);
        if (!list || list.length == 0) {
            MLogger.error("目录中无资源");
            return;
        }
        for (const v of list) {
            this.DecRef(v, decCount);
        }
    }

}
