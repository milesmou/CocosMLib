import { Asset } from "cc";

export class AssetCache {
    public static get Inst() { return createSingleton<AssetCache>(AssetCache); }

    /** 已加载的资源 */
    public loadedAsset: Map<string, Asset> = new Map();

    /** 已预加载的资源 */
    public preloadedAsset: Set<string> = new Set();

    /** 远程资源:依赖的资源 */
    public remoteAssetDepends: Map<Asset, Asset[]> = new Map();

    /** 资源组件加载的资源缓存 */
    public assetCompCache: Map<string, Map<string, Asset>> = new Map();
}