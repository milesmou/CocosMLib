import { Asset, Component, ImageAsset, Sprite, SpriteFrame, _decorator } from "cc";
import { AssetMgr } from "../manager/AssetMgr";
import { AutoBindProperty } from "./AutoBindProperty";

const { ccclass } = _decorator;

@ccclass('AssetHandler')
export class AssetHandler extends AutoBindProperty {

    //Location:Asset
    private cache: Map<string, Asset> = new Map();

    protected onDestroy() {
        this.decRefCount();
    }

    private decRefCount() {
        this.cache.forEach((v, k) => {
            if (v?.isValid) AssetMgr.DecRef(k, 1);
        });
    }

    async loadAsset<T extends Asset>(location: string, type?: new (...args: any[]) => T): Promise<T> {
        let asset = this.cache.get(location);
        if (asset?.isValid) return asset as T;
        asset = await AssetMgr.loadAsset<T>(location, type);
        if (asset?.isValid) this.cache.set(location, asset);
        return asset as T;
    }

    async loadRemoteAsset<T extends Asset>(url: string): Promise<T> {
        let asset = this.cache.get(url);
        if (asset?.isValid) return asset as T;
        asset = await AssetMgr.loadRemoteAsset<T>(url);
        if (asset?.isValid) this.cache.set(url, asset);
        return asset as T;
    }

    async loadSpriteFrame(location: string) {
        return await this.loadAsset<SpriteFrame>(location, SpriteFrame);
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
            let spFrame = await this.loadSpriteFrame(location);
            sprite.spriteFrame = spFrame;
        }
    }
}