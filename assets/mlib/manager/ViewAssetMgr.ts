import { Asset, Sprite } from "cc";
import { app } from "../App";

export class ViewAssetMgr {

    static async loadAsset<T extends Asset>(uiName: string, location: string, type?: new (...args: any[]) => T) {
        return await app.ui.getUI(uiName).loadAsset<T>(location, type);
    }

    static async loadRemoteAsset<T extends Asset>(uiName: string, url: string): Promise<T> {
        return await app.ui.getUI(uiName).loadRemoteAsset<T>(url);
    }

    static async loadSpriteFrame(uiName: string, location: string) {
        return await app.ui.getUI(uiName).loadSpriteFrame(location);
    }

    static async loadRemoteSpriteFrame(uiName: string, url: string) {
        return await app.ui.getUI(uiName).loadRemoteSpriteFrame(url);
    }
    
    static async loadSprite(uiName: string, sprite: Sprite, location: string) {
        return await app.ui.getUI(uiName).loadSprite(sprite, location);
    }
}