import { Asset } from "cc";

export class AssetCache {
    public static get Inst() { return createSingleton<AssetCache>(AssetCache); }

    public loadedAsset: Map<string, Asset> = new Map();
    
    public preloadedAsset: Set<string> = new Set();
}