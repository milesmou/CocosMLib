import { Asset } from "cc";
import { SingletonFactory } from "../../utils/SingletonFactory";

export class AssetCache {
    public static get Inst() { return SingletonFactory.getInstance<AssetCache>(AssetCache); }
    public cache: Map<string, Asset> = new Map();
}