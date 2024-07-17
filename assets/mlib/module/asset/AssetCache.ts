import { Asset } from "cc";

export class AssetCache {

    public static get Inst() { return createSingleton(AssetCache); }
    protected onInst() { }
    public cache: Map<string, Asset> = new Map();
}


