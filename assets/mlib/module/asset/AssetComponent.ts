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

    async loadAsset<T extends Asset>(location: string, type: new (...args: any[]) => T): Promise<T> {
        let asset = this._cache.get(location);
        if (asset?.isValid) return asset as T;
        asset = await AssetMgr.loadAsset<T>(location, type);
        if (asset?.isValid) this._cache.set(location, asset);
        return asset as T;
    }

    async loadRemoteAsset<T extends Asset>(url: string): Promise<T> {
        let asset = this._cache.get(url);
        if (asset?.isValid) return asset as T;
        asset = await AssetMgr.loadRemoteAsset<T>(url);
        if (asset?.isValid) this._cache.set(url, asset);
        return asset as T;
    }

    async loadRemoteSpriteFrame(url: string) {
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
    async loadSprite(sprite: Sprite, location: string) {
        if (!sprite?.isValid) {
            console.error("Sprite无效 " + location);
            return;
        }
        if (location.startsWith("http") || location.startsWith("/")) {
            let spFrame = await this.loadRemoteSpriteFrame(location);
            sprite.spriteFrame = spFrame;
        } else {
            let spFrame = await this.loadAsset<SpriteFrame>(location, SpriteFrame);
            sprite.spriteFrame = spFrame;
        }
    }
}
