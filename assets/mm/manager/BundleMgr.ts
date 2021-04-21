export enum BundleKey {
    HUD = "hud",
    Map = "map"
}

export class BundleMgr {
    private constructor() { }
    private static inst: BundleMgr = null;
    public static get Inst() { return this.inst || (this.inst = new BundleMgr()) }

    private bundle: Map<BundleKey, cc.AssetManager.Bundle> = new Map();

    public getBundle(bundleKey: BundleKey) {
        return this.bundle.get(bundleKey);
    }

    public loadBundle(bundleKey: BundleKey, onFileProgress?: (loaded: number, total: number) => void) {
        let p = new Promise<cc.AssetManager.Bundle>((resolve, reject) => {
            cc.assetManager.loadBundle(BundleKey[bundleKey],
                { onFileProgress: onFileProgress },
                (err, bundle) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        this.bundle.set(bundleKey, bundle);
                        resolve(bundle);
                    }
                }
            )
        })
        return p;
    }

    public loadAllBundle(onFileProgress?: (loaded: number, total: number) => void) {
        let p = new Promise<cc.AssetManager.Bundle[]>((resolve, reject) => {
            let bundleCount = 0;
            let progress = {};
            let bundleArr = [];
            for (const key in BundleKey) {
                progress[key] = 0;
                bundleCount++;
            }
            for (const key in BundleKey) {
                let bundleName = BundleKey[key];
                cc.assetManager.loadBundle(bundleName,
                    {
                        onFileProgress: (loaded: number, total: number) => {
                            if (onFileProgress) {
                                progress[key] = loaded / total;
                                let totalProgress = 0;
                                for (const k in progress) {
                                    totalProgress += progress[k];
                                }
                                onFileProgress(totalProgress / bundleCount, 1);
                            }
                        }
                    },
                    (err, bundle) => {
                        if (err) {
                            console.log(err);
                            reject(err)
                        } else {
                            bundleArr.push(bundle);
                            this.bundle.set(bundleName, bundle);
                            if (bundleArr.length == bundleCount) {
                                resolve(bundleArr);
                            }
                        }
                    }
                )
            }
        })
        return p;
    }
}