import { Asset } from "cc";

export class AssetCache {
    public static get Inst() { return createSingleton<AssetCache>(AssetCache); }
    public cache: Map<string, Asset> = new Map();
}