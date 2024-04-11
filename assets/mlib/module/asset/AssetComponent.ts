import { _decorator, Asset, Component, ImageAsset, Sprite, SpriteFrame } from "cc";
import { AssetMgr } from "./AssetMgr";

const { ccclass, property } = _decorator;

@ccclass("AssetComponent")
export class AssetComponent extends Component {

    //Location:Asset
    private _cache: Map<string, Asset> = new Map();

    protected onDestroy() {
        this.decRefCount();
    }

    private decRefCount() {
        this._cache.forEach((v, k) => {
            if (v?.isValid) {
                let location = AssetMgr.parseLocation(k, v)
                AssetMgr.DecRef(location, 1);
            }
        });
    }

    public async loadAsset<T extends Asset>(location: string, type: new (...args: any[]) => T): Promise<T> {
        let asset = this._cache.get(location);
        if (asset?.isValid) return asset as T;
        asset = await AssetMgr.loadAsset<T>(location, type);
        if (asset?.isValid) this._cache.set(location, asset);
        if (!this.isValid) {
            this.decRef(location);
            return null;
        }
        return asset as T;
    }

    public async loadRemoteAsset<T extends Asset>(url: string): Promise<T> {
        let asset = this._cache.get(url);
        if (asset?.isValid) return asset as T;
        asset = await AssetMgr.loadRemoteAsset<T>(url);
        if (asset?.isValid) this._cache.set(url, asset);
        if (!this.isValid) {
            this.decRef(url);
            return null;
        }
        return asset as T;
    }

    public async loadRemoteSpriteFrame(url: string) {
        let img = await this.loadRemoteAsset<ImageAsset>(url);
        if (img) {
            return SpriteFrame.createWithImage(img as ImageAsset);
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
            spFrame = await this.loadAsset<SpriteFrame>(location, SpriteFrame);
        }
        if (!this.isValid) return;
        sprite.spriteFrame = spFrame;
    }

    /** 让资源引用计数减少 */
    public decRef(location: string) {
        if (this._cache.has(location)) {
            location = AssetMgr.parseLocation(location, this._cache.get(location));
            this._cache.delete(location);
            AssetMgr.DecRef(location, 1);
        }
    }
}
