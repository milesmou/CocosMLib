import { _decorator, Asset, Component, ImageAsset, Sprite, SpriteFrame } from "cc";
import { AssetMgr } from "./AssetMgr";

const { ccclass, property } = _decorator;

@ccclass("AssetComponent")
export class AssetComponent extends Component {

    //Location:Asset
    private _cache: Map<string, Asset> = new Map();

    protected onDestroy() {
        // this.decRefCount();
    }

    private decRefCount() {
        this._cache.forEach((v, k) => {
            if (v?.isValid) {
                AssetMgr.decRef(k);
            }
        });
        this._cache.clear();
    }

    public async loadAsset<T extends Asset>(location: string, type: new (...args: any[]) => T, onProgress?: Progress): Promise<T> {
        let cacheKey = AssetMgr.parseLocation(location, type);
        let asset = this._cache.get(cacheKey);
        if (asset?.isValid) return asset as T;
        asset = await AssetMgr.loadAsset(location, type, onProgress);
        if (!this.isValid) {//资源未加载完,界面已被销毁
            // AssetMgr.decRef(cacheKey);  可能引起渲染失败卡死
            return null;
        }
        if (asset?.isValid) this._cache.set(cacheKey, asset);
        return asset as T;
    }

    public async loadRemoteAsset<T extends Asset>(url: string): Promise<T> {
        let asset = this._cache.get(url);
        if (asset?.isValid) return asset as T;
        asset = await AssetMgr.loadRemoteAsset(url);
        if (!this.isValid) {//资源未加载完,界面已被销毁
            // AssetMgr.decRef(url); 可能引起渲染失败卡死
            return null;
        }
        if (asset?.isValid) this._cache.set(url, asset);
        return asset as T;
    }

    public async loadRemoteSpriteFrame(url: string) {
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
    public async loadSprite(sprite: Sprite, location: string) {
        if (!sprite?.isValid) {
            console.error("Sprite无效 " + location);
            return;
        }
        let spFrame: SpriteFrame;
        if (location.startsWith("http") || location.startsWith("/")) {
            spFrame = await this.loadRemoteSpriteFrame(location);
        } else {
            spFrame = await this.loadAsset(location, SpriteFrame);
        }
        if (!sprite?.isValid) {
            console.warn("Sprite已销毁 " + location);
            return;
        }
        if (!spFrame) return;
        sprite.spriteFrame = spFrame;
    }

    /** 
     * 让资源引用计数减少 (注意精灵和纹理需要使用完整路径)
     */
    public decRef(location: string) {
        if (this._cache.has(location)) {
            this._cache.delete(location);
            AssetMgr.decRef(location, 1);
        }
    }
}
