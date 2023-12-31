import {Animation, Asset, ImageAsset, Node, Sprite, SpriteFrame } from "cc";
import { AssetMgr } from "./AssetMgr";

/** 资源加载 绑定节点销毁时会自动释放加载的资源 */
export class AssetHandler {

    constructor(node: Node) {
        node.on(Node.EventType.NODE_DESTROYED, this.onDestroy, this);
    }

    //Location:Asset
    private cache: Map<string, Asset> = new Map();

    private onDestroy() {
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