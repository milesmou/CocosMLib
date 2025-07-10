import { _decorator, Asset, Component, Sprite, SpriteFrame } from "cc";
import { AssetCache } from "./AssetCache";
import { AssetMgr } from "./AssetMgr";

const { ccclass, property } = _decorator;

@ccclass("AssetComponent")
export class AssetComponent extends Component {

    private _key: string;

    protected __preload(): void {
        this._key = this.node.getPath();
    }

    //CacheKey:Asset
    private get cache() {
        if (!AssetCache.Inst.assetCompCache.has(this._key)) {
            AssetCache.Inst.assetCompCache.set(this._key, new Map());
        }
        return AssetCache.Inst.assetCompCache.get(this._key);
    }

    /** 组件加载的所有资源引用计数-1 */
    public decRefAll() {
        this.cache.forEach((v, k) => {
            AssetMgr.decAssetRef(v);
        });
        this.cache.clear();
    }

    public async loadAsset<T extends Asset>(location: string, type: AssetProto<T>, onProgress?: Progress): Promise<T> {
        let cacheKey = AssetMgr.getCacheKey(location, type);
        let asset = this.cache.get(cacheKey);
        if (asset?.isValid) {
            onProgress && onProgress(1, 1);
            return asset as T;
        }
        asset = await AssetMgr.loadAsset(location, type, onProgress);
        if (!this.isValid) {//资源未加载完,界面已被销毁
            AssetMgr.decAssetRef(asset);  //可能引起渲染失败卡死
            return null;
        }
        if (asset?.isValid) this.cache.set(cacheKey, asset);
        return asset as T;
    }

    public async loadRemoteAsset<T extends Asset>(url: string, opts?: { [k: string]: any; ext?: string; }): Promise<T> {
        let asset = this.cache.get(url);
        if (asset?.isValid) return asset as T;
        asset = await AssetMgr.loadRemoteAsset(url, opts);
        if (!this.isValid) {//资源未加载完,界面已被销毁
            AssetMgr.decAssetRef(asset); //可能引起渲染失败卡死
            return null;
        }
        if (asset?.isValid) this.cache.set(url, asset);
        return asset as T;
    }

    public async loadRemoteSpriteFrame(url: string): Promise<SpriteFrame> {
        let asset = this.cache.get(url);
        if (asset?.isValid) return asset as SpriteFrame;
        asset = await AssetMgr.loadRemoteSpriteFrame(url);
        if (!this.isValid) {//资源未加载完,界面已被销毁
            AssetMgr.decAssetRef(asset); //可能引起渲染失败卡死
            return null;
        }
        if (asset?.isValid) this.cache.set(url, asset);
        return asset as SpriteFrame;
    }

    /**
    * 加载图片到Sprite
    * @param sprite 目标Sprite组件
    * @param location 路径（本地路径不带扩展名 远程路径带扩展名）
    */
    public async loadSprite(sprite: Sprite, location: string) {
        if (!sprite?.isValid) {
            console.error("Sprite无效 " + location);
            return;
        }
        if (!location) {
            sprite.spriteFrame = null;
            return;
        }
        let spFrame: SpriteFrame;
        if (location.startsWith("http") || location.startsWith("/")) {
            spFrame = await this.loadRemoteSpriteFrame(location);
        } else {
            spFrame = await this.loadAsset(location, SpriteFrame);
        }
        if (!sprite?.isValid) return;
        if (!spFrame) return;
        sprite.spriteFrame = spFrame;
    }

    /** 
     * 组件加载的资源引用计数-1
     */
    public decRef<T extends Asset>(location: string, type: AssetProto<T>) {
        let cacheKey = AssetMgr.getCacheKey(location, type);
        let asset = this.cache.get(cacheKey);
        if (asset?.isValid) {
            AssetMgr.decAssetRef(asset);
        }
        this.cache.delete(cacheKey);
    }
}
