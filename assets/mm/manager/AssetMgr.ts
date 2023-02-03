import { Asset, assetManager, ImageAsset, SpriteFrame, sys } from "cc";
import { SingletonFactory } from "../utils/SingletonFactory";
import { BundleMgr } from "./BundleMgr";

class AssetCache {
    public static get Inst() { return SingletonFactory.getInstance<AssetCache>(AssetCache); }
    public cache: Map<string, Asset> = new Map();
}

export class AssetMgr {

    static get cache() {
        return AssetCache.Inst.cache;
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

    static DecRef(location: string, decCount: number) {
        let asset = this.cache.get(location);
        if (asset?.isValid) {
            for (let i = 0; i < decCount; i++) {
                asset.decRef();
            }
        } else {
            console.warn(`资源已销毁  ${location}`);

        }
    }

}


